import * as vscode from "vscode";
import { getDefaultBranch } from "./defaultBranchDetector";
import { runGitCommand } from "./git/GitCommandRunner";
import { isValidRepoUrl } from "./inputValidator";

export async function setupRepository(): Promise<string> {

    const choice = await vscode.window.showQuickPick(
        ["Clone repository", "Open existing repository"],
        { placeHolder: "Select repository setup option" }
    );

    if (!choice) {
        throw new Error("Setup cancelled");
    }

    // ---------- CLONE ----------
    if (choice === "Clone repository") {

        const repoUrl = await vscode.window.showInputBox({
            prompt: "Enter GitHub repository URL"
        });

        if (!repoUrl) {
            throw new Error("Repository URL required");
        }

        if (!isValidRepoUrl(repoUrl)) {
            throw new Error("Invalid repository URL format. Please provide a valid HTTPS or SSH GitHub repository URL.");
        }

        const folderUri = await vscode.window.showOpenDialog({
            canSelectFolders: true,
            openLabel: "Select parent folder"
        });

        if (!folderUri) {
            throw new Error("Folder not selected");
        }

        const parentPath = folderUri[0].fsPath;

        const cloneResult = runGitCommand(
            ["clone", repoUrl],
            parentPath,
            120000
        );

        if (!cloneResult.ok) {
            throw new Error(cloneResult.message);
        }

        // Repo name extracted from URL
        const repoName = repoUrl.split("/").pop()!.replace(".git", "");
        return `${parentPath}/${repoName}`;
    }

    // ---------- OPEN EXISTING ----------
    const folderUri = await vscode.window.showOpenDialog({
        canSelectFolders: true,
        openLabel: "Select existing repository folder"
    });

    if (!folderUri) {
        throw new Error("Folder not selected");
    }

    const repoPath = folderUri[0].fsPath;
    const defaultBranchResult = getDefaultBranch(repoPath);
    const defaultBranch = defaultBranchResult.ok ? defaultBranchResult.data : "main";

    const pullResult = runGitCommand(
        ["pull", "origin", defaultBranch],
        repoPath,
        60000
    );

    if (!pullResult.ok) {
        throw new Error(pullResult.message);
    }

    return repoPath;
}
