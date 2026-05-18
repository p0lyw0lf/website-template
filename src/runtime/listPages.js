import { file_type, list_directory, run_task } from "driver";

/** ARG: string, representing the directory of markdown pages you want to list. */

const entries = await list_directory(ARG);
const filenames = [];
for (const entry of entries) {
  const type = file_type(entry);
  if (type === "file" && entry.endsWith(".md")) {
    filenames.append(entry);
  }
  // TODO: look for directories containing an "index.md" file.
  if (type === "directory") {
    // pass
  }
}
const pages = await Promise.all(
  filenames.map(async (filename) => {
    return await run_task("src/runtime/frontmatter.js", filename);
  }),
);

export default pages;
