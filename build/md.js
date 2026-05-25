import { run_js, run_tera } from "driver";
import { dirname } from "../src/path.js";

/** ARG: { inputPath: string; outputPath: string } */

// TODO: document the variables that are populated in page
const page = await run_js("src/runtime/frontmatter.js", ARG.inputPath);

if (ARG.inputPath.endsWith("/index.md")) {
  page.children = await run_js(
    "src/runtime/listPages.js",
    dirname(ARG.inputPath),
  );
}
page.outputPath = ARG.outputPath;

if (!page.frontmatter.template) {
  throw new Error(`${page.filename} missing template in frontmatter`);
}
const template = `src/templates/${page.frontmatter.template}`;

export default template.endsWith(".js")
  ? await run_js(template, page)
  : await run_tera(template, { currentPage: page });
