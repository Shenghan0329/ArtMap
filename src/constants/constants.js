export const THREED_IMAGE_NUMBER = 6;
export const THREED_IMAGE_SIZE = 5;
export const THREED_IMAGE_SEPERATION = 1.2
export const THREED_IMAGE_SHIFT = 3;

export const getStreetViewMinZoom = (windowWidth) => Math.max(2.83 - 0.22 * (windowWidth / 100), 0.83);
export const STREETVIEW_MAX_ZOOM = 3