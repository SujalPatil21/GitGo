import { Result } from "../domain/Result";
import { runGitCommand } from "./git/GitCommandRunner";

export function getDefaultBranch(repoPath: string): Result<string> {

  // 1. Try to read symbolic-ref refs/remotes/origin/HEAD
  const symbolicRefResult = runGitCommand(
    ["symbolic-ref", "refs/remotes/origin/HEAD"],
    repoPath,
    5000
  );
  if (symbolicRefResult.ok) {
    const result = symbolicRefResult.data.trim();
    if (result) {
      return { ok: true, data: result.replace("refs/remotes/origin/", "") };
    }
  }

  // 2. Try to query origin remote using git remote show origin
  const showResult = runGitCommand(
    ["remote", "show", "origin"],
    repoPath,
    5000
  );
  if (showResult.ok) {
    const match = showResult.data.match(/HEAD branch:\s*(\S+)/);
    if (match && match[1]) {
      return { ok: true, data: match[1].trim() };
    }
  }

  // 3. Check common branch names locally
  const branchesResult = runGitCommand(
    ["branch", "--format=%(refname:short)"],
    repoPath,
    5000
  );
  if (branchesResult.ok) {
    const branches = branchesResult.data
      .split("\n")
      .map(b => b.trim())
      .filter(Boolean);

    for (const b of ["main", "master", "develop", "dev"]) {
      if (branches.includes(b)) {
        return { ok: true, data: b };
      }
    }

    // 4. Try current active branch
    const currentResult = runGitCommand(
      ["rev-parse", "--abbrev-ref", "HEAD"],
      repoPath,
      5000
    );
    if (currentResult.ok) {
      const current = currentResult.data.trim();
      if (current && current !== "HEAD") {
        return { ok: true, data: current };
      }
    }
  }

  return { ok: true, data: "main" }; // ultimate fallback
}
