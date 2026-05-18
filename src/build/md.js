import { run_task, run_template } from "driver";

const page = await run_task("src/runtime/frontmatter.js", ARG);

if (!page.frontmatter.template) {
  throw new Exception(`${page.filename} missing template in frontmatter`);
}
const template = `src/templates/${page.frontmatter.template}`;

// TODO: document the variables that are populated in this template
// TODO: way to include child pages for index page?? or that should probably be in BUILD.js
export default await run_template(template, page);
