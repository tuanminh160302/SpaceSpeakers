import cropImageTypes from "./cropImage.types";

export const getCropImage = (cropImage) => ({
    type: cropImageTypes.GET_CROP_IMAGE,
    payload: cropImage
})

export const setCropper = (boolean) => ({
    type: cropImageTypes.TOGGLE_SHOW_CROPPER,
    payload: boolean
})