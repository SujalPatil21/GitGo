import { PipelineStage } from "../PipelineStage";
import { PublishContext } from "../PublishContext";
import { StageResult } from "../StageResult";
import { copyScreenshots } from "../../services/screenshotHandler";
import * as fs from "fs";

export class ScreenshotStage implements PipelineStage {
  async execute(context: PublishContext): Promise<StageResult> {
    const stageName = "ScreenshotStage";

    if (context.request.screenshotFilePaths && context.request.screenshotFilePaths.length > 0) {
      const screenshotResult = copyScreenshots(
        context.request.screenshotFilePaths,
        context.destinationFolder,
        context.request.problemType as "leetcode" | "normal"
      );

      if (!screenshotResult.ok) {
        return {
          success: false,
          stageName,
          durationMs: 0,
          error: screenshotResult.message,
          errorType: screenshotResult.errorType
        };
      }

      context.screenshots = screenshotResult.data;
    }

    return {
      success: true,
      stageName,
      durationMs: 0
    };
  }

  async rollback(context: PublishContext): Promise<void> {
    if (context.screenshots && context.screenshots.length > 0) {
      for (const s of context.screenshots) {
        if (s.absolutePath && fs.existsSync(s.absolutePath)) {
          fs.rmSync(s.absolutePath, { force: true });
        }
      }
    }
  }
}
