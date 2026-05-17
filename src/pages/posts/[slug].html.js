import {
  file_type,
  list_directory,
  run_task,
  run_template,
  slugify,
} from "driver";

const getPages = async () => {
  const entries = await list_directory("src/posts");
  const filenames = entries.filter(
    (entry) => entry.endsWith(".md") && file_type(entry) === "file",
  );
  const pages = await Promise.all(
    filenames.map(async (filename) => {
      return await run_task("src/runtime/frontmatter.js", filename);
    }),
  );
  pages.sort((a, b) => b.frontmatter.published - a.frontmatter.published);
  return pages.map((page) => ({
    ...page,
    slug: slugify(page.frontmatter.title),
  }));
};

const buildPage = async (page) => {
  return await run_template("src/templates/Post.html.tera", page);
};

export default ARG ? await buildPage(ARG) : await getPages();
