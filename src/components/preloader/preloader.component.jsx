import { useEffect, useState } from 'react';
import './preloader.styles.scss';
import { useNavigate, useLocation } from 'react-router';
import { connect } from 'react-redux';

const Preloader = ({isSignedIn}) => {

    const [renderRedirect, setRenderRedirect] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        if (location.pathname === '/login' && isSignedIn) {
            setRenderRedirect(true)
        }
    }, [location])

    const handleRedirectHome = () => {
        navigate('/')
    }

    return (
        <div className='preloader'>
            <img src="https://media.giphy.com/media/sdcIxdTkFD0g8/giphy.gif" alt="" />
            {/* {renderRedirect ? <p className='preloader-redirect' onClick={() => {handleRedirectHome()}}>You have already signed in. Click here to go home</p> : null} */}
        </div>
    )
}

const mapStateToProps = ({isSignedIn}) => ({
    isSignedIn: isSignedIn.isSignedIn
})

export default connect(mapStateToProps, null)(Preloader);