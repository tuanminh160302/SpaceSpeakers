import cropImageTypes from "./cropImage.types";

const INITIAL_STATE = {
    cropImage: null,
    showCropper: null
}

const cropImageReducer = (state=INITIAL_STATE, action) => {
    switch(action.type) {
        case cropImageTypes.GET_CROP_IMAGE:
            return {
                ...state,
                cropImage: action.payload
            }

        case cropImageTypes.TOGGLE_SHOW_CROPPER:
            return {
                ...state,
                showCropper: action.payload
            }

        default:
            return state
    }
}

export default cropImageReducer;