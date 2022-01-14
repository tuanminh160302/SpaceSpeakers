import { useState, useEffect } from 'react';
import './App.scss';
import { connect } from 'react-redux';
import { Routes, Route } from 'react-router-dom';
import { useLocation } from 'react-router';
import Preloader from './components/preloader/preloader.component';
import Header from './components/header/header.component';
import LandingPage from './pages/landing-page/landing-page.component';
import Search from './pages/search/search.component';
import Login from './pages/login/login.component'
import Profile from './pages/profile/profile.component'
import SearchResult from './pages/search-result/search-result.component';
import { showPreloader } from './redux/preloader/show-preloader.actions';
import { setSearchData } from './redux/searchData/searchData.actions';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { setSignInState } from './redux/signInState/signInState.actions';
import UserPost from './components/user-post/user-post.component';


function App({ showPreloader, setShowPreloader, setSearchData, isSignedIn, setSignInState }) {

  const location = useLocation()

  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      const uid = user.uid;
      setSignInState(true)
      // ...
    } else {
      // User is signed out
      // ...
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
