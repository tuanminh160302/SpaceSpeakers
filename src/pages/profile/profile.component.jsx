import { useEffect, useState, Fragment, useCallback } from 'react'
import './profile.styles.scss'
import { connect } from 'react-redux'
import { showPreloader } from '../../redux/preloader/show-preloader.actions'
import { useNavigate, useLocation } from 'react-router'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { ReactComponent as EmailSVG } from '../../assets/email.svg'
import UserPost from '../../components/user-post/user-post.component'
import { useDropzone } from 'react-dropzone'
import { ReactComponent as EditSVG } from '../../assets/edit.svg'
import { ReactComponent as NotFoundSVG } from '../../assets/not-found.svg'
import { ReactComponent as UnauthSVG } from '../../assets/unauth.svg'
import CropperComponent from '../../components/cropper/cropper.component'
import { setCropper, getCropImage } from '../../redux/cropImage/cropImage.actions'
import { useHandleViewFullPost, useViewFullPost } from './profile.utils'
import { uploadUserAvatar, editUserDetails, getTargetUsername, followAction } from '../../firebase/firebase.init'
import UserSnippet from '../../components/user-snippet/user-snippet.component'

const Profile = ({ setshowPreloader, cropImage, showCropper, setCropper, getCropImage }) => {

    const db = getFirestore()
    const auth = getAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [foundProfile, setFoundProfile] = useState(false)
    const [profileDetails, setProfileDetails] = useState([])
    const [allPosts, setAllPosts] = useState([])
    const [editProfileRights, setEditProfileRights] = useState()
    const [showChangeAvt, setShowChangeAvt] = useState(false)
    const [cropperSrc, setCropperSrc] = useState()
    const [file, setFile] = useState(null)
    const [showEditProfileDetails, setShowEditProfileDetails] = useState()
    const [currentUser, setCurrentUser] = useState(null)
    const [editUsernameInput, setEditUsernameInput] = useState('')
    const [editBioInput, setEditBioInput] = useState('')
    const [follower, setFollower] = useState([])
    const [following, setFollowing] = useState([])
    const [isFollow, setIsFollow] = useState()
    const [showFollower, setShowFollower] = useState(false)
    const [showFollwing, setShowFollowing] = useState(false)
    const [showSocial, setShowSocial] = useState(false)
    const [fullPost, setFullPost] = useState(null)

    const [viewFullPost, setViewFullPost] = useViewFullPost(location)

    useEffect(() => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(auth.currentUser)
            } else {
                setCurrentUser(null)
                console.log('set user to null')
            }
        })
    }, [auth])

    //get profile data
    useEffect(async () => {
        const tempUID = location.pathname.slice(location.pathname.lastIndexOf('_') + 1)
        const tempUsername = location.pathname.slice(7, location.pathname.lastIndexOf('_'))
        const targetUsername = await getTargetUsername(tempUID)

        if (tempUID.includes('/')) {
            setFoundProfile(false)
        } else if (targetUsername === tempUsername) {
            setFoundProfile(true)
        } else {
            setFoundProfile(false)
        }

        if (currentUser && foundProfile) {
            await fetchPost()
        } else {
            setTimeout(() => {
                setshowPreloader(false)
            }, 500)
        }
        await fetchSocialStatus()
        setShowSocial(false)
    }, [currentUser, location, foundProfile])

    useEffect(() => {
        setFile(cropImage)
    }, [cropImage])

    const fetchPost = async () => {
        const tempUID = location.pathname.slice(location.pathname.lastIndexOf('_') + 1)
        const userRef = doc(db, 'users', tempUID)
        const postRef = doc(db, 'posts', tempUID)
        await getDoc(userRef).then((snapshot) => {
            const data = snapshot.data()
            // Set edit profile rights
            if (currentUser.uid === data.uid) {
                setEditProfileRights(true)
            } else {
                setEditProfileRights(false)
            }
            setProfileDetails([data.uid, data.username, data.avatarURL, data.signupemail, data.bio, data.postCount])
            setEditUsernameInput(data.username)
            setEditBioInput(data.bio)
        })
        await getDoc(postRef).then((snapshot) => {
            if (!snapshot.data()) {
                setAllPosts([])
            } else {
                const data = snapshot.data()
                const allResult = []
                const allPostKey = Object.keys(data)
                allPostKey.map((postKey, index) => {
                    const post = { [postKey]: data[postKey] }
                    allResult.push(post)
                })
                allResult.sort((a, b) => (Object.keys(a) > Object.keys(b) ? -1 : 1))
                setAllPosts(allResult)
            }
        })

        setTimeout(() => {
            setshowPreloader(false)
        }, 500)
    }
    const handleViewFullPost = useHandleViewFullPost(allPosts, UserPost, profileDetails, fetchPost, setFullPost, setViewFullPost)

    const fetchSocialStatus = async () => {
        let followerArray = []
        let followingArray = []
        const tempUID = location.pathname.slice(location.pathname.lastIndexOf('_') + 1)
        const userRef = doc(db, 'users', tempUID)
        await getDoc(userRef).then((snapshot) => {
            const data = snapshot.data()
            const { socialStatus } = data
            // console.log(socialStatus)
            if (socialStatus) {
                const followerObject = socialStatus.follower
                const followingObject = socialStatus.following
                if (followerObject) {
                    const followerKeyArr = Object.keys(followerObject)
                    followerKeyArr.sort((a, b) => followerObject[a][2] > followerObject[b][2] ? -1 : 1)
                    followerKeyArr.map((follower) => {
                        followerArray.push([follower, followerObject[follower]])
                        if (currentUser) {
                            if (followerKeyArr.includes(currentUser.uid)) {
                                setIsFollow(true)
                            } else {
                                setIsFollow(false)
                            }
                        }
                    })
                }
                if (followingObject) {
                    const followingKeyArr = Object.keys(followingObject)
                    followingKeyArr.sort((a, b) => followingObject[a][2] > followingObject[b][2] ? -1 : 1)
                    followingKeyArr.map((following) => {
                        followingArray.push([following, followingObject[following]])
                    })
                }
            }
        })
        setFollower(followerArray)
        setFollowing(followingArray)
    }

    const posts = allPosts.map((post, index) => {
        const timestamp = Object.keys(post)[0]
        const time = new Date(parseInt(timestamp))
        const timeNow = new Date()
        let timeSpan = null
        if (Math.floor((timeNow - time) / 86400000) === 0) {
            timeSpan = String(Math.floor((timeNow - time) / 3600000)) + "h"
        } else if (Math.floor((timeNow - time) / 86400000) !== 0) {
            timeSpan = String(Math.floor((timeNow - time) / 86400000)) + "d"
        }

        const postImgURL = Object.values(post)[0].imageURL
        const postCaption = Object.values(post)[0].caption
        const imgTitle = Object.values(post)[0].imageTitle
        const postKey = Object.keys(post)[0]
        return (
            <Fragment key={index}>
                <UserPost
                    postImg={postImgURL}
                    userAvt={profileDetails[2]}
                    caption={postCaption}
                    imgTitle={imgTitle}
                    postOfUser={profileDetails[0]}
                    postKey={postKey}
                    postUserName={profileDetails[1]}
                    showAllComment={false}
                    timestamp={timeSpan}
                    fetchPost={fetchPost} />
            </Fragment>
        )
    })

    const postSnippet = allPosts.map((post, index) => {

        const postImgURL = Object.values(post)[0].imageURL
        return (
            <div className='post-snippet' key={index}>
                <img className='post-snippet-img' src={postImgURL} alt="" name={index} onClick={(e) => { handleViewFullPost(e) }} />
            </div>
        )
    })

    const handleExitChangeAvt = () => {
        setShowChangeAvt(false)
        setCropper(false)
        setFile(null)
        getCropImage(null)
        document.body.style.overflowY = 'visible'
    }

    const handleEditInputChange = (e) => {
        if (e.target.name === 'username') {
            setEditUsernameInput(e.target.value)
        } else if (e.target.name === 'bio') {
            setEditBioInput(e.target.value)
        }
    }

    const handleExitEditDetails = () => {
        setShowEditProfileDetails(false)
        setEditBioInput(profileDetails[4])
        setEditUsernameInput(profileDetails[1])
        document.body.style.overflowY = 'visible'
    }

    const onDrop = useCallback(acceptedFiles => {
        // Do things with files
        acceptedFiles.forEach((file) => {
            const url = URL.createObjectURL(file)
            Object.assign(file, { preview: url })
            console.log(file.preview)
        })
        setCropperSrc(acceptedFiles[0].preview)
        setCropper(true)
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: 'image/jpeg, image/png',
        onDrop,
        maxFiles: 1
    })

    const handleUploadAvt = () => {
        setshowPreloader(true)
        const fileName = currentUser.uid

        fetch(file)
            .then(async (response) => {
                const contentType = response.headers.get('content-type')
                return [await response.blob(), contentType]
            })
            .then(([blob, contentType]) => {
                console.log('contentType =>', contentType)
                const fileToUpload = new File([blob], fileName, { type: contentType })
                return fileToUpload
            }).then((fileToUpload) => {
                uploadUserAvatar(currentUser, fileToUpload)
            })
    }

    const handleEditDetails = async () => {
        setshowPreloader(true)
        console.log(editUsernameInput === '')
        if (editUsernameInput === '') {
            await editUserDetails(currentUser, profileDetails[1], editBioInput).then(() => {
                navigate(`/users/${profileDetails[1]}_${currentUser.uid}`)
                window.location.reload()
            })
        } else {
            await editUserDetails(currentUser, editUsernameInput, editBioInput).then(() => {
                navigate(`/users/${editUsernameInput}_${currentUser.uid}`)
                window.location.reload()
            })
        }
    }

    const handleFollowAction = async () => {
        followAction(currentUser.uid, profileDetails[0], isFollow).then(() => {
            setIsFollow(!isFollow)
            fetchSocialStatus()
        })
    }

    const handleShowFollower = () => {
        setShowFollower(true)
        setShowSocial(true)
        document.body.style.overflowY = 'hidden'
    }

    const handleExitShowFollower = () => {
        setShowFollower(false)
        setShowSocial(false)
        fetchSocialStatus()
        document.body.style.overflowY = 'visible'
    }

    const handleShowFollowing = () => {
        setShowFollowing(true)
        setShowSocial(true)
        document.body.style.overflowY = 'hidden'
    }

    const handleExitShowFollowing = () => {
        setShowFollowing(false)
        setShowSocial(false)
        fetchSocialStatus()
        document.body.style.overflowY = 'visible'
    }

    const followerComponent = follower.map((person, index) => {

        return (
            <Fragment key={index}>
                <UserSnippet
                    socialType='follower'
                    person={person}
                    handleExitShowFollower={handleExitShowFollower}
                    handleExitShowFollowing={handleExitShowFollowing}
                    fetchSocialStatus={fetchSocialStatus} />
            </Fragment>
        )
    })

    const followingComponent = following.map((person, index) => {
        return (
            <Fragment key={index}>
                <UserSnippet
                    socialType='follower'
                    person={person}
                    handleExitShowFollower={handleExitShowFollower}
                    handleExitShowFollowing={handleExitShowFollowing}
                    fetchSocialStatus={fetchSocialStatus} />
            </Fragment>
        )
    })

    return (
        <div className='profile-container'>
            {
                !currentUser ?
                    <div className='unauth-view'>
                        <UnauthSVG className='unauth-svg' />
                        <a className='unauth' href='/login'>Sign in to view this profile</a>
                    </div>
                    : foundProfile ?
                        <>
                            {
                                showChangeAvt ?
                                    <div className='edit-portal-container'>
                                        <div className='exit-edit-portal' onClick={() => { handleExitChangeAvt() }}></div>
                                        <div className='edit-portal'>
                                            <div className='toolbar'>
                                                <p className='tool' onClick={() => { handleExitChangeAvt() }}>Cancel</p>
                                                {
                                                    file ? <p className='tool' onClick={() => { handleUploadAvt() }}>Upload</p> : null
                                                }
                                            </div>
                                            <div className='drag-drop' {...getRootProps()}>
                                                {isDragActive ?
                                                    <p className='guide'>Drop the files here</p> :
                                                    <p className='guide'>Drag and drop some files here, or click to select files</p>}
                                                <input {...getInputProps()} />
                                            </div>
                                            {
                                                file ? <img className='preview-img' src={file} alt="" /> : null
                                            }
                                            {showCropper ?
                                                <div className='cropper' id='cropper'>
                                                    <CropperComponent src={cropperSrc} />
                                                </div> :
                                                null}
                                        </div>
                                    </div>
                                    : null
                            }
                            {
                                showEditProfileDetails ?
                                    <div className='edit-portal-container'>
                                        <div className='exit-edit-portal' onClick={() => { handleExitEditDetails() }}></div>
                                        <div className='edit-portal'>
                                            <div className='toolbar'>
                                                <p className='tool' onClick={() => { handleExitEditDetails() }}>Cancel</p>
                                                <p className='tool' onClick={() => { handleEditDetails() }}>Edit</p>
                                            </div>
                                            <div className='edit-details'>
                                                <p className='edit-title'>Username</p>
                                                <input className='username-input' type="text" name="username" value={editUsernameInput} onChange={(e) => handleEditInputChange(e)} />
                                                <p className='edit-title'>Biography</p>
                                                <textarea className='bio-input' name="bio" onChange={(e) => handleEditInputChange(e)} defaultValue={profileDetails[4]}></textarea>
                                            </div>
                                        </div>
                                    </div>
                                    : null
                            }
                            {
                                showSocial ?
                                    <div className='social-container'>
                                        <div className='exit-social' onClick={() => showFollower ? handleExitShowFollower() : handleExitShowFollowing()}></div>
                                        <div className='social'>
                                            <p className='social-type'>{showFollower ? 'Follower' : 'Following'}</p>
                                            <div className='person-container'>
                                                {
                                                    showFollower ? followerComponent : followingComponent
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    : null
                            }
                            <div className='dashboard'>
                                <div className='user-avt'>
                                    <img src={profileDetails[2]} alt="" />
                                    {
                                        editProfileRights ? <p className='change-avt' onClick={() => { setShowChangeAvt(true); document.body.style.overflowY = 'hidden' }}>Upload</p> : null
                                    }
                                </div>
                                <div className='user-details'>
                                    <p className='username'>
                                        {profileDetails[1]}
                                        {
                                            editProfileRights ? <EditSVG className='edit-details' onClick={() => { setShowEditProfileDetails(true); document.body.style.overflowY = 'hidden' }} /> : null
                                        }
                                    </p>

                                    <div className='user-stats'>
                                        <p className='stat'>{allPosts.length} Posts</p>
                                        <p className='stat' onClick={() => { handleShowFollowing() }}>{following.length} Following</p>
                                        <p className='stat' onClick={() => { handleShowFollower() }}>{follower.length} Follower</p>
                                        {
                                            currentUser.uid !== profileDetails[0] ?
                                                <button className='follow-btn' onClick={() => { handleFollowAction() }}>{isFollow ? 'Unfollow' : 'Follow'}</button>
                                                : null
                                        }
                                    </div>

                                    <div className='email-container'>
                                        <EmailSVG className='email-svg' />
                                        <p className='email'>{profileDetails[3]}</p>
                                    </div>
                                    <p className='bio'>{profileDetails[4]}</p>
                                </div>
                            </div>
                            <hr className='dashboard-hr' />
                            {/* {posts} */}
                            <div className='post-snippet-container'>
                                {postSnippet}
                            </div>

                            {
                                viewFullPost ?
                                    <div className='full-post-container'>
                                        <div className='exit-full-post' onClick={() => {setViewFullPost(false)}}></div>
                                        <div className='full-post'>
                                            {fullPost}
                                        </div>
                                    </div>
                                    : null
                            }
                        </>
                        :
                        <div className='user-not-found'>
                            <NotFoundSVG className='not-found-svg' />
                            <p className='not-found'>User not found...</p>
                        </div>
            }
        </div>
    )
}

const mapStateToProps = ({ cropImage }) => ({
    cropImage: cropImage.cropImage,
    showCropper: cropImage.showCropper
})

const mapDispatchToProps = (dispatch) => ({
    setshowPreloader: (boolean) => { dispatch(showPreloader(boolean)) },
    setCropper: (boolean) => (dispatch(setCropper(boolean))),
    getCropImage: (cropImage) => (dispatch(getCropImage(cropImage))),
})

export default connect(mapStateToProps, mapDispatchToProps)(Profile)