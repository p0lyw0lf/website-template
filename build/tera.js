import { run_tera } from "driver";

/** ARG: { inputPath: string; outputPath: string } */

export default await run_tera(ARG.inputPath, {
  outputPath: ARG.outputPath,
});
