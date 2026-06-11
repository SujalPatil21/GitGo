import { PipelineStage } from "../PipelineStage";
import { PublishContext } from "../PublishContext";
import { StageResult } from "../StageResult";
import * as fs from "fs";
import * as path from "path";
import { isValidBranchName, isValidProblemName } from "../../services/inputValidator";

export class ValidationStage implements PipelineStage {
  async execute(context: PublishContext): Promise<StageResult> {
    const stageName = "ValidationStage";
    const request = context.request;

    // Validate repoPath
    if (!request.repoPath || request.repoPath.trim() === "") {
      return {
        success: false,
        stageName,
        durationMs: 0,
        error: "Repository path is required",
        errorType: "USER"
      };
    }

    const gitDir = path.join(request.repoPath, ".git");
    if (!fs.existsSync(gitDir)) {
      return {
        success: false,
        stageName,
        durationMs: 0,
        error: `Invalid repository path: '${request.repoPath}' is not a Git repository (missing .git folder)`,
        errorType: "USER"
      };
    }

    // Validate source file exists
    if (!fs.existsSync(request.sourceFilePath)) {
      return {
        success: false,
        stageName,
        durationMs: 0,
        error: `Source file does not exist: '${request.sourceFilePath}'`,
        errorType: "USER"
      };
    }

    // Validate problem name
    if (!isValidProblemName(request.problemName)) {
      return {
        success: false,
        stageName,
        durationMs: 0,
        error: `Invalid problem name: '${request.problemName}'. Problem names must not contain characters like ", ', &, |, >, <, or ;`,
        errorType: "USER"
      };
    }

    // Validate branch name if pull request push mode is selected
    if (request.gitOptions && request.gitOptions.pushMode === "pull_request") {
      const branchName = request.gitOptions.branchName || "feature/add-solution";
      if (!isValidBranchName(branchName)) {
        return {
          success: false,
          stageName,
          durationMs: 0,
          error: `Invalid branch name: '${branchName}'. Branch names must not contain spaces or special characters like :, ~, ^, ?, *, [, \\, @{, or ..`,
          errorType: "USER"
        };
      }
    }

    return {
      success: true,
      stageName,
      durationMs: 0
    };
  }

  async rollback(context: PublishContext): Promise<void> {
    // Read-only: no rollback action required
  }
}
