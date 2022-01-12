import signInStateTypes from "./signInState.types";

export const setSignInState = (boolean) => ({
    type: signInStateTypes.SET_SIGN_IN_STATE,
    payload: boolean
})

