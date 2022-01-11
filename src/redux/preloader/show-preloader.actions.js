import showPreloaderTypes from './show-preloader.types';

export const showPreloader = (boolean) => ({
    type: showPreloaderTypes.TOGGLE_SHOW_PRELOADER,
    payload: boolean
})