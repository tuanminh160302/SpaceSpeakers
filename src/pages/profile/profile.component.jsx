import { useEffect, useState, Fragment } from 'react'
import './profile.styles.scss'
import { connect } from 'react-redux'
import { showPreloader } from '../../redux/preloader/show-preloader.actions'
import { useNavigate, useLocation } from 'react-router'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { ReactComponent as EmailSVG } from '../../assets/email.svg'
import UserPost from '../../components/user-post/user-post.component'

const Profile = ({ setshowPreloader }) => {

    const db = getFirestore()
    const navigate = useNavigate()
    const location = useLocation()
    const [profileDetails, setProfileDetails] = useState([])
    const [allPosts, setAllPosts] = useState([])

    //get profile data
    useEffect(() => {
        const tempUID = location.pathname.slice(location.pathname.indexOf('_') + 1)
        const userRef = doc(db, 'users', tempUID)
        const postRef = doc(db, 'posts', tempUID)
        getDoc(userRef).then((snapshot) => {
            const data = snapshot.data()
            setProfileDetails([data.uid, data.username, data.avatarURL, data.signupemail, data.bio, data.postCount])
        })
        getDoc(postRef).then((snapshot) => {
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
    }, [location])

    useEffect(() => {
        setTimeout(() => {
            setshowPreloader(false)
        }, 500)
    })

    const posts = allPosts.map((post, index) => {
        const postImgURL = Object.values(post)[0].imageURL
        const postCaption = Object.values(post)[0].caption
        const imgTitle = Object.values(post)[0].imageTitle
        const postKey = Object.keys(post)[0]
        console.log(profileDetails[0], '=>', profileDetails[1])
        return (
            <Fragment key={index}>
                <UserPost
                    postImg={postImgURL}
                    userAvt={profileDetails[2]}
                    caption={postCaption}
                    imgTitle={imgTitle}
                    postOfUser={profileDetails[0]}
                    postKey={postKey} 
                    userName={profileDetails[1]}
                    showAllComment={false}/>
            </Fragment>
        )
    })

    return (
        <div className='profile-container'>
            <div className='dashboard'>
                <div className='user-avt'>
                    <img src={profileDetails[2]} alt="" />
                </div>
                <div className='user-details'>
                    <p className='username'>{profileDetails[1]}</p>
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

const mapDispatchToProps = (dispatch) => ({
    setshowPreloader: (boolean) => { dispatch(showPreloader(boolean)) }
})

export default connect(null, mapDispatchToProps)(Profile)