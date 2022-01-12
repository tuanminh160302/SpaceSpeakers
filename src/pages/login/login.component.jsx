import { useEffect, useState } from 'react';
import './login.styles.scss';
import { connect } from 'react-redux';
import { showPreloader } from '../../redux/preloader/show-preloader.actions';
import { ReactComponent as LoginSVG } from '../../assets/login-svg.svg';
import { getAccountInput } from '../../redux/accountInput/accountInput.actions';
import { setSignInState } from '../../redux/signInState/signInState.actions';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { createUserCredentials } from '../../firebase/firebase.init';
import { useNavigate } from 'react-router';

const Login = ({ showPreloader, email, signupemail, username, password, signuppassword, repassword, getAccountInput, setSignInState, isSignedIn }) => {

    const [loginMethod, setLoginMethod] = useState(true)
    const navigate = useNavigate()

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
                console.log('creds not match')
            });
    }

    const handleSubmitSignup = (e) => {
        e.preventDefault()

        const auth = getAuth();
        createUserWithEmailAndPassword(auth, signupemail, signuppassword)
            .then((userCredential) => {
                // Signed in
                const { user } = userCredential
                // Create user data
                createUserCredentials(user, { signupemail, username })
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
            })
    }

    return (
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
                                            <button className='login-button'>Login</button>
                                        </form>
                                        <button className='login-google'>Login with Google</button>
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