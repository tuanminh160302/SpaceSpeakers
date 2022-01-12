import { combineReducers } from "redux";
import showPreloaderReducer from "./preloader/show-preloader.reducer";
import searchDataReducer from "./searchData/searchData.reducer";
import accountInputReducer from "./accountInput/accountInput.reducer";
import signInReducer from "./signInState/signInState.reducer";

export default combineReducers({
    showPreloader: showPreloaderReducer,
    searchData: searchDataReducer,
    accountInput: accountInputReducer,
    isSignedIn: signInReducer
})