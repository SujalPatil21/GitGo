import { PublishRequest } from "../domain/PublishRequest";
import { Author } from "../domain/Author";
import { RepoInfo } from "../services/repoInfoService";
import { ScreenshotMetadata } from "../domain/ScreenshotMetadata";

export interface PublishContext {
  request: PublishRequest;
  language: string;
  standardFileName: string;
  author: Author;
  repoPath: string;
  destinationFolder: string;
  repositoryInfo?: RepoInfo;
  screenshots: ScreenshotMetadata[];
  codeContent: string;
  createdDirectory?: boolean;
  createdReadme?: boolean;
  createdBranch?: boolean;
  branchPushed?: boolean;
  commitHash?: string;
  description?: string;
}
