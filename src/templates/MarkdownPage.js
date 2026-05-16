import pageCss from "../css/page.css.js";
import { html } from "../render.js";
import { Base } from "./Base.js";

/**
 * @typedef {object} Props
 * @property {string} title
 * @property {string} description
 *
 * @callback Render
 * @param {string} mainSlot
 * @returns {Promise<import("driver").StoreObject>}
 */

/**
 * @param {Props} props
 * @returns {Render}
 */
export const MarkdownPage =
  ({ title, description }) =>
  async (slot) => {
    return await Base({ title, description })(html`${slot}`.withStyle(pageCss));
  };
