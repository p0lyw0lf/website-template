// MODIFY: replace this with the actual base URL of your website
export const SITE_URL = "";

/**
 * @param {import("driver").StoreImage} src
 * @returns {string}
 */
export const toAssetUrl = (image) =>
  `/_assets/${image.object().hash().slice(-18)}.${image.format()}`;
