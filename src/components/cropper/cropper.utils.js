import { useState, useCallback } from "react";

export const useCropper = (getCropImage, setCropper, src, getCroppedImg) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [verticalOrientation, setVerticalOrientation] = useState(null)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const showCroppedImage = useCallback(async () => {
        try {
            const croppedImage = await getCroppedImg(
                src,
                croppedAreaPixels,
            )
            getCropImage(croppedImage)
            setCropper(false)
        } catch (e) {
            console.error(e)
        }
    }, [croppedAreaPixels])

    const cancelCropImage = () => {
        setCropper(false)
    }

    return [crop, zoom, verticalOrientation, onCropComplete, showCroppedImage, cancelCropImage, setCrop, setZoom, setVerticalOrientation]
}