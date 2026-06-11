import { PipelineStage } from "../PipelineStage";
import { PublishContext } from "../PublishContext";
import { StageResult } from "../StageResult";
import { generateReadme } from "../../services/readmeGenerator";
import { ProblemType } from "../../types/problemType";
import * as fs from "fs";
import * as path from "path";

export class ReadmeStage implements PipelineStage {
  async execute(context: PublishContext): Promise<StageResult> {
    const stageName = "ReadmeStage";

    const readmeResult = generateReadme(
      context.destinationFolder,
      context.request.problemType as ProblemType,
      context.request.problemName,
      context.language,
      context.codeContent,
      context.request.executionTime || "",
      context.request.difficulty || "",
      context.standardFileName,
      context.author,
      context.screenshots,
      context.description
    );

    if (!readmeResult.ok) {
      return {
        success: false,
        stageName,
        durationMs: 0,
        error: readmeResult.message,
        errorType: readmeResult.errorType
      };
    }

    context.createdReadme = true;

    return {
      success: true,
      stageName,
      durationMs: 0
    };
  }

  async rollback(context: PublishContext): Promise<void> {
    if (context.createdReadme && context.destinationFolder) {
      const readmePath = path.join(context.destinationFolder, "README.md");
      if (fs.existsSync(readmePath)) {
        fs.rmSync(readmePath, { force: true });
      }
    }
  }
}
