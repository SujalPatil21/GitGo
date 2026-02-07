import * as vscode from "vscode";

export async function askBranchName(): Promise<string> {
  const name = await vscode.window.showInputBox({
    prompt: "Enter new branch name (e.g., feature/add-solution)",
    ignoreFocusOut: true
  });

  if (!name) {
    throw new Error("Branch name required");
  }

  return name.trim();
}
