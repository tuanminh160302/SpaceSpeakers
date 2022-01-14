import { useEffect, useState, Fragment, useCallback } from 'react'
import './profile.styles.scss'
import { connect } from 'react-redux'
import { showPreloader } from '../../redux/preloader/show-preloader.actions'
import { useNavigate, useLocation } from 'react-router'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { ReactComponent as EmailSVG } from '../../assets/email.svg'
import UserPost from '../../components/user-post/user-post.component'
import { useDropzone } from 'react-dropzone'
import { ReactComponent as EditSVG } from '../../assets/edit.svg'
import CropperComponent from '../../components/cropper/cropper.component'
import { setCropper, getCropImage } from '../../redux/cropImage/cropImage.actions'
import { uploadUserAvatar } from '../../firebase/firebase.init'

const Profile = ({ setshowPreloader, cropImage, showCropper, setCropper, getCropImage }) => {

    const db = getFirestore()
    const auth = getAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [profileDetails, setProfileDetails] = useState([])
    const [allPosts, setAllPosts] = useState([])
    const [editProfileRights, setEditProfileRights] = useState()
    const [showChangeAvt, setShowChangeAvt] = useState(false)
    const [cropperSrc, setCropperSrc] = useState()
    const [file, setFile] = useState(null)

    //get profile data
    useEffect(async () => {
        const tempUID = location.pathname.slice(location.pathname.indexOf('_') + 1)
        const userRef = doc(db, 'users', tempUID)
        const postRef = doc(db, 'posts', tempUID)
        await getDoc(userRef).then((snapshot) => {
            const data = snapshot.data()
            // Set edit profile rights
            if (auth.currentUser.uid === data.uid) {
                setEditProfileRights(true)
            } else {
                setEditProfileRights(false)
            }
            setProfileDetails([data.uid, data.username, data.avatarURL, data.signupemail, data.bio, data.postCount])
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
    }, [location, auth])

    useEffect(() => {
        setFile(cropImage)
    }, [cropImage])

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
                    timestamp={timeSpan} />
            </Fragment>
        )
    })

    const handleExitChangeAvt = () => {
        setShowChangeAvt(false)
        setCropper(false)
        setFile(null)
        getCropImage(null)
    }

    const handleChangeAvt = () => {
        setShowChangeAvt(true)
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
        const fileName = auth.currentUser.uid

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
                const user = auth.currentUser
                uploadUserAvatar(user, fileToUpload)
            })
    }

    return (
        <div className='profile-container'>
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
            <div className='dashboard'>
                <div className='user-avt'>
                    <img src={profileDetails[2]} alt="" />
                    {
                        editProfileRights ? <p className='change-avt' onClick={() => { handleChangeAvt() }}>Upload</p> : null
                    }
                </div>
                <div className='user-details'>
                    <p className='username'>
                        {profileDetails[1]}
                        <EditSVG className='edit-details' />
                    </p>
                    <div className='email-container'>
                        <EmailSVG className='email-svg' />
                        <p className='email'>{profileDetails[3]}</p>
                    </div>
                    <p className='bio'>{profileDetails[4]}</p>
                </div>
                <div className='user-stats'></div>
            </div>
            {posts}
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