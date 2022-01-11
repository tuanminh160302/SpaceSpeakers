import { combineReducers } from "redux";
import showPreloaderReducer from "./preloader/show-preloader.reducer";
import searchDataReducer from "./searchData/searchData.reducer";

export default combineReducers({
    showPreloader: showPreloaderReducer,
    searchData: searchDataReducer,
})