import { PipelineStage } from "../PipelineStage";
import { PublishContext } from "../PublishContext";
import { StageResult } from "../StageResult";
import { copySolutionFile } from "../../services/fileCopier";
import * as fs from "fs";
import * as path from "path";

export class SolutionStage implements PipelineStage {
  async execute(context: PublishContext): Promise<StageResult> {
    const stageName = "SolutionStage";

    const copyResult = copySolutionFile(
      context.request.sourceFilePath,
      context.destinationFolder,
      context.language
    );

    if (!copyResult.ok) {
      return {
        success: false,
        stageName,
        durationMs: 0,
        error: copyResult.message,
        errorType: copyResult.errorType
      };
    }

    return {
      success: true,
      stageName,
      durationMs: 0
    };
  }

  async rollback(context: PublishContext): Promise<void> {
    if (context.destinationFolder && context.standardFileName) {
      const solPath = path.join(context.destinationFolder, context.standardFileName);
      if (fs.existsSync(solPath)) {
        fs.rmSync(solPath, { force: true });
      }
    }
  }
}
