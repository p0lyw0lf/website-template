/**
 * @param {import("driver").StoreImage} src
 * @returns {string}
 */
export const toAssetUrl = (image) =>
  `/_assets/${image.object().hash().slice(-18)}.${image.format()}`;
