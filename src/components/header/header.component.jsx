import { useRef, Fragment } from 'react';
import './header.styles.scss';
import { useCurrentUser, useSearchHistory, useUserNav, useInputChange, useSignOut, useSettings, useRedirectProfile, useResetPassword, useShowMenu, useShowMenuIcon } from './headers.utils';
import { useNavigate, useLocation } from 'react-router';
import { connect } from 'react-redux';
import { setSignInState } from '../../redux/signInState/signInState.actions';
import { showPreloader } from '../../redux/preloader/show-preloader.actions';
import { getAuth, signOut, onAuthStateChanged, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { ReactComponent as SignOut } from '../../assets/signout.svg'
import { ReactComponent as SearchSVG } from '../../assets/search.svg'
import { ReactComponent as SettingsSVG } from '../../assets/settings.svg'
import { ReactComponent as MenuSVG } from '../../assets/menu.svg'
import { pullSearchHistory, pushSearchHistory, getTargetUserUID } from '../../firebase/firebase.init';
import SearchHistoryComponent from '../search-history/search-history.component';

const Header = ({ isSignedIn, setSignInState, setShowPreloader }) => {

    const db = getFirestore()
    const navigate = useNavigate()
    const location = useLocation()
    let pathname = location.pathname
    const auth = getAuth()
    const userNavRef = useRef()
    const menuRef = useRef()
    const menuIconRef = useRef()

    // Custom Hooks
    const [handleToggleUserNav, setToggleUserNav] = useUserNav(location, userNavRef)
    const [currentUser, avatarURL, username, setUsername] = useCurrentUser(isSignedIn, auth, onAuthStateChanged, db, doc, getDoc, location)
    const [searchValue, searchHistory, showSearchHistory, fetchSearchHistory, handleHeaderSearch, setShowSearchHistory, setSearchValue]
        = useSearchHistory(currentUser, pullSearchHistory, pushSearchHistory, location, navigate)
    const [showResetPassword, alertMessage, showReauthenticate, handleExitResetPassword, handleExitReauthenticate, handleResetPassword, handleReauthenticate,
        setResetPasswordInput, setResetRepasswordInput, setReauthenticateEmail, setReauthenticatePassword,
        setShowResetPassword, setAlertMessage]
        = useResetPassword(updatePassword, reauthenticateWithCredential, currentUser, setShowPreloader, EmailAuthProvider, setToggleUserNav, handleToggleUserNav)
    const handleInputChange
        = useInputChange(setSearchValue, setResetPasswordInput, setResetRepasswordInput, setReauthenticateEmail, setReauthenticatePassword)
    const handleSignOut = useSignOut(auth, setSignInState, setUsername, signOut)
    const [showSettings, setShowSettings] = useSettings()
    const handleRedirectProfile = useRedirectProfile(setShowSettings, getTargetUserUID, pathname, username, userNavRef, navigate)
    const handleShowMenu = useShowMenu(location, menuRef, menuIconRef, userNavRef, setToggleUserNav)
    const [showMenuIcon, setShowMenuIcon] = useShowMenuIcon(menuIconRef)

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

    return (
        <div className='header'>
            {
                showResetPassword ?
                    <div className='reset-password-container'>
                        <div className='exit-reset-password' onClick={() => { handleExitResetPassword() }}></div>
                        <form className='reset-password-form' onSubmit={(e) => { handleResetPassword(e) }}>
                            <p className='prompt'>Enter your new password</p>
                            <input className='reset-password-input' type="password" name='reset-password' onChange={(e) => { handleInputChange(e) }} required />
                            <p className='prompt'>Re-enter your new password</p>
                            <input className='reset-password-input' type="password" name='reset-repassword' onChange={(e) => { handleInputChange(e) }} required />
                            <button className='handle-reset-password-btn'>Reset</button>
                            <p className='alert-reset'>{alertMessage}</p>
                        </form>
                    </div>
                    : null
            }
            {
                showReauthenticate ?
                    <div className='reauthenticate-container'>
                        <div className='exit-reauthenticate' onClick={() => { handleExitReauthenticate() }}></div>
                        <form className='reauthenticate-form' onSubmit={(e) => { handleReauthenticate(e) }}>
                            <p className='confirm-access'>Confirm access</p>
                            <p className='prompt'>Enter your email</p>
                            <input className='reauthenticate-input' type="email" name='reauthenticate-email' onChange={(e) => { handleInputChange(e) }} required />
                            <p className='prompt'>Enter your password</p>
                            <input className='reauthenticate-input' type="password" name='reauthenticate-password' onChange={(e) => { handleInputChange(e) }} required />
                            <button className='handle-reauthenticate-btn'>Confirm</button>
                            <p className='alert-reset'>{alertMessage}</p>
                        </form>
                    </div>
                    : null
            }
            <a className='logo' href='/'>SpaceSpeakers</a>
            
            <MenuSVG className='header-menu' ref={menuIconRef} onClick={() => {handleShowMenu()}}/>

            <div className='header-else' ref={menuRef}>
                <form className='header-search-container' onSubmit={(e) => { handleHeaderSearch(e) }}>
                    <input className='header-search-input' type="text" name='header-search' required placeholder='Search for users or keywords...'
                        value={searchValue} onChange={(e) => { handleInputChange(e) }}
                        onFocus={() => { searchHistory.length && setShowSearchHistory(true) }}
                        autoComplete="off" />
                    <button className='search-btn'><SearchSVG className='search-svg' /></button>
                    {
                        searchHistory.length ? showSearchHistory ?
                            <div className='search-history-container'>
                                {searchHistoryComponent}
                            </div> : null : null
                    }
                </form>
                <div className='nav-bar'>
                    <a className='nav-item' onClick={() => { }} href='/'>Home</a>
                    <a className='nav-item' onClick={() => { }} href='/search'>Search</a>
                    <a className='nav-item' onClick={() => { }} href='/about'>About</a>
                    {
                        !isSignedIn ?
                            <a className='nav-item' onClick={() => { }} href='/login'>Login</a> :
                            <div className='user-nav-container'>
                                <img className='avt' src={avatarURL} alt="" onClick={() => { handleToggleUserNav(); setShowSettings(false); setShowMenuIcon(!showMenuIcon) }} />
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
        </div>
    )
}

const mapStateToProps = ({ isSignedIn }) => ({
    isSignedIn: isSignedIn.isSignedIn
})

const mapDispatchToProps = (dispatch) => ({
    setSignInState: (boolean) => { dispatch(setSignInState(boolean)) },
    setShowPreloader: (boolean) => { dispatch(showPreloader(boolean)) }
})

export default connect(mapStateToProps, mapDispatchToProps)(Header);