import * as vscode from "vscode";
import { getDefaultBranch } from "./defaultBranchDetector";
import { getRepoInfo } from "./repoInfoService";
import { generatePRDescription } from "./prDescriptionGenerator";
import { Result } from "../domain/Result";
import { runGitCommand } from "./git/GitCommandRunner";

/* ============================= */
/* NORMAL PUSH MODE              */
/* ============================= */

export async function runGitCommands(
  repoPath: string,
  problemName: string,
  context?: any
): Promise<Result<void>> {
  const branchResult = getDefaultBranch(repoPath);
  if (!branchResult.ok) {
    return { ok: false, errorType: branchResult.errorType, message: branchResult.message };
  }
  const branch = branchResult.data;

  let res = runGitCommand(["checkout", branch], repoPath, 10000);
  if (!res.ok) { return { ok: false, errorType: res.errorType, message: res.message }; }

  res = runGitCommand(["pull", "origin", branch], repoPath, 60000);
  if (!res.ok) { return { ok: false, errorType: res.errorType, message: res.message }; }

  res = runGitCommand(["add", "."], repoPath, 10000);
  if (!res.ok) { return { ok: false, errorType: res.errorType, message: res.message }; }

  res = runGitCommand(
    ["commit", "-m", `Add solution and documentation for ${problemName}`],
    repoPath,
    10000
  );
  if (!res.ok) { return { ok: false, errorType: res.errorType, message: res.message }; }

  if (context) {
    const hashResult = runGitCommand(["rev-parse", "HEAD"], repoPath, 10000);
    context.commitHash = hashResult.ok ? hashResult.data.trim() : "HEAD";
  }

  res = runGitCommand(["push", "origin", branch], repoPath, 60000);
  if (!res.ok) { return { ok: false, errorType: res.errorType, message: res.message }; }

  return { ok: true, data: undefined };
}

/* ============================= */
/* PR MODE COMMANDS              */
/* ============================= */

export async function runGitCommandsWithPR(
  repoPath: string,
  problemName: string,
  branchName: string,
  executionTime: string,
  problemType: string,
  difficulty: string,
  authorName: string,
  authorGithub: string,
  solutionFileName: string,
  context?: any
): Promise<Result<void>> {
  const baseBranchResult = getDefaultBranch(repoPath);
  if (!baseBranchResult.ok) {
    return { ok: false, errorType: baseBranchResult.errorType, message: baseBranchResult.message };
  }
  const baseBranch = baseBranchResult.data;

  /* ============================= */
  /* SYNC BASE BRANCH              */
  /* ============================= */

  let res = runGitCommand(["checkout", baseBranch], repoPath, 10000);
  if (!res.ok) { return { ok: false, errorType: res.errorType, message: res.message }; }

  res = runGitCommand(["pull", "origin", baseBranch], repoPath, 60000);
  if (!res.ok) { return { ok: false, errorType: res.errorType, message: res.message }; }

  /* ============================= */
  /* DELETE LOCAL BRANCH IF EXISTS */
  /* ============================= */

  runGitCommand(["branch", "-D", branchName], repoPath, 10000);

  /* ============================= */
  /* DELETE REMOTE BRANCH IF EXISTS*/
  /* ============================= */

  runGitCommand(["push", "origin", "--delete", branchName], repoPath, 60000);

  /* ============================= */
  /* CREATE FRESH FEATURE BRANCH   */
  /* ============================= */

  res = runGitCommand(["checkout", "-b", branchName], repoPath, 10000);
  if (!res.ok) { return { ok: false, errorType: res.errorType, message: res.message }; }
  if (context) {
    context.createdBranch = true;
  }

  /* ============================= */
  /* COMMIT & PUSH                */
  /* ============================= */

  res = runGitCommand(["add", "."], repoPath, 10000);
  if (!res.ok) { return { ok: false, errorType: res.errorType, message: res.message }; }

  res = runGitCommand(
    ["commit", "-m", `Add solution and documentation for ${problemName}`],
    repoPath,
    10000
  );
  if (!res.ok) { return { ok: false, errorType: res.errorType, message: res.message }; }
  if (context) {
    const hashResult = runGitCommand(["rev-parse", "HEAD"], repoPath, 10000);
    context.commitHash = hashResult.ok ? hashResult.data.trim() : "HEAD";
  }

  res = runGitCommand(["push", "-u", "origin", branchName], repoPath, 60000);
  if (!res.ok) { return { ok: false, errorType: res.errorType, message: res.message }; }
  if (context) {
    context.branchPushed = true;
  }

  /* ============================= */
  /* PR DESCRIPTION GENERATION     */
  /* ============================= */

  const normalizedAuthorGithub = authorGithub.startsWith("http")
    ? authorGithub
    : `https://github.com/${authorGithub}`;

  const prDescription = generatePRDescription(
    problemName,
    executionTime,
    problemType,
    difficulty,
    authorName,
    normalizedAuthorGithub,
    solutionFileName,
    "README.md"
  );

  await vscode.env.clipboard.writeText(prDescription);

  /* ============================= */
  /* OPEN PR PAGE                  */
  /* ============================= */

  const repoInfoResult = getRepoInfo(repoPath);

  if (repoInfoResult.ok) {
    const prUrl =
      `https://github.com/${repoInfoResult.data.owner}/${repoInfoResult.data.repo}` +
      `/compare/${baseBranch}...${branchName}?expand=1`;

    await vscode.env.openExternal(vscode.Uri.parse(prUrl));
  }

  return { ok: true, data: undefined };
}
