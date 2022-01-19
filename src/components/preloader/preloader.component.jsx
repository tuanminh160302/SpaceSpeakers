import { useEffect, useState } from 'react';
import './preloader.styles.scss';
import { useNavigate, useLocation } from 'react-router';
import { connect } from 'react-redux';

const Preloader = ({ isSignedIn }) => {

    const [errorRendering, setErrorRendering] = useState(false)

    useEffect(() => {
        const timer = () => setTimeout(() => {
            setErrorRendering(true)
        }, 3000)

        const timerId = timer()

        return () => {
            clearTimeout(timerId)
        }
    }, [])

    return (
        <div className='preloader'>
            <img src="https://media.giphy.com/media/sdcIxdTkFD0g8/giphy.gif" alt="" />
            {
                errorRendering
                    ? <>
                        <p className='error-prompt' onClick={() => { window.location.reload() }}>Waiting too long? Refresh now</p>
                        <a className='error-prompt' href='/'>Or go back home</a>
                    </> : null
            }
        </div>
    )
}

const mapStateToProps = ({ isSignedIn }) => ({
    isSignedIn: isSignedIn.isSignedIn
})

export default connect(mapStateToProps, null)(Preloader);