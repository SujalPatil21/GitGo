import { Result } from "../domain/Result";
import { runGitCommand } from "./git/GitCommandRunner";

export interface RepoInfo {
  owner: string;
  repo: string;
}

export function getRepoInfo(repoPath: string): Result<RepoInfo> {
  const result = runGitCommand(
    ["config", "--get", "remote.origin.url"],
    repoPath,
    5000
  );

  if (!result.ok) {
    return {
      ok: false,
      errorType: "ENV",
      message: "Failed to detect repository info"
    };
  }

  const remoteUrl = result.data.trim();

  // https://github.com/user/repo.git
  if (remoteUrl.startsWith("https://")) {
    const parts = remoteUrl.split("/");
    const owner = parts[parts.length - 2];
    const repo = parts[parts.length - 1].replace(".git", "");
    return { ok: true, data: { owner, repo } };
  }

  // git@github.com:user/repo.git
  if (remoteUrl.startsWith("git@")) {
    const partsColon = remoteUrl.split(":");
    if (partsColon.length > 1) {
      const afterColon = partsColon[1];
      const partsSlash = afterColon.split("/");
      if (partsSlash.length > 1) {
        const owner = partsSlash[0];
        const repoWithGit = partsSlash[1];
        return {
          ok: true,
          data: { owner, repo: repoWithGit.replace(".git", "") }
        };
      }
    }
  }

  return {
    ok: false,
    errorType: "LOGIC",
    message: "Unsupported remote URL format"
  };
}
