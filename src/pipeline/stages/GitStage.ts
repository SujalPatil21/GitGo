import { PipelineStage } from "../PipelineStage";
import { PublishContext } from "../PublishContext";
import { StageResult } from "../StageResult";
import { runGitCommands, runGitCommandsWithPR } from "../../services/gitService";
import { getDefaultBranch } from "../../services/defaultBranchDetector";
import { runGitCommand } from "../../services/git/GitCommandRunner";

export class GitStage implements PipelineStage {
  async execute(context: PublishContext): Promise<StageResult> {
    const stageName = "GitStage";

    if (context.request.gitOptions) {
      if (context.request.gitOptions.pushMode === "normal") {
        const gitResult = await runGitCommands(context.repoPath, context.request.problemName, context);
        if (!gitResult.ok) {
          return {
            success: false,
            stageName,
            durationMs: 0,
            error: gitResult.message,
            errorType: gitResult.errorType
          };
        }
      } else {
        const branchName = context.request.gitOptions.branchName || "feature/add-solution";
        const gitResult = await runGitCommandsWithPR(
          context.repoPath,
          context.request.problemName,
          branchName,
          context.request.executionTime || "",
          context.request.problemType,
          context.request.difficulty || "",
          context.author.name,
          context.author.github,
          context.standardFileName,
          context
        );
        if (!gitResult.ok) {
          return {
            success: false,
            stageName,
            durationMs: 0,
            error: gitResult.message,
            errorType: gitResult.errorType
          };
        }
      }
    }

    return {
      success: true,
      stageName,
      durationMs: 0
    };
  }

  async rollback(context: PublishContext): Promise<void> {
    if (!context.request.gitOptions) {
      return;
    }

    const repoPath = context.repoPath;
    const branchName = context.request.gitOptions.branchName || "feature/add-solution";
    
    if (context.request.gitOptions.pushMode === "normal") {
      if (context.commitHash) {
        // Reset the commit created in this transaction
        runGitCommand(["reset", "--hard", "HEAD~1"], repoPath, 10000);
      }
    } else {
      const baseBranchResult = getDefaultBranch(repoPath);
      const baseBranch = baseBranchResult.ok ? baseBranchResult.data : "main";
      
      // Checkout to main or base branch first
      runGitCommand(["checkout", baseBranch], repoPath, 10000);

      if (context.branchPushed) {
        try {
          runGitCommand(["push", "origin", "--delete", branchName], repoPath, 60000);
        } catch {}
      }

      if (context.createdBranch) {
        try {
          runGitCommand(["branch", "-D", branchName], repoPath, 10000);
        } catch {}
      }
    }
  }
}
