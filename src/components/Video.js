import { html } from "../render.js";

/**
 * @typedef {object} Props
 * @property {string} src
 */

/**
 * @property {Props} props
 * @returns {import("../render.js").HTML}
 */
export const Video = ({ src }) => {
  return html`<video src="${src}" controls></video>`;
};
