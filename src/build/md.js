import { run_task } from "driver";
import { MarkdownPage } from "../templates/MarkdownPage.js";

const { filename, frontmatter, body } = await run_task(
  "src/runtime/frontmatter.js",
  ARG,
);

// Parse the body as markdown, and render as HTML
const renderedBody = await run_task("src/runtime/markdown.js", {
  filename,
  body,
});

// Use the read frontmatter to render the final HTML
export default await MarkdownPage(frontmatter)(renderedBody.toString());
