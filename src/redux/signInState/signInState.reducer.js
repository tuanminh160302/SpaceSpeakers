import signInStateTypes from "./signInState.types";

const INITIAL_STATE = {
    isSignedIn: false
}

const signInReducer = (state=INITIAL_STATE, action) => {
    switch(action.type){
        case signInStateTypes.SET_SIGN_IN_STATE:
            return {
                ...state,
                isSignedIn: action.payload
            }

        default: 
            return state
    }
}

export default signInReducer;