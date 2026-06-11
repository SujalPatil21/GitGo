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
        const trackedFolders = config.get<string[]>("dashboard.trackedFolders") || [];

        if (trackedFolders.length === 0) {
          const problems = scanRepository(basePath!, []);
          const dashboardMarkdown = generateDashboardMarkdown(problems, "Progress Dashboard");
          writeDashboardToReadme(basePath!, dashboardMarkdown);
        } else {
          for (const folder of trackedFolders) {
            const folderPath = path.join(basePath!, folder);
            if (fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory()) {
              const problems = scanRepository(basePath!, [folder]);
              const dashboardMarkdown = generateDashboardMarkdown(problems, `${folder} Progress`);
              writeDashboardToReadme(folderPath, dashboardMarkdown);
            }
          }
        }

        vscode.window.showInformationMessage("Progress Dashboard synchronized successfully.");
      } catch (err: any) {
        vscode.window.showErrorMessage(`Failed to sync dashboard: ${err.message}`);
      }
    }
  );
}
