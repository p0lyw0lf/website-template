export const SITE_URL = "https://wolfgirl.dev";

/**
 * @param {import("driver").StoreImage} src
 * @returns {string}
 */
export const toAssetUrl = (image) =>
  `${SITE_URL}/_assets/${image.object().hash().slice(-18)}.${image.format()}`;
