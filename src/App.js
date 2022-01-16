import { useState, useEffect } from 'react';
import './App.scss';
import { connect } from 'react-redux';
import { Routes, Route } from 'react-router-dom';
import { useLocation } from 'react-router';
import Preloader from './components/preloader/preloader.component';
import Header from './components/header/header.component';
import Footer from './components/footer/footer.component';
import LandingPage from './pages/landing-page/landing-page.component';
import Search from './pages/search/search.component';
import Login from './pages/login/login.component'
import Profile from './pages/profile/profile.component'
import SearchResult from './pages/search-result/search-result.component';
import { showPreloader } from './redux/preloader/show-preloader.actions';
import { setSearchData } from './redux/searchData/searchData.actions';
import { getAuth, onAuthStateChanged, getRedirectResult, GoogleAuthProvider  } from "firebase/auth";
import { setSignInState } from './redux/signInState/signInState.actions';
import { createUserCredentials } from './firebase/firebase.init';
import { getDoc, doc, getFirestore } from 'firebase/firestore';


function App({ showPreloader, setShowPreloader, setSearchData, isSignedIn, setSignInState }) {

  const location = useLocation()

  const auth = getAuth();
  const db = getFirestore()

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      await getRedirectResult(auth).then(async (res) => {
        if (res) {
          const {user} = res
          const avatarURL = user.photoURL
          const username = user.email
          const signupemail = user.email
          const userRef = doc(db, 'users', user.uid)
          await getDoc(userRef).then((snapshot) => {
            const data = snapshot.data()
            if (!data) {
              createUserCredentials(user, { signupemail, username, avatarURL }).then(() => {
                window.location.reload()
              })
            } else if (data) {
              if (!data.uid) {
                createUserCredentials(user, { signupemail, username, avatarURL }).then(() => {
                  window.location.reload()
                })
              }
            }
          })
        }
      })      
      setSignInState(true)
      // ...
    } else {
      
    }
  });

  const resetSearchInput = () => {
    const updatedInputFields = [{ keyword: '' }, { from: '' }, { to: '' }]
    updatedInputFields.forEach((valueObject) => {
      setSearchData(valueObject)
    })
  }

  useEffect(() => {
    setShowPreloader(true)
    resetSearchInput()
  }, [location])

  return (
    <div className="App">
      {showPreloader ? <Preloader /> : null}
      <Header />
      <Routes>
        <Route path='/' element={<LandingPage />}></Route>
        <Route path='/search' element={<Search />}></Route>
        <Route path='/search/:query' element={<Search />}></Route>
        <Route path='/login' element={<Login />}></Route>
        <Route path='/users/:username' element={<Profile/>}></Route>
        <Route path='/search-data-field=:data' element={<SearchResult/>}></Route>
      </Routes>
      <Footer />
    </div>
  );
}

const mapStateToProps = ({ showPreloader, isSignedIn }) => ({
  showPreloader: showPreloader.showPreloader,
  isSignedIn: isSignedIn.isSignedIn,
})

const mapDispatchToProps = (dispatch) => ({
  setShowPreloader: (boolean) => { dispatch(showPreloader(boolean)) },
  setSearchData: (valueObject) => { dispatch(setSearchData(valueObject)) },
  setSignInState: (boolean) => {dispatch(setSignInState(boolean))}
})

export default connect(mapStateToProps, mapDispatchToProps)(App);
