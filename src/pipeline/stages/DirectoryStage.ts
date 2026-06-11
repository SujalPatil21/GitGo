import { PipelineStage } from "../PipelineStage";
import { PublishContext } from "../PublishContext";
import { StageResult } from "../StageResult";
import { createProblemFolder } from "../../services/folderCreator";
import * as fs from "fs";
import * as path from "path";

export class DirectoryStage implements PipelineStage {
  async execute(context: PublishContext): Promise<StageResult> {
    const stageName = "DirectoryStage";
    
    const targetBase = context.request.parentFolderRelativePath
      ? path.join(context.repoPath, context.request.parentFolderRelativePath)
      : context.repoPath;
    const fullPath = path.join(targetBase, context.request.folderName);
    const folderExists = fs.existsSync(fullPath);

    const folderResult = createProblemFolder(
      context.repoPath,
      context.request.folderName,
      context.request.parentFolderRelativePath
    );

    if (!folderResult.ok) {
      return {
        success: false,
        stageName,
        durationMs: 0,
        error: folderResult.message,
        errorType: folderResult.errorType
      };
    }

    if (!folderExists) {
      context.createdDirectory = true;
    }

    return {
      success: true,
      stageName,
      durationMs: 0
    };
  }

  async rollback(context: PublishContext): Promise<void> {
    if (context.createdDirectory && context.destinationFolder) {
      if (fs.existsSync(context.destinationFolder)) {
        fs.rmSync(context.destinationFolder, { recursive: true, force: true });
      }
    }
  }
}
