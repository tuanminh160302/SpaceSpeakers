import showPreloaderTypes from "./show-preloader.types";

const INITIAL_STATE = {
    showPreloader: true,
}

const showPreloaderReducer = (state=INITIAL_STATE, action) => {
    switch(action.type) {
        case showPreloaderTypes.TOGGLE_SHOW_PRELOADER:
            return {
                ...state,
                showPreloader: action.payload
            }
        
        default:
            return state
    }
}

export default showPreloaderReducer;