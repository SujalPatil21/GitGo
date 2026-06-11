import * as fs from "fs";
import * as path from "path";
import { Result } from "../domain/Result";
import { ScreenshotMetadata } from "../domain/ScreenshotMetadata";

export function copyScreenshots(
  sourcePaths: string[],
  destFolder: string,
  problemType: "leetcode" | "normal"
): Result<ScreenshotMetadata[]> {
  try {
    const metadata: ScreenshotMetadata[] = [];
    for (let i = 0; i < sourcePaths.length; i++) {
      const sourcePath = sourcePaths[i];
      const ext = path.extname(sourcePath).toLowerCase();
      
      let targetName = "";
      let type: "testcase" | "submission" | "output" = "output";

      if (problemType === "leetcode") {
        if (i === 0) {
          targetName = `testcases${ext}`;
          type = "testcase";
        } else if (i === 1) {
          targetName = `submission${ext}`;
          type = "submission";
        } else {
          targetName = `screenshot_${i + 1}${ext}`;
          type = "output";
        }
      } else {
        type = "output";
        if (i === 0) {
          targetName = `Output${ext}`;
        } else {
          targetName = `Output_${i + 1}${ext}`;
        }
      }

      const destPath = path.join(destFolder, targetName);
      fs.copyFileSync(sourcePath, destPath);

      metadata.push({
        type,
        originalName: path.basename(sourcePath),
        targetName,
        absolutePath: destPath
      });
    }
    return { ok: true, data: metadata };
  } catch (err: any) {
    return {
      ok: false,
      errorType: "ENV",
      message: `Failed to copy screenshots: ${err.message || err}`
    };
  }
}


