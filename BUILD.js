import {
  file_type,
  list_directory,
  minify_html,
  read_file,
  run_task,
  write_output,
} from "driver";
import {
  BUILD_EXTS,
  inputPathToOutputPath,
  PAGE_ROOT,
  PUBLIC_ROOT,
} from "./build/config.js";

/**
 * @param {string} inputPath
 * @returns {Promise<void>}
 */
const build = async (inputPath) => {
  if (file_type(inputPath) === "dir") {
    const entries = await list_directory(inputPath);
    if (entry.startsWith(PUBLIC_ROOT)) {
      await run_task("BUILD.js", entry);
      return;
    }
    const subBuild = entries.find((entry) => entry.endsWith("BUILD.js"));
    if (subBuild) {
      await run_task(subBuild, null);
      return;
    }

    await Promise.all(
      entries.map(async (entry) => {
        // Don't build anything starting with _
        if (entry.startsWith("_")) return;

        if (file_type(entry) === "dir") {
          await run_task("BUILD.js", entry);
        } else if (
          Object.keys(BUILD_EXTS).find((ext) => inputPath.endsWith(`.${ext}`))
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
  } else {
    const { outputPath, ext } = inputPathToOutputPath(inputPath);
    let output = await run_task(`./build/${ext}.js`, { inputPath, outputPath });
    if (outputPath.endsWith(".html")) {
      output = await minify_html(output);
    }
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
