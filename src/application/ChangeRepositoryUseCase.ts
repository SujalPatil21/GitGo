import * as fs from "fs";
import * as path from "path";
import { Result } from "../domain/Result";

export class ChangeRepositoryUseCase {
  async execute(newPath: string): Promise<Result<void>> {
    if (!newPath || newPath.trim() === "") {
      return { ok: false, errorType: "USER", message: "Repository path is required" };
    }

    const gitDir = path.join(newPath, ".git");
    if (!fs.existsSync(gitDir)) {
      return {
        ok: false,
        errorType: "USER",
        message: "Selected directory is not a valid Git repository (missing .git folder)"
      };
    }

    return { ok: true, data: undefined };
  }
}
