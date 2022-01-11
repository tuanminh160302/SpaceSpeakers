import searchDataTypes from "./searchData.types";

const INITIAL_STATE = {
    keyword: '',
    from: '',
    to: '',
}

const searchDataReducer = (state=INITIAL_STATE, action) => {
    switch(action.type) {
        case searchDataTypes.GET_DATA:
            return {
                ...state,
                [Object.keys(action.payload)[0]]: Object.values(action.payload)[0],
            }

        default:
            return state
    }
}

export default searchDataReducer;