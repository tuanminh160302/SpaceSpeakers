import { useState, useEffect } from 'react';
import './App.scss';
import { connect } from 'react-redux';
import { Routes, Route } from 'react-router-dom';
import { useLocation } from 'react-router';
import Preloader from './components/preloader/preloader.component';
import Header from './components/header/header.component';
import LandingPage from './pages/landing-page/landing-page.component';
import Search from './pages/search/search.component';
import { showPreloader } from './redux/preloader/show-preloader.actions';
import { setSearchData } from './redux/searchData/searchData.actions';

function App({showPreloader, setShowPreloader, setSearchData}) {
  
  const location = useLocation()

  const resetSearchInput = () => {
    const updatedInputFields = [{keyword: ''}, {from: ''}, {to: ''}]
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
      </Routes>
    </div>
  );
}

const mapStateToProps = ({showPreloader}) => ({
  showPreloader: showPreloader.showPreloader
})

const mapDispatchToProps = (dispatch) => ({
  setShowPreloader: (boolean) => {dispatch(showPreloader(boolean))},
  setSearchData: (valueObject) => {dispatch(setSearchData(valueObject))}
})

export default connect(mapStateToProps, mapDispatchToProps)(App);
