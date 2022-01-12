import accountInputTypes from "./accountInput.types";

export const getAccountInput = (valueObject) => ({
    type: accountInputTypes.GET_ACCOUNT_INPUT,
    payload: valueObject
})