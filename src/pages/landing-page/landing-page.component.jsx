import { useEffect, useState } from 'react';
import './landing-page.styles.scss';
import { ReactComponent as LandingSVG } from '../../assets/landing.svg'
import { ReactComponent as LaunchSVG } from '../../assets/launch.svg'
import { ReactComponent as MySpaceSVG } from '../../assets/mySpace.svg'
import { ReactComponent as StarsSVG } from '../../assets/stars.svg'
import { connect } from 'react-redux';
import { showPreloader } from '../../redux/preloader/show-preloader.actions';
import { useNavigate } from 'react-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getTargetUsername } from '../../firebase/firebase.init';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';

const LandingPage = ({showPreloader, setShowPreloader}) => {

    const auth = getAuth()
    const navigate = useNavigate()
    const db = getFirestore()
    const [username, setUsername] = useState()
    const [uid, setUid] = useState()

    useEffect(() => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                await getTargetUsername(user.uid).then((res) => {
                    if (res) {
                        setUsername(res)
                        setUid(auth.currentUser.uid)
                        setTimeout(() => {
                            setShowPreloader(false)
                        }, 500)
                    } else {
                        const unsub = onSnapshot(doc(db, 'users', user.uid), (doc) => {
                            const data = doc.data()
                            if (data) {
                                if (data.uid) {
                                    setTimeout(() => {
                                        setShowPreloader(false)
                                    }, 500)
                                }
                            }
                        })
                    }
                })
            } else {
                setTimeout(() => {
                    setShowPreloader(false)
                }, 500)
            }
        })
    }, [auth])

    return (
        <div className='landing'>
            <div className='intro'>
                <div className='intro-content'>
                    <p className='title'>SpaceSpeakers</p>
                    <p className='description'>A place for space lovers. You can see all images from NASA. You can tell your friends what you think about an image that you love. You can do so much more...</p>
                    <button className='explore' onClick={() => {navigate('/search')}}>Explore</button>
                </div>
                <LandingSVG className='intro-svg'/>
            </div>
            <div className='content-container'>
                <div className='panel'>
                    <p className='panel-text'>Search for images across the universe (brougt to you by NASA Image and Video Library)</p>
                    <LaunchSVG className='panel-svg'/>
                    <a className='panel-button' href='/search'>Search</a>
                </div>
                <div className='panel'>
                    <p className='panel-text'>You can find other users/keywords to search for. (For mobile device: Access to search bar by open menu)</p>
                    <StarsSVG className='panel-svg'/>
                    <a className='panel-button' href='/search-data-field=nasa'>Find</a>
                </div>
                <div className='panel'>
                    <p className='panel-text'>Share an image and let your friends know what you think</p>
                    <MySpaceSVG className='panel-svg'/>
                    <a className='panel-button' href={`/users/${username}_${uid}`}>{uid ? 'My Profile' : 'Sign In'}</a>
                </div>
            </div>
            <a className='nasa-redirect' href='https://www.shopify.com/' target='_blank'>Merch by Spacespeakers</a>
        </div>
    )
}

const mapStateToProps = ({showPreloader}) => ({
    showPreloader: showPreloader.showPreloader
})

const mapDispatchToProps = (dispatch) => ({
    setShowPreloader: (boolean) => {dispatch(showPreloader(boolean))}
})

export default connect(mapStateToProps, mapDispatchToProps)(LandingPage);