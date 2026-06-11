import * as vscode from "vscode";

import { detectLanguage } from "../services/languageDetector";
import { setupRepository } from "../services/repoSetupService";
import { selectParentFolder } from "../services/parentFolderSelector";
import { selectPushMode } from "../services/pushModeSelector";

import { askBranchName } from "../services/branchNamePrompt";
import { selectProblemType } from "../services/problemTypeSelector";
import { askExecutionTime } from "../services/executionTimePrompt";
import { askDifficulty } from "../services/difficultyPrompt";
import { getOrCreateAuthor } from "../services/authorService";
import { isValidBranchName, isValidProblemName } from "../services/inputValidator";

import { PushMode } from "../types/pushMode";
import { ProblemType } from "../types/problemType";
import { PublishRequest } from "../domain/PublishRequest";
import { PublishSolutionUseCase } from "../application/PublishSolutionUseCase";

export async function publishSolution() {

  try {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      vscode.window.showErrorMessage("No active file open");
      return;
    }

    const filePath = editor.document.fileName;

    /* ============================= */
    /* LANGUAGE VALIDATION           */
    /* ============================= */

    const languageResult = detectLanguage(filePath);

    if (!languageResult.ok) {
      vscode.window.showErrorMessage(languageResult.message);
      return;
    }

    /* ============================= */
    /* AUTHOR                        */
    /* ============================= */

    const author = await getOrCreateAuthor();

    /* ============================= */
    /* PROBLEM TYPE                  */
    /* ============================= */

    const problemType = await selectProblemType();

    /* ============================= */
    /* DIFFICULTY + EXEC TIME        */
    /* ============================= */

    let difficulty: string | undefined;
    let executionTime: string | undefined;

    if (problemType === ProblemType.LEETCODE) {
      difficulty = await askDifficulty();
      executionTime = await askExecutionTime();
    }

    /* ============================= */
    /* PUSH MODE + BRANCH NAME       */
    /* ============================= */

    const pushMode = await selectPushMode();
    let branchName: string | undefined;

    if (pushMode === PushMode.PULL_REQUEST) {
      branchName = await askBranchName();
      if (!isValidBranchName(branchName)) {
        vscode.window.showErrorMessage(
          "Invalid branch name. Branch names must not contain spaces or special characters like :, ~, ^, ?, *, [, \\, @{, or .."
        );
        return;
      }
    }

    /* ============================= */
    /* REPOSITORY SETUP              */
    /* ============================= */

    const config = vscode.workspace.getConfiguration("gitgo");
    let basePath = config.get<string>("repoPath");

    if (basePath && basePath.trim() === "") {
      basePath = undefined;
    }

    if (!basePath) {
      basePath = await setupRepository();

      await config.update(
        "repoPath",
        basePath,
        vscode.ConfigurationTarget.Global
      );
    }

    /* ============================= */
    /* PARENT FOLDER                 */
    /* ============================= */

    const parentFolder = await selectParentFolder(basePath);
    if (parentFolder === undefined) {
      vscode.window.showWarningMessage("Parent folder selection cancelled");
      return;
    }

    let problemFolderFromParent: string | null = null;
    let targetParent: string | null = parentFolder;

    if (parentFolder && parentFolder.startsWith("__SELF__/")) {
      problemFolderFromParent = parentFolder.replace("__SELF__/", "");
      targetParent = null;
    }

    /* ============================= */
    /* PROBLEM / FOLDER NAMES        */
    /* ============================= */

    let folderName = "";
    let problemName = "";

    if (problemFolderFromParent) {
      folderName = problemFolderFromParent;
      problemName = folderName.replace(/^\d+-/, "").replace(/-/g, " ");
    } else {
      const folderNameInput = await vscode.window.showInputBox({
        prompt: "Enter problem folder name (e.g., 231-Power-of-Two)",
        ignoreFocusOut: true
      });

      if (!folderNameInput) {
        vscode.window.showWarningMessage("Folder name selection cancelled");
        return;
      }

      folderName = folderNameInput.trim();
      if (!folderName) {
        vscode.window.showErrorMessage("Problem folder name required");
        return;
      }
      problemName = folderName.replace(/^\d+-/, "").replace(/-/g, " ");
    }

    if (!isValidProblemName(problemName)) {
      vscode.window.showErrorMessage(
        "Invalid problem name. Problem names must not contain characters like \", ', &, |, >, <, or ;"
      );
      return;
    }

    /* ============================= */
    /* SCREENSHOT PICKING            */
    /* ============================= */

    const screenshotUris = await vscode.window.showOpenDialog({
      canSelectMany: true,
      openLabel: "Select screenshots (Optional)",
      filters: {
        Images: ["png", "jpg", "jpeg"]
      }
    });

    const screenshotFilePaths = screenshotUris ? screenshotUris.map(uri => uri.fsPath) : [];

    if (problemType === ProblemType.LEETCODE && screenshotFilePaths.length === 0) {
      vscode.window.showWarningMessage("At least one screenshot is expected for LeetCode solutions.");
    }

    /* ============================= */
    /* CONSTRUCT REQUEST & EXECUTE   */
    /* ============================= */

    const request: PublishRequest = {
      sourceFilePath: filePath,
      problemType: problemType === ProblemType.LEETCODE ? "leetcode" : "normal",
      problemName,
      folderName,
      difficulty,
      executionTime,
      repoPath: basePath,
      parentFolderRelativePath: targetParent,
      screenshotFilePaths,
      gitOptions: {
        pushMode: pushMode === PushMode.NORMAL ? "normal" : "pull_request",
        branchName
      }
    };

    const useCase = new PublishSolutionUseCase();
    const result = await useCase.execute(request, author);

    if (!result.ok) {
      vscode.window.showErrorMessage(result.message);
      return;
    }

    /* ============================= */
    /* SUCCESS                       */
    /* ============================= */

    vscode.window.showInformationMessage(
      `Published Successfully\n${folderName}`
    );

  } catch (err: any) {
    if (err.message) {
      vscode.window.showErrorMessage(err.message);
    }
  }
}


