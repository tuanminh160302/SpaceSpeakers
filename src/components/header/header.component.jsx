import { useEffect, useState, useRef } from 'react';
import './header.styles.scss';
import { useNavigate, useLocation } from 'react-router';
import { connect } from 'react-redux';
import { setSignInState } from '../../redux/signInState/signInState.actions';
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { ReactComponent as SignOut} from '../../assets/signout.svg'
import { getTargetUserUID } from '../../firebase/firebase.init';
import { ReactComponent as SearchSVG } from '../../assets/search.svg' 
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
    const [username, setUsername] = useState(null)
    const [searchValue, setSearchValue] = useState('')
    // const [unsubCondition, setUnsubCondition] = useState(false)

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
                    if (snapshot.data()) {
                        const data = snapshot.data()
                        setUsername(data.username)
                        setAvatarURL(data.avatarURL)
                    }
                })
            }
        })
    }, [isSignedIn, auth, location])

    const handleRedirectSearch = () => {
        gsap.to(userNavRef.current, {duration: 0, x: '150px'})
        setToggleUserNav(false)
    }

    const handleRedirectHome = () => {
        gsap.to(userNavRef.current, {duration: 0, x: '150px'})
        setToggleUserNav(false)
    }

    const handleRedirectLogin = () => {
        if (pathname !== '/login') {
            navigate('/login')
            gsap.to(userNavRef.current, {duration: 0, x: '150px'})
            setToggleUserNav(false)
        }
    }

    const handleRedirectAbout = () => {
        if (pathname !== '/about') {
            navigate('/about')
            gsap.to(userNavRef.current, {duration: 0, x: '150px'})
            setToggleUserNav(false)
        }
    }

    const handleRedirectProfile = async () => {
        await getTargetUserUID(username).then((uid) => {
            if (pathname !== `/users/${username}_${uid}`) {
                navigate(`/users/${username}_${uid}`)
                gsap.to(userNavRef.current, {duration: 0, x: '150px'})
                setToggleUserNav(false)
            }
        })
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
        setUsername(null)
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

    const handleInputChange = (e) => {
        e.preventDefault()
        setSearchValue(e.target.value)
    }

    const handleHeaderSearch = (e) => {
        e.preventDefault()

        navigate(`/search-data-field=${searchValue}`)
    }

    return (
        <div className='header'>
            <p className='logo'>SpaceSpeakers</p>
            <form className='header-search-container' onSubmit={(e) => {handleHeaderSearch(e)}}>
                <input className='header-search-input' type="text" required placeholder='Search user or keyword...' value={searchValue} onChange={(e) => {handleInputChange(e)}}/>
                <button className='search-btn'><SearchSVG className='search-svg'/></button>
            </form>
            <div className='nav-bar'>
                <a className='nav-item' onClick={() => { handleRedirectHome() }} href='/'>Home</a>
                <a className='nav-item' onClick={() => { handleRedirectSearch() }} href='/search'>Search</a>
                {/* <p className='nav-item' onClick={() => { handleRedirectAbout() }}>About</p> */}
                {
                    !isSignedIn ?
                        <p className='nav-item' onClick={() => { handleRedirectLogin() }}>Login</p> :
                        <div className='user-nav-container'>
                            <img className='avt' src={avatarURL} alt="" onClick={() => {handleToggleUserNav()}}/>
                            <div className='user-nav' ref={userNavRef}>
                                <img className='profile' src={avatarURL} alt="" onClick={() => [handleRedirectProfile()]}/>
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