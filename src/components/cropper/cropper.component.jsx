import { useState, useCallback, useRef } from 'react';
import getCroppedImg from './cropImage';
import { connect } from 'react-redux';
import { getCropImage } from '../../redux/cropImage/cropImage.actions';
import { setCropper } from '../../redux/cropImage/cropImage.actions';

import './cropper.styles.scss';
import Cropper from 'react-easy-crop';

const CropperComponent = ({ src, getCropImage, setCropper }) => {
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

    const image = new Image()
    image.src = src
    image.onload = () => {
        if (image.height > image.width) {
            setVerticalOrientation(true)
        } else {
            setVerticalOrientation(false)
        }
    }

    return (
        <>
            <Cropper
                image={src}
                crop={crop}
                zoom={zoom}
                aspect={1 / 1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                classes={
                    {
                        containerClassName: 'cropper-container',
                        cropAreaClassName: 'crop-area'
                    }
                }
                cropShape='round'
                objectFit={verticalOrientation ? 'horizontal-cover' : 'vertical-cover'}
                restrictPosition={true}
            />

            <div className='cropper-toolbar'>
                <p className='cropper-tool' onClick={() => { cancelCropImage() }}>Back</p>
                <div className="controls">
                    <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        onChange={(e) => {
                            setZoom(e.target.value)
                        }}
                        className="zoom-range"
                    />
                </div>
                <p className='cropper-tool' onClick={() => { showCroppedImage() }}>Done</p>
            </div>
        </>
    )
}

const mapDispatchToProps = (dispatch) => ({
    getCropImage: (cropImage) => (dispatch(getCropImage(cropImage))),
    setCropper: (boolean) => (dispatch(setCropper(boolean)))
})

export default connect(null, mapDispatchToProps)(CropperComponent);