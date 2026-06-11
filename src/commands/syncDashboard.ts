import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { setupRepository } from "../services/repoSetupService";
import { scanRepository } from "../services/dashboard/DashboardScanner";
import { generateDashboardMarkdown } from "../services/dashboard/DashboardGenerator";
import { writeDashboardToReadme } from "../services/dashboard/ReadmeDashboardWriter";

export async function syncDashboard() {
  const config = vscode.workspace.getConfiguration("gitgo");
  let basePath = config.get<string>("repoPath");

  if (basePath && basePath.trim() === "") {
    basePath = undefined;
  }

  if (!basePath) {
    try {
      basePath = await setupRepository();
      await config.update(
        "repoPath",
        basePath,
        vscode.ConfigurationTarget.Global
      );
    } catch (err: any) {
      if (err.message) {
        vscode.window.showErrorMessage(err.message);
      }
      return;
    }
  }

  if (!basePath || !fs.existsSync(basePath) || !fs.statSync(basePath).isDirectory()) {
    vscode.window.showErrorMessage("Invalid repository path configuration.");
    return;
  }

  // Display progress notification
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "GitGo: Synchronizing Progress Dashboard...",
      cancellable: false
    },
    async () => {
      try {
        const leetcodePath = path.join(basePath!, "LeetCode");
        let targetDir: string;
        let scanFolders: string[];

        if (fs.existsSync(leetcodePath) && fs.statSync(leetcodePath).isDirectory()) {
          targetDir = leetcodePath;
          scanFolders = ["LeetCode"];
        } else {
          targetDir = basePath!;
          scanFolders = [];
        }

        const problems = scanRepository(basePath!, scanFolders);
        const dashboardMarkdown = generateDashboardMarkdown(problems, "LeetCode Progress");
        writeDashboardToReadme(targetDir, dashboardMarkdown);

        vscode.window.showInformationMessage("Progress Dashboard synchronized successfully.");
      } catch (err: any) {
        vscode.window.showErrorMessage(`Failed to sync dashboard: ${err.message}`);
      }
    }
  );
}
