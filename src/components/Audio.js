import { html } from "../render.js";

/**
 * @typedef {object} Props
 * @property {string} src
 */

/**
 * @property {Props} props
 * @returns {import("../render.js").HTML}
 */
export const Audio = ({ src }) => {
  return html`<audio src="${src}" controls></audio>`;
};
