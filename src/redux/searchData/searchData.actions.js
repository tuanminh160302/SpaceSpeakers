import searchDataTypes from "./searchData.types";

export const setSearchData = (valueObject) => ({
    type: searchDataTypes.GET_DATA,
    payload: valueObject
})