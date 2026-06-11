import { GitPublishOptions } from "./GitPublishOptions";

export interface PublishRequest {
  sourceFilePath: string;
  problemType: "leetcode" | "normal";
  problemName: string;
  folderName: string;
  difficulty?: string;
  executionTime?: string;
  repoPath: string;
  parentFolderRelativePath: string | null;
  screenshotFilePaths?: string[];
  gitOptions?: GitPublishOptions;
  description?: string;
}
