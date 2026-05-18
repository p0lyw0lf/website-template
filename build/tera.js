import { run_template } from "driver";

/** ARG: { inputPath: string; outputPath: string } */

export default await run_template(ARG.inputPath, {
  outputPath: ARG.outputPath,
});
