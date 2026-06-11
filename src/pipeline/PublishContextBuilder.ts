import { PublishRequest } from "../domain/PublishRequest";
import { PublishContext } from "./PublishContext";
import { Result } from "../domain/Result";
import { Author } from "../domain/Author";
import { detectLanguage } from "../services/languageDetector";
import { getSolutionFileName } from "../services/solutionFileNameResolver";
import { getRepoInfo } from "../services/repoInfoService";
import * as path from "path";
import * as fs from "fs";

export async function buildPublishContext(
  request: PublishRequest,
  author: Author
): Promise<Result<PublishContext>> {
  const languageResult = detectLanguage(request.sourceFilePath);
  if (!languageResult.ok) {
    return { ok: false, errorType: languageResult.errorType, message: languageResult.message };
  }
  const language = languageResult.data;
  const standardFileName = getSolutionFileName(language);

  const targetBase = request.parentFolderRelativePath
    ? path.join(request.repoPath, request.parentFolderRelativePath)
    : request.repoPath;
  const destinationFolder = path.join(targetBase, request.folderName);

  const repoInfoResult = getRepoInfo(request.repoPath);
  const repositoryInfo = repoInfoResult.ok ? repoInfoResult.data : undefined;

  let codeContent = "";
  try {
    codeContent = fs.readFileSync(request.sourceFilePath, "utf-8");
  } catch (err: any) {
    return {
      ok: false,
      errorType: "ENV",
      message: `Failed to read source file: ${err.message || err}`
    };
  }

  return {
    ok: true,
    data: {
      request,
      language,
      standardFileName,
      author,
      repoPath: request.repoPath,
      destinationFolder,
      repositoryInfo,
      screenshots: [],
      codeContent,
      description: request.description
    }
  };
}
