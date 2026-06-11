import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { PublishRequest } from "../domain/PublishRequest";
import { Result } from "../domain/Result";
import { Author } from "../domain/Author";
import { buildPublishContext } from "../pipeline/PublishContextBuilder";
import { PipelineExecutor } from "../pipeline/PipelineExecutor";
import { ValidationStage } from "../pipeline/stages/ValidationStage";
import { DirectoryStage } from "../pipeline/stages/DirectoryStage";
import { SolutionStage } from "../pipeline/stages/SolutionStage";
import { ScreenshotStage } from "../pipeline/stages/ScreenshotStage";
import { ReadmeStage } from "../pipeline/stages/ReadmeStage";
import { GitStage } from "../pipeline/stages/GitStage";
import { scanRepository } from "../services/dashboard/DashboardScanner";
import { generateDashboardMarkdown } from "../services/dashboard/DashboardGenerator";
import { writeDashboardToReadme } from "../services/dashboard/ReadmeDashboardWriter";

export class PublishSolutionUseCase {
  async execute(request: PublishRequest, author: Author): Promise<Result<void>> {
    // 1. Build Context
    const contextResult = await buildPublishContext(request, author);
    if (!contextResult.ok) {
      return { ok: false, errorType: contextResult.errorType, message: contextResult.message };
    }
    const context = contextResult.data;

    // 2. Create Executor & Run Pipeline
    const executor = new PipelineExecutor()
      .addStage(new ValidationStage())
      .addStage(new DirectoryStage())
      .addStage(new SolutionStage())
      .addStage(new ScreenshotStage())
      .addStage(new ReadmeStage())
      .addStage(new GitStage());

    const pipelineResult = await executor.run(context);

    if (!pipelineResult.ok) {
      return {
        ok: false,
        errorType: pipelineResult.errorType || "ENV",
        message: pipelineResult.message || "Pipeline execution failed"
      };
    }

    // 3. Auto sync dashboard
    try {
      const leetcodePath = path.join(request.repoPath, "LeetCode");
      let targetDir: string;
      let scanFolders: string[];

      if (fs.existsSync(leetcodePath) && fs.statSync(leetcodePath).isDirectory()) {
        targetDir = leetcodePath;
        scanFolders = ["LeetCode"];
      } else {
        targetDir = request.repoPath;
        scanFolders = [];
      }

      const problems = scanRepository(request.repoPath, scanFolders);
      const dashboardMarkdown = generateDashboardMarkdown(problems, "LeetCode Progress");
      writeDashboardToReadme(targetDir, dashboardMarkdown);
    } catch (err: any) {
      vscode.window.showWarningMessage(`Solution published successfully, but dashboard sync failed: ${err.message}`);
    }

    return { ok: true, data: undefined };
  }
}
