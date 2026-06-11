import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { setupRepository } from "../services/repoSetupService";

export async function configureDashboard() {
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

  try {
    const entries = fs.readdirSync(basePath, { withFileTypes: true });
    const subdirs = entries
      .filter(entry => entry.isDirectory() && !entry.name.startsWith(".") && !["node_modules", "out", "dist", "venv"].includes(entry.name.toLowerCase()))
      .map(entry => entry.name);

    if (subdirs.length === 0) {
      vscode.window.showInformationMessage("No folders available to track in the repository root.");
      return;
    }

    const trackedFolders = config.get<string[]>("dashboard.trackedFolders") || [];

    const items: vscode.QuickPickItem[] = subdirs.map(dir => {
      return {
        label: dir,
        picked: trackedFolders.includes(dir)
      };
    });

    const selected = await vscode.window.showQuickPick(items, {
      canPickMany: true,
      placeHolder: "Select root folders to track for Progress Dashboard",
      ignoreFocusOut: true
    });

    if (selected === undefined) {
      return;
    }

    const selectedFolders = selected.map(item => item.label);
    await config.update(
      "dashboard.trackedFolders",
      selectedFolders,
      vscode.ConfigurationTarget.Global
    );

    vscode.window.showInformationMessage(
      `Tracked folders updated successfully: ${selectedFolders.join(", ") || "None"}`
    );
  } catch (err: any) {
    vscode.window.showErrorMessage(`Failed to configure dashboard: ${err.message}`);
  }
}
