import { useEffect, useState } from 'react';
import './login.styles.scss';
import { connect } from 'react-redux';
import { showPreloader } from '../../redux/preloader/show-preloader.actions';
import { ReactComponent as LoginSVG } from '../../assets/login-svg.svg';
import { getAccountInput } from '../../redux/accountInput/accountInput.actions';
import { setSignInState } from '../../redux/signInState/signInState.actions';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { createUserCredentials, signInWithGoogle } from '../../firebase/firebase.init';
import { useNavigate } from 'react-router';
import { getFirestore, getDocs, query, where, collection } from 'firebase/firestore'

const Login = ({ showPreloader, email, signupemail, username, password, signuppassword, repassword, getAccountInput, setSignInState, isSignedIn }) => {

    const [loginMethod, setLoginMethod] = useState(true)
    const [signUpInUse, setSignUpInUse] = useState(false)
    const [showResetPassword, setShowResetPassword] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [resetPasswordInput, setResetPasswordInput] = useState(null)
    const navigate = useNavigate()
    const db = getFirestore()

    useEffect(() => {
        setTimeout(() => {
            showPreloader(false)
        }, 500)
    })

    const takeToSignup = () => {
        setLoginMethod(false)
    }

    const takeToLogin = () => {
        setLoginMethod(true)
    }

    const handleInputChange = (e) => {
        e.preventDefault()
        getAccountInput({
            [e.target.name]: e.target.value
        })
    }

    const handleSubmitLogin = (e) => {
        e.preventDefault()

        const auth = getAuth();
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in 
                showPreloader(true)
                const user = userCredential.user;
                console.log('signed in successfully')
                navigate('/')
                setSignInState(true)
                const resetArray = ['email', 'signupemail', 'password', 'signuppassword', 'username', 'repassword']
                resetArray.forEach((cred) => [
                    getAccountInput({
                        [cred]: ''
                    })
                ])
                // ...
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                setAlertMessage('Wrong username or password')
            });
    }

    const handleSubmitSignup = (e) => {
        e.preventDefault()

        const userCollection = collection(db, 'users')
        const userQuery = query(userCollection, where('username', '==', username))
        getDocs(userQuery).then((querySnapshot) => {
            console.log(querySnapshot.size)
            if (querySnapshot.size === 0) {
                if (signuppassword !== repassword) {
                    setAlertMessage('Password does not match')
                } else {
                    const auth = getAuth();
                    createUserWithEmailAndPassword(auth, signupemail, signuppassword)
                    .then((userCredential) => {
                        // Signed in
                        showPreloader(true)
                        const { user } = userCredential
                        const avatarURL = 'https://i.imgur.com/OrIHeCI.jpg'
                            // Create user data
                            createUserCredentials(user, { signupemail, username, avatarURL })
                                .then(() => {
                                    console.log('user data created')
                                    navigate('/')
                                    setSignInState(true)
                                    const resetArray = ['email', 'signupemail', 'password', 'signuppassword', 'username', 'repassword']
                                    resetArray.forEach((cred) => [
                                        getAccountInput({
                                            [cred]: ''
                                        })
                                    ])
                                })
                        }).catch((err) => {
                            console.log(err.code)
                            if (err.code === 'auth/email-already-in-use') {
                                setAlertMessage('Email elready in use')
                            } else if (err.code === 'auth/weak-password') {
                                setAlertMessage('Password must has at least 6 characters')
                            }
                        })
                }
            } else {
                setAlertMessage('Username already in use')
            }
        })
    }

    const handleGoogleSignIn = () => {
        navigate('/')
        signInWithGoogle()
    }

    const handleExitResetPassword = () => {
        setShowResetPassword(false)
        setResetPasswordInput(null)
        setAlertMessage()
        document.body.style.overflowY = 'visible'
    }

    const handleResetPasswordInput = (e) => {
        e.preventDefault()

        setResetPasswordInput(e.target.value)
    }

    const handleResetPassword = (e) => {
        e.preventDefault()

        const auth = getAuth()

        sendPasswordResetEmail(auth, resetPasswordInput).then(() => {
            setAlertMessage('Password reset email sent!')
        }).catch((err) => {
            if (err.code === 'auth/invalid-email') {
                setAlertMessage('Invalid email')
            } else if (err.code === 'auth/missing-email') {
                setAlertMessage('Please enter your email')
            } else if (err.code === 'auth/user-not-found') {
                setAlertMessage('User not found. Please re-check')
            }
        })
    }

    return (
        <div className='login-container'>
            {
                showResetPassword ?
                    <div className='forgot-password-container'>
                        <div className='exit-forgot-password' onClick={() => { handleExitResetPassword() }}></div>
                        <form className='forgot-password-form' onSubmit={(e) => {handleResetPassword(e)}}>
                            <p className='prompt'>Enter your email</p>
                            <input className='forgot-password-input' type="email" name='forgot-email' onChange={(e) => { handleResetPasswordInput(e) }} required/>
                            <button className='handle-forgot-password-btn'>Reset</button>
                            <p className='alert-reset'>{alertMessage}</p>
                        </form>
                    </div>
                    : null
            }
            <div className='login'>
                <LoginSVG className='login-svg' />
                <div className='login-form-container'>
                    {
                        isSignedIn ? <p className='already-signedin' onClick={() => { navigate('/') }}>You have already signed in. Click here to go back to home</p> :
                            <>
                                {
                                    loginMethod ?
                                        <>
                                            <form className='login-form' onSubmit={(e) => { handleSubmitLogin(e) }}>
                                                <p className='login-title'>Log in to your account</p>
                                                <p className='login-prompt'>Enter your email</p>
                                                <input className='login-input' type="email" name='email' value={email} required onChange={(e) => { handleInputChange(e) }} />
                                                <p className='login-prompt'>Enter your password</p>
                                                <input className='login-input' type="password" name='password' value={password} required onChange={(e) => { handleInputChange(e) }} />
                                                <p className='forgot-password' onClick={() => {setShowResetPassword(true); setAlertMessage(); document.body.style.overflowY = 'hidden'}}>Forgot pasword?</p>
                                                <button className='login-button'>Login</button>
                                            </form>
                                            <button className='login-google' onClick={() => { handleGoogleSignIn() }}>Continue with Google</button>
                                        </> :
                                        <form className='signup-form' onSubmit={(e) => { handleSubmitSignup(e) }}>
                                            <p className='signup-title'>Sign up for a new account</p>
                                            <p className='signup-prompt'>Enter your email</p>
                                            <input className='signup-input' type="email" name='signupemail' required value={signupemail} onChange={(e) => { handleInputChange(e) }} />
                                            <p className='signup-prompt'>Enter your username</p>
                                            <input className='signup-input' type="text" name='username' required value={username} onChange={(e) => { handleInputChange(e) }} />
                                            <p className='signup-prompt'>Enter your password</p>
                                            <input className='signup-input' type="password" name='signuppassword' required value={signuppassword} onChange={(e) => { handleInputChange(e) }} />
                                            <p className='signup-prompt'>Re-enter your password</p>
                                            <input className='signup-input' type="password" name='repassword' required value={repassword} onChange={(e) => { handleInputChange(e) }} />
                                            <button className='signup-button'>Sign up</button>
                                        </form>
                                }

                                {
                                    loginMethod ?
                                        <p className='change-method' onClick={() => { takeToSignup() }}>Create a new account instead</p> :
                                        <p className='change-method' onClick={() => { takeToLogin() }}>Login to your account instead</p>
                                }
                            </>
                    }
                </div>
            </div>
            <p className='alert'>{alertMessage}</p>
        </div>
    )
}

const mapStateToProps = ({ accountInput, isSignedIn }) => ({
    email: accountInput.email,
    signupemail: accountInput.signupemail,
    username: accountInput.username,
    password: accountInput.password,
    signuppassword: accountInput.signuppassword,
    repassword: accountInput.repassword,
    isSignedIn: isSignedIn.isSignedIn
})

const mapDispatchToProps = (dispatch) => ({
    showPreloader: (boolean) => { dispatch(showPreloader(boolean)) },
    getAccountInput: (valueObject) => { dispatch(getAccountInput(valueObject)) },
    setSignInState: (boolean) => { dispatch(setSignInState(boolean)) }
})

export default connect(mapStateToProps, mapDispatchToProps)(Login)