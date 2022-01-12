import { useEffect, useState, useRef } from 'react';
import './header.styles.scss';
import { useNavigate, useLocation } from 'react-router';
import { connect } from 'react-redux';
import { setSignInState } from '../../redux/signInState/signInState.actions';
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import {ReactComponent as SignOut} from '../../assets/signout.svg'
import gsap from 'gsap';

const Header = ({ isSignedIn, setSignInState }) => {

    const db = getFirestore()
    const navigate = useNavigate()
    const location = useLocation()
    let pathname = location.pathname
    const auth = getAuth()
    const [avatarURL, setAvatarURL] = useState(undefined)
    const userNavRef = useRef()
    const [toggleUserNav, setToggleUserNav] = useState(false)

    useEffect(() => {
        pathname = location.pathname
    }, [location])

    useEffect(() => {
        if (!isSignedIn) return
        onAuthStateChanged(auth, (user) => {
            if (user) {
                const {uid} = user
                const userRef = doc(db, 'users', uid)
                getDoc(userRef).then((snapshot) => {
                    const data = snapshot.data()
                    if (data.avatarURL) {
                        setAvatarURL(data.avatarURL)
                    }
                })
            }
        })
    }, [isSignedIn])

    const handleRedirectSearch = () => {
        if (pathname !== '/search') navigate('/search')
    }

    const handleRedirectHome = () => {
        if (pathname !== '/') navigate('/')
    }

    const handleRedirectLogin = () => {
        if (pathname !== '/login') navigate('/login')
    }

    const handleRedirectAbout = () => {
        if (pathname !== '/about') navigate('/about')
    }

    const handleSignOut = () => {
        const auth = getAuth();
        signOut(auth).then(() => {
            // Sign-out successful.
            setSignInState(false)
        }).catch((error) => {
            console.log(error)
        });
        setToggleUserNav(false)
    }

    const handleToggleUserNav = () => {
        if (!toggleUserNav) {
            gsap.to(userNavRef.current, {x: 0, ease: 'power4.inOut'})
            setToggleUserNav(true)
        } else {
            gsap.to(userNavRef.current, {x: '150px', ease: 'power4.inOut'})
            setToggleUserNav(false)
        }
    }

    return (
        <div className='header'>
            <p className='logo'>SpaceSpeakers</p>
            <div className='nav-bar'>
                <p className='nav-item' onClick={() => { handleRedirectHome() }}>Home</p>
                <p className='nav-item' onClick={() => { handleRedirectSearch() }}>Search</p>
                <p className='nav-item' onClick={() => { handleRedirectAbout() }}>About</p>
                {
                    !isSignedIn ?
                        <p className='nav-item' onClick={() => { handleRedirectLogin() }}>Login</p> :
                        <div className='user-nav-container'>
                            <img className='avt' src={avatarURL} alt="" onClick={() => {handleToggleUserNav()}}/>
                            <div className='user-nav' ref={userNavRef}>
                                <img className='profile' src={avatarURL} alt="" />
                                <SignOut className='signout' onClick={() => {handleSignOut()}}/>
                            </div>
                        </div>
                        // <p className='nav-item' onClick={() => { handleSignOut() }}>Logout</p>
                }
            </div>
        </div>
    )
}

const mapStateToProps = ({ isSignedIn }) => ({
    isSignedIn: isSignedIn.isSignedIn
})

const mapDispatchToProps = (dispatch) => ({
    setSignInState: (boolean) => { dispatch(setSignInState(boolean)) }
})

export default connect(mapStateToProps, mapDispatchToProps)(Header);