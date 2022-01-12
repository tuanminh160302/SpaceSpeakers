import accountInputTypes from "./accountInput.types";

const INITIAL_STATE = {
    email: '',
    signupemail: '',
    username: '',
    signuppassword: '',
    password: '',
    repassword: '',
}

const accountInputReducer = (state=INITIAL_STATE, action) => {
    switch(action.type) {
        case accountInputTypes.GET_ACCOUNT_INPUT:
            return {
                ...state,
                [Object.keys(action.payload)[0]]: Object.values(action.payload)[0]
            }
        
        default:
            return state
    }
}

export default accountInputReducer;