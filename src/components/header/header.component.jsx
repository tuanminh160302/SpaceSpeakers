import { useEffect, useState, useRef, Fragment } from 'react';
import './header.styles.scss';
import { useNavigate, useLocation } from 'react-router';
import { connect } from 'react-redux';
import { setSignInState } from '../../redux/signInState/signInState.actions';
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { ReactComponent as SignOut } from '../../assets/signout.svg'
import { getTargetUserUID } from '../../firebase/firebase.init';
import { ReactComponent as SearchSVG } from '../../assets/search.svg'
import { pullSearchHistory, pushSearchHistory } from '../../firebase/firebase.init';
import SearchHistoryComponent from '../search-history/search-history.component';
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
    const [currentUser, setCurrentUser] = useState(null)
    const [searchHistory, setSearchHistory] = useState([])
    const [showSearchHistory, setShowSearchHistory] = useState(false)

    useEffect(() => {
        pathname = location.pathname
        gsap.to(userNavRef.current, { duration: 0, x: '150px' })
        setToggleUserNav(false)
    }, [location])

    useEffect(async () => {
        if (currentUser) {
            await fetchSearchHistory()
        }
    }, [currentUser, location, searchHistory.length])

    useEffect(() => {
        if (!isSignedIn) return
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(auth.currentUser)
                const { uid } = user
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

    }

    const handleRedirectHome = () => {

    }

    const handleRedirectLogin = () => {

    }

    const handleRedirectAbout = () => {

    }

    const handleRedirectProfile = async () => {
        await getTargetUserUID(username).then((uid) => {
            if (pathname !== `/users/${username}_${uid}`) {
                navigate(`/users/${username}_${uid}`)
                gsap.to(userNavRef.current, { duration: 0, x: '150px' })
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
            gsap.to(userNavRef.current, { x: 0, ease: 'power4.inOut' })
            setToggleUserNav(true)
        } else {
            gsap.to(userNavRef.current, { x: '150px', ease: 'power4.inOut' })
            setToggleUserNav(false)
        }
    }

    const handleInputChange = (e) => {
        e.preventDefault()
        setSearchValue(e.target.value)
    }

    const handleHeaderSearch = async (e) => {
        e.preventDefault()
        await pushSearchHistory(currentUser, searchValue, new Date().getTime())
        setSearchValue('')
        navigate(`/search-data-field=${searchValue}`)
    }

    const fetchSearchHistory = async () => {
        let LOCAL_SEARCH_HISTORY = []
        await pullSearchHistory(currentUser).then((res) => {
            if (res) {
                const searchHistoryKey = Object.keys(res)
                searchHistoryKey.sort((a, b) => a > b ? -1 : 1)
                searchHistoryKey.map((timestamp) => {
                    const searchItemRes = [timestamp, res[timestamp]]
                    LOCAL_SEARCH_HISTORY.push(searchItemRes)
                })
            }
        })
        setSearchHistory(LOCAL_SEARCH_HISTORY)
    }

    const searchHistoryComponent = searchHistory.map(([timestamp, searchItem], index) => {
        return (
            <Fragment key={index}>
                <SearchHistoryComponent
                    timestamp={timestamp}
                    searchItem={searchItem}
                    fetchSearchHistory={fetchSearchHistory}/>
            </Fragment>
        )
    })

    document.addEventListener(('click'), (e) => {
        if (e.target.nodeName !== 'path' && e.target.nodeName !== 'svg') {
            const clickTarget = e.target.className.split(" ")[0]
            if (clickTarget !== "search-history-container" && clickTarget !== "header-search-input" && clickTarget !== "search-history") {
                setShowSearchHistory(false)
            }
        }
    })

    return (
        <div className='header'>
            <p className='logo'>SpaceSpeakers</p>
            <form className='header-search-container' onSubmit={(e) => { handleHeaderSearch(e) }}>
                <input className='header-search-input' type="text" required placeholder='Search user or keyword...' value={searchValue} onChange={(e) => { handleInputChange(e) }}
                    onFocus={() => { searchHistory.length && setShowSearchHistory(true) }} />
                <button className='search-btn'><SearchSVG className='search-svg' /></button>
                {
                    searchHistory.length ? showSearchHistory ?
                        <div className='search-history-container'>
                            {searchHistoryComponent}
                        </div> : null : null
                }
            </form>
            <div className='nav-bar'>
                <a className='nav-item' onClick={() => { handleRedirectHome() }} href='/'>Home</a>
                <a className='nav-item' onClick={() => { handleRedirectSearch() }} href='/search'>Search</a>
                <a className='nav-item' onClick={() => { handleRedirectAbout() }} href='/about'>About</a>
                {
                    !isSignedIn ?
                        <a className='nav-item' onClick={() => { handleRedirectLogin() }} href='/login'>Login</a> :
                        <div className='user-nav-container'>
                            <img className='avt' src={avatarURL} alt="" onClick={() => { handleToggleUserNav() }} />
                            <div className='user-nav' ref={userNavRef}>
                                <img className='profile' src={avatarURL} alt="" onClick={() => [handleRedirectProfile()]} />
                                <SignOut className='signout' onClick={() => { handleSignOut() }} />
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