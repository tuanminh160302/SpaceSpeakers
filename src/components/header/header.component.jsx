import { useEffect, useState, useRef, Fragment } from 'react';
import './header.styles.scss';
import { useNavigate, useLocation } from 'react-router';
import { connect } from 'react-redux';
import { setSignInState } from '../../redux/signInState/signInState.actions';
import { showPreloader } from '../../redux/preloader/show-preloader.actions';
import { getAuth, signOut, onAuthStateChanged, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { ReactComponent as SignOut } from '../../assets/signout.svg'
import { getTargetUserUID } from '../../firebase/firebase.init';
import { ReactComponent as SearchSVG } from '../../assets/search.svg'
import { ReactComponent as SettingsSVG } from '../../assets/settings.svg'
import { pullSearchHistory, pushSearchHistory } from '../../firebase/firebase.init';
import SearchHistoryComponent from '../search-history/search-history.component';
import gsap from 'gsap';

const Header = ({ isSignedIn, setSignInState, setShowPreloader }) => {

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
    const [showSettings, setShowSettings] = useState(false)
    const [showResetPassword, setShowResetPassword] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [resetPasswordInput, setResetPasswordInput] = useState(null)
    const [resetRepasswordInput, setResetRepasswordInput] = useState(null)
    const [reauthenticateEmail, setReauthenticateEmail] = useState(null)
    const [reauthenticatePassword, setReauthenticatePassword] = useState(null)
    const [showReauthenticate, setShowReauthenticate] = useState(false)
    
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

    const handleRedirectProfile = async () => {
        setShowSettings(false)
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
                    fetchSearchHistory={fetchSearchHistory} />
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

    const handleExitResetPassword = () => {
        setShowResetPassword(false)
        setResetPasswordInput(null)
        setResetRepasswordInput(null)
        setAlertMessage()
        document.body.style.overflowY = 'visible'
    }

    const handleResetPasswordInput = (e) => {
        e.preventDefault()

        if (e.target.name === 'reset-password') {
            setResetPasswordInput(e.target.value)
        } else if (e.target.name === 'reset-repassword') {
            setResetRepasswordInput(e.target.value)
        } else if (e.target.name === 'reauthenticate-email') {
            setReauthenticateEmail(e.target.value)
        } else if (e.target.name === 'reauthenticate-password') {
            setReauthenticatePassword(e.target.value)
        }
    }

    const handleExitReauthenticate = () => {
        setShowReauthenticate(false)
        setReauthenticateEmail(null)
        setReauthenticatePassword(null)
        setAlertMessage()
    }

    const handleResetPassword = (e) => {
        e.preventDefault()
        
        if (resetPasswordInput !== resetRepasswordInput) {
            setAlertMessage("Passwords don't match")
            console.log(resetPasswordInput, resetRepasswordInput)
        } else {
            updatePassword(currentUser, resetRepasswordInput).then(() => {
                setShowPreloader(true)
                handleExitResetPassword()
                console.log('updated password')
                setTimeout(() => {
                    setShowPreloader(false)
                }, 700)
            }).catch((err) => {
                console.log(err.code)
                if (err.code === 'auth/weak-password') {
                    setAlertMessage('Password must has at least 6 characters')
                } else if (err.code === 'auth/requires-recent-login') {
                    setShowReauthenticate(true)
                    setAlertMessage()
                }
            })
        }
    }

    const handleReauthenticate = (e) => {
        e.preventDefault()

        const creds = EmailAuthProvider.credential(reauthenticateEmail, reauthenticatePassword)
        reauthenticateWithCredential(currentUser, creds).then(() => {
            handleExitReauthenticate()
            handleResetPassword(e)
        }).catch((err) => {
            console.log(err.code)
            if (err.code === 'auth/user-mismatch') {
                setAlertMessage('Wrong username')
            } else if (err.code === 'auth/wrong-password') {
                setAlertMessage('Wrong password')
            }
        })
    }

    return (
        <div className='header'>
            {
                showResetPassword ?
                    <div className='reset-password-container'>
                        <div className='exit-reset-password' onClick={() => { handleExitResetPassword() }}></div>
                        <form className='reset-password-form' onSubmit={(e) => {handleResetPassword(e)}}>
                            <p className='prompt'>Enter your new password</p>
                            <input className='reset-password-input' type="password" name='reset-password' onChange={(e) => { handleResetPasswordInput(e) }} required />
                            <p className='prompt'>Re-enter your new password</p>
                            <input className='reset-password-input' type="password" name='reset-repassword' onChange={(e) => { handleResetPasswordInput(e) }} required />
                            <button className='handle-reset-password-btn'>Reset</button>
                            <p className='alert-reset'>{alertMessage}</p>
                        </form>
                    </div>
                    : null
            }
            {
                showReauthenticate?
                    <div className='reauthenticate-container'>
                        <div className='exit-reauthenticate' onClick={() => {handleExitReauthenticate()}}></div>
                        <form className='reauthenticate-form' onSubmit={(e) => {handleReauthenticate(e)}}>
                            <p className='confirm-access'>Confirm access</p>
                            <p className='prompt'>Enter your email</p>
                            <input className='reauthenticate-input' type="email" name='reauthenticate-email' onChange={(e) => { handleResetPasswordInput(e) }} required />
                            <p className='prompt'>Enter your password</p>
                            <input className='reauthenticate-input' type="password" name='reauthenticate-password' onChange={(e) => { handleResetPasswordInput(e) }} required />
                            <button className='handle-reauthenticate-btn'>Confirm</button>
                            <p className='alert-reset'>{alertMessage}</p>
                        </form>
                    </div>
                    : null
            }
            <a className='logo' href='/'>SpaceSpeakers</a>
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
                <a className='nav-item' onClick={() => {}} href='/'>Home</a>
                <a className='nav-item' onClick={() => {}} href='/search'>Search</a>
                <a className='nav-item' onClick={() => {}} href='/about'>About</a>
                {
                    !isSignedIn ?
                        <a className='nav-item' onClick={() => {}} href='/login'>Login</a> :
                        <div className='user-nav-container'>
                            <img className='avt' src={avatarURL} alt="" onClick={() => { handleToggleUserNav(); setShowSettings(false) }} />
                            <div className='user-nav' ref={userNavRef}>
                                <img className='profile' src={avatarURL} alt="" onClick={() => [handleRedirectProfile()]} />
                                <div className='settings-container'>
                                    <SettingsSVG className='settings-svg' onClick={() => { setShowSettings(!showSettings) }} />
                                    {
                                        showSettings
                                            ? <div className='settings'>
                                                <p className='reset-password' onClick={() => { setShowResetPassword(true); setAlertMessage(); document.body.style.overflowY = 'hidden'; setShowSettings(false) }}>Reset password</p>
                                            </div>
                                            : null
                                    }
                                </div>
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
    setSignInState: (boolean) => { dispatch(setSignInState(boolean)) },
    setShowPreloader: (boolean) => { dispatch(showPreloader(boolean))}
})

export default connect(mapStateToProps, mapDispatchToProps)(Header);