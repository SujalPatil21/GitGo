import * as vscode from "vscode";
import { setupRepository } from "../services/repoSetupService";
import { ChangeRepositoryUseCase } from "../application/ChangeRepositoryUseCase";

export async function changeRepository() {
  const config = vscode.workspace.getConfiguration("gitgo");

  try {
    const newPath = await setupRepository();

    const useCase = new ChangeRepositoryUseCase();
    const result = await useCase.execute(newPath);

    if (!result.ok) {
      vscode.window.showErrorMessage(result.message);
      return;
    }

    await config.update(
      "repoPath",
      newPath,
      vscode.ConfigurationTarget.Global
    );

    vscode.window.showInformationMessage(
      "Repository updated successfully"
    );
  } catch (err: any) {
    if (err.message) {
      vscode.window.showErrorMessage(err.message);
    }
  }
}

