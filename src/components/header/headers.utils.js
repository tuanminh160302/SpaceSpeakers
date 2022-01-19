import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router";
import gsap from "gsap";

export const useUserNav = (location, userNavRef) => {
    const [toggleUserNav, setToggleUserNav] = useState(false)
    useEffect(() => {
        // pathname = location.pathname
        gsap.to(userNavRef.current, { duration: 0, x: '150px' })
        setToggleUserNav(false)
    }, [location])
    
    const handleToggleUserNav = () => {
        if (!toggleUserNav) {
            gsap.to(userNavRef.current, { x: 0, ease: 'power4.inOut' })
            setToggleUserNav(true)
        } else {
            gsap.to(userNavRef.current, { x: '150px', ease: 'power4.inOut' })
            setToggleUserNav(false)
        }
    }

    return [handleToggleUserNav, setToggleUserNav]
}

export const useCurrentUser = (isSignedIn, auth, onAuthStateChanged, db, doc, getDoc, location) => {
    const [currentUser, setCurrentUser] = useState(null)
    const [avatarURL, setAvatarURL] = useState(undefined)
    const [username, setUsername] = useState(null)

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

    return [currentUser, avatarURL, username, setUsername]
}

export const useSearchHistory = (currentUser, pullSearchHistory, pushSearchHistory, location, navigate) => {
    const [searchHistory, setSearchHistory] = useState([])
    const [showSearchHistory, setShowSearchHistory] = useState(false)
    const [searchValue, setSearchValue] = useState('')

    useEffect(async () => {
        if (currentUser) {
            await fetchSearchHistory()
        }
    }, [currentUser, location, searchHistory.length])

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

    const handleHeaderSearch = async (e) => {
        e.preventDefault()
        await pushSearchHistory(currentUser, searchValue, new Date().getTime())
        navigate(`/search-data-field=${searchValue}`)
        setSearchValue('')
    }

    return [searchValue, searchHistory, showSearchHistory, fetchSearchHistory, handleHeaderSearch, setShowSearchHistory, setSearchValue]
}

export const useInputChange = (setSearchValue, setResetPasswordInput, setResetRepasswordInput, setReauthenticateEmail, setReauthenticatePassword) => {
    const handleInputChange = (e) => {
        e.preventDefault()

        if (e.target.name === 'header-search') {
            setSearchValue(e.target.value)
        } else if (e.target.name === 'reset-password') {
            setResetPasswordInput(e.target.value)
        } else if (e.target.name === 'reset-repassword') {
            setResetRepasswordInput(e.target.value)
        } else if (e.target.name === 'reauthenticate-email') {
            setReauthenticateEmail(e.target.value)
        } else if (e.target.name === 'reauthenticate-password') {
            setReauthenticatePassword(e.target.value)
        }
    }

    return handleInputChange
}

export const useSignOut = (auth, setSignInState, setUsername, signOut, setShowMenuIcon) => {

    const handleSignOut = () => {
        signOut(auth).then(() => {
            // Sign-out successful.
            setSignInState(false)
            setShowMenuIcon(true)
        }).catch((error) => {
            console.log(error)
        });
        setUsername(null)
    }

    return handleSignOut
}

export const useSettings = () => {
    const [showSettings, setShowSettings] = useState(false)

    return [showSettings, setShowSettings]
}

export const useRedirectProfile = (setShowSettings, getTargetUserUID, pathname, username, userNavRef, navigate) => {
    const handleRedirectProfile = async () => {
        setShowSettings(false)
        await getTargetUserUID(username).then((uid) => {
            if (pathname !== `/users/${username}_${uid}`) {
                navigate(`/users/${username}_${uid}`)
                gsap.to(userNavRef.current, { duration: 0, x: '150px' })
            } else {
                window.location.reload()
            }
        })
    }

    return handleRedirectProfile
}

export const useResetPassword = (updatePassword, reauthenticateWithCredential, currentUser, setShowPreloader, EmailAuthProvider, setToggleUserNav, handleToggleUserNav) => {
    const [showResetPassword, setShowResetPassword] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [resetPasswordInput, setResetPasswordInput] = useState(null)
    const [resetRepasswordInput, setResetRepasswordInput] = useState(null)
    const [reauthenticateEmail, setReauthenticateEmail] = useState(null)
    const [reauthenticatePassword, setReauthenticatePassword] = useState(null)
    const [showReauthenticate, setShowReauthenticate] = useState(false)

    const handleExitResetPassword = () => {
        setShowResetPassword(false)
        setResetPasswordInput(null)
        setResetRepasswordInput(null)
        setAlertMessage()
        document.body.style.overflowY = 'visible'
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
                setToggleUserNav(false)
                handleToggleUserNav()
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
            setShowPreloader(true)
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

    return [showResetPassword, alertMessage, showReauthenticate, handleExitResetPassword, handleExitReauthenticate, handleResetPassword, handleReauthenticate,
        setResetPasswordInput, setResetRepasswordInput, setReauthenticateEmail, setReauthenticatePassword,
        setShowResetPassword, setAlertMessage]
}

export const useShowMenu = (location, menuRef, menuIconRef, userNavRef, setToggleUserNav) => {
    const [showMenu, setShowMenu] = useState(false)

    useEffect(() => {
        gsap.to(menuRef.current, {duration: .7, x: '100%', ease: 'power4.inOut'})
        gsap.to(menuIconRef.current, {duration: .3, fill: 'black'})
        setShowMenu(false)
    }, [location])

    const handleShowMenu = () => {
        if (!showMenu) {
            gsap.to(menuRef.current, {duration: .7, x: 0, ease: 'power4.inOut'})
            gsap.to(menuIconRef.current, {duration: .3, fill: 'white'})
            gsap.to(userNavRef.current, { duration: 0, x: '150px' })
            setToggleUserNav(false)
            setShowMenu(true)
        } else {
            gsap.to(menuRef.current, {duration: .7, x: '100%', ease: 'power4.inOut'})
            gsap.to(menuIconRef.current, {duration: .3, fill: 'black'})
            gsap.to(userNavRef.current, { duration: 0, x: '150px' })
            setToggleUserNav(false)
            setShowMenu(false)
        }
    }

    return handleShowMenu
}

export const useShowMenuIcon = (menuIconRef) => {
    const [showMenuIcon, setShowMenuIcon] = useState(true)

    useEffect(() => {
        if (!showMenuIcon) {
            gsap.to(menuIconRef.current, {duration: .3, opacity: 0})
            gsap.to(menuIconRef.current, {delay: .3, display: 'none'})
        } else {
            gsap.to(menuIconRef.current, {delay: .3, display: 'block'})
            gsap.to(menuIconRef.current, {delay: .3, duration: .3, opacity: 1})
        }
    }, [showMenuIcon])

    return [showMenuIcon, setShowMenuIcon]
}