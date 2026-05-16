import { store } from "driver";
import commonCss from "../css/common.css.js";
import { SITE_URL } from "../data/urls.js";
import { html } from "../render.js";

/**
 * @typedef {object} Props
 * @property {string} title
 * @property {string} pathname
 * @property {string} [description]
 *
 * @typedef {object} Slots
 * @property {string} [extraHead]
 * @property {string} [header]
 * @property {string} [footer]
 *
 * @callback Render
 * @param {string} mainSlot
 * @param {Slots} [extraSlots]
 * @returns {Promise<import("driver").StoreObject>}
 */

/**
 * @param {Props} props
 * @returns {Render}
 */
export const Base =
  ({ title, pathname, description }) =>
  async (slot, extraSlots) => {
    const { extraHead, header, footer } = extraSlots ?? {};
    const canonicalUrl = `${SITE_URL}/${pathname}`;

    const out = html`
      <!doctype html>
      <html lang="en-US">
        <head>
          <meta charset="utf-8" />
          <meta http-equiv="x-ua-compatible" content="ie=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />

          ${title &&
          html`
            <title>${title}</title>
            <meta property="og:title" content="${title}" />
          `}
          ${description &&
          html`
            <meta property="og:description" content="${description}" />
            <meta name="description" content="${description}" />
          `}
          <link rel="canonical" href="${canonicalUrl}" />
          <meta property="og:url" content="${canonicalUrl}" />

          ${extraHead}
          <style>
            ${commonCss}
            ${extraHead?.style}
            ${slot.style}
            ${header?.style}
            ${footer?.style}
          </style>
        </head>
        <body>
          ${header ||
          html`
            <header>
              <h1><a href="/">${title || "Home"}</a></h1>
            </header>
          `}
          <main>${slot}</main>
          ${footer}
        </body>
      </html>
    `;

    return store(out.toString());
  };
