import { useEffect } from 'react';
import './header.styles.scss';
import { useNavigate, useLocation } from 'react-router';

const Header = () => {

    const navigate = useNavigate()
    const location = useLocation()
    let pathname = location.pathname
    
    useEffect(() => {
        pathname = location.pathname
    }, [location])

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

    return (
        <div className='header'>
            <p className='logo'>SpaceSpeakers</p>
            <div className='nav-bar'>
                <p className='nav-item' onClick={() => {handleRedirectHome()}}>Home</p>
                <p className='nav-item' onClick={() => {handleRedirectSearch()}}>Search</p>
                <p className='nav-item' onClick={() => {handleRedirectAbout()}}>About</p>
                <p className='nav-item' onClick={() => {handleRedirectLogin()}}>Login</p>
            </div>
        </div>
    )
}

export default Header;