import { useEffect, useState } from 'react'
import './footer.styles.scss'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getTargetUsername } from '../../firebase/firebase.init'

const Footer = () => {

    const auth = getAuth()
    const [currentUser, setCurrentUser] = useState(null)
    const [username, setusername] = useState(null)

    useEffect(() => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(auth.currentUser)
                if (currentUser) {
                    await getTargetUsername(currentUser.uid).then((res) => {
                        setusername(res)
                    })
                }
            } else {
                setCurrentUser(null)
            }
        })
    }, [auth, currentUser])

    // `/users/${username}_${uid}`

    return (
        <div className='footer-container'>
            <div className='footer'>
                <div className='branding col'>
                    <a className='footer-logo' href='/'>SpaceSpeakers</a>
                    <p className='footer-title'>We talk bout space. We give you space. <br></br> <span className='footer-slo'>Be space.</span></p>
                </div>
                <div className='explore col'>
                    <p className='explore-title title'>Explore</p>
                    <a className='explore-link element' href="/">Home</a>
                    <a className='explore-link element' href="/search">Search</a>
                    <a className='explore-link element' href="/about">About</a>
                    {
                        currentUser ? <a className='explore-link element' href={`/users/${username}_${currentUser.uid}`}>Profile</a> : <a className='explore-link element' href="/login">Login</a>
                    }
                </div>
                <div className='visit col'>
                    <p className='visit-title title'>Visit</p>
                    <p className='visit-address element'>Spacespeakers HQ. New York</p>
                    <p className='visit-address element'>450 Nott St.</p>
                    <p className='visit-address element'>Schenectady, NY 12308</p>
                </div>
                <div className='follow col'>
                    <p className='follow-title title'>Follow</p>
                    <a className='follow-link element' href="https://www.facebook.com/tuanng1603/" target='_blank'>Facebook</a>
                    <a className='follow-link element' href="">Instagram</a>
                    <a className='follow-link element' href="">Linkedin</a>
                </div>
                <div className='legal col'>
                    <p className='legal-title title'>Visit</p>
                    <p className='legal-link element'>Terms</p>
                    <p className='legal-link element'>Privacy</p>
                </div>
                <div className='business col'>
                    <p className='business-title title'>New Business</p>
                    <p className='business-contact element'>canhtuan09@gmail.com</p>
                    <p className='business-contact element'>518.612.9686</p>
                </div>
            </div>
            <p className='copyrights' >&copy; {new Date().getFullYear()} SpaceSpeakers. All rights reserved.</p>
        </div>
    )
}

export default Footer