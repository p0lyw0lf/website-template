import {
  file_type,
  list_directory,
  minify_html,
  read_file,
  run_task,
  run_template,
  slugify,
  write_output,
} from "driver";
const PAGE_ROOT = "./src/pages/";
const PUBLIC_ROOT = "./public/";

// Tests if the page defines a dynamic route
const dynamicRegex = /\[([a-zA-Z0-9_]+)\].*\.js$/;

const slugifyPath = (path) => path.split("/").map(slugify).join("/");

const inputPathToOutputPath = (inputPath) => {
  let outputPath;
  if (inputPath.endsWith(".js")) {
    // Execute the file to build (assuming it's javascript)
    outputPath = inputPath.slice(PAGE_ROOT.length, -3);
    if (outputPath.endsWith(".html")) {
      // Path should actually be a directory
      outputPath = outputPath.slice(0, -".html".length);
      outputPath = slugifyPath(outputPath);
      if (!outputPath.endsWith("index.html")) {
        outputPath = `${outputPath}/index.html`;
      }
    } else {
      // TODO: slugify everything except the filename
    }
  } else if (inputPath.endsWith(".tera")) {
    // Execute the file to build (assuming it's javascript)
    outputPath = inputPath.slice(PAGE_ROOT.length, -5);
    if (outputPath.endsWith(".html")) {
      // Path should actually be a directory
      outputPath = outputPath.slice(0, -".html".length);
      outputPath = slugifyPath(outputPath);
      if (!outputPath.endsWith("index.html")) {
        outputPath = `${outputPath}/index.html`;
      }
    } else {
      // TODO: slugify everything except the filename
    }
  } else if (inputPath.endsWith(".md")) {
    // Render the file as markdown
    outputPath = inputPath.slice(PAGE_ROOT.length, -3);
    outputPath = slugifyPath(outputPath);
    if (outputPath.endsWith("/index")) {
      outputPath += ".html";
    } else {
      outputPath += "/index.html";
    }
  } else {
    throw new Error(`not an input path: ${inputPath}`);
  }

  return outputPath;
};

/**
 * @param {string} inputPath
 * @returns {Promise<void>}
 */
const build = async (inputPath) => {
  let match;
  if (file_type(inputPath) === "dir") {
    const entries = await list_directory(inputPath);
    await Promise.all(
      entries.map(async (entry) => {
        // Don't build anything starting with _
        if (entry.startsWith("_")) return;

        if (file_type(entry) === "dir") {
          await run_task("BUILD.js", entry);
        } else if (
          entry.startsWith(PUBLIC_ROOT) ||
          entry.endsWith(".js") ||
          entry.endsWith(".tera") ||
          entry.endsWith(".md")
        ) {
          await run_task("BUILD.js", entry);
        }
      }),
    );
  } else if (inputPath.startsWith(PUBLIC_ROOT)) {
    // Copy file to output
    const outputPath = inputPath.slice(PUBLIC_ROOT.length);
    const output = await read_file(inputPath);
    write_output(outputPath, output);
  } else if ((match = dynamicRegex.exec(inputPath))) {
    const replacement = match[1];
    // First, run the file without any arguments to collect the data it wants to run on
    const pages = await run_task(inputPath, null);
    // Then, run the file again for each page it wants to create
    await Promise.all(
      pages.map(async (page) => {
        let output = await run_task(inputPath, page);
        if (inputPath.endsWith(".html.js")) {
          output = await minify_html(output);
        }
        const actualInputPath = inputPath.replaceAll(
          `[${replacement}]`,
          page[replacement],
        );
        const outputPath = inputPathToOutputPath(actualInputPath);
        write_output(outputPath, output);
      }),
    );
  } else if (inputPath.endsWith(".js")) {
    const outputPath = inputPathToOutputPath(inputPath);
    // Run the file directly
    let output = await run_task(inputPath, outputPath);
    if (inputPath.endsWith(".html.js")) {
      output = await minify_html(output);
    }
    write_output(outputPath, output);
  } else if (inputPath.endsWith(".tera")) {
    const outputPath = inputPathToOutputPath(inputPath);
    // Template the file without any arguments
    let output = await run_template(inputPath, null);
    if (inputPath.endsWith(".html.tera")) {
      output = await minify_html(output);
    }
    write_output(outputPath, output);
  } else if (inputPath.endsWith(".md")) {
    // TODO: expose this path to the md.js file too probably? Will be useful for it to know I think.
    // TODO: expose dirname and basename filters to tera templates (seems like they'll be useful)
    const outputPath = inputPathToOutputPath(inputPath);
    // Render the file as markdown
    let output = await run_task("src/build/md.js", inputPath);
    output = await minify_html(output);
    write_output(outputPath, output);
  }
};

if (typeof ARG === "string") {
  await build(ARG);
} else {
  // Ignore command-line arguments passed as array
  await build(PAGE_ROOT);
  await build(PUBLIC_ROOT);
}
