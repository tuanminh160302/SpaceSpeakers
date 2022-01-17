import { useEffect } from 'react';
import './landing-page.styles.scss';
import { ReactComponent as LandingSVG } from '../../assets/landing.svg'
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

    useEffect(() => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                await getTargetUsername(user.uid).then((res) => {
                    if (res) {
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
                    <p className='title'>Let's be honest</p>
                    <p className='description'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
                    <button className='explore' onClick={() => {navigate('/search')}}>Explore</button>
                </div>
                <LandingSVG className='intro-svg'/>
            </div>
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