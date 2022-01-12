import { useEffect, useState, Fragment } from 'react'
import './profile.styles.scss'
import { connect } from 'react-redux'
import { showPreloader } from '../../redux/preloader/show-preloader.actions'
import { useNavigate, useLocation } from 'react-router'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { ReactComponent as EmailSVG } from '../../assets/email.svg'
import UserPost from '../../components/user-post/user-post.component'

const Profile = ({setshowPreloader}) => {

    const db = getFirestore()
    const navigate = useNavigate()
    const location = useLocation()
    const [profileDetails, setProfileDetails] = useState([])

    useEffect(() => {
        const tempUID = location.pathname.slice(location.pathname.indexOf('_') + 1)
        const userRef = doc(db, 'users', tempUID)
        getDoc(userRef).then((snapshot) => {
            const data = snapshot.data()
            setProfileDetails([data.uid, data.username, data.avatarURL, data.signupemail, data.bio, data.postCount])
        })
    }, [])

    useEffect(() => {
        setTimeout(() => {
            setshowPreloader(false)
        }, 500)
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
                        <EmailSVG className='email-svg'/>
                        <p className='email'>{profileDetails[3]}</p>
                    </div>
                    <p className='bio'>{profileDetails[4]}</p>
                </div>
                <div className='user-stats'></div>
            </div>
            {/* {posts} */}
        </div>
    )
}

const mapDispatchToProps = (dispatch) => ({
    setshowPreloader: (boolean) => {dispatch(showPreloader(boolean))}
})

export default connect(null, mapDispatchToProps)(Profile)