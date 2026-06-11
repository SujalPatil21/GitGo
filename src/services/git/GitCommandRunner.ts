import { spawnSync } from "child_process";
import { Result } from "../../domain/Result";

function parseGitError(args: string[], rawStderr: string): string {
  const cleanStderr = rawStderr.trim();
  if (cleanStderr.includes("pathspec") && cleanStderr.includes("did not match")) {
    return "The branch or file does not exist locally.";
  }
  if (cleanStderr.includes("Could not resolve host") || cleanStderr.includes("unable to access")) {
    return "Network connection failed. Verify your repository connection or internet access.";
  }
  if (cleanStderr.includes("Permission denied") || cleanStderr.includes("Could not read from remote")) {
    return "Git authentication failed. Please verify your credentials.";
  }
  return cleanStderr || "No stderr output.";
}

export function runGitCommand(
  args: string[],
  cwd: string,
  timeoutMs: number
): Result<string> {
  try {
    const result = spawnSync("git", args, {
      cwd,
      windowsHide: true,
      stdio: "pipe",
      timeout: timeoutMs
    });

    if (result.error) {
      const isTimeout = (result.error as any).code === "ETIMEDOUT" ||
        result.signal === "SIGTERM" ||
        result.signal === "SIGKILL";
      if (isTimeout) {
        return {
          ok: false,
          errorType: "ENV",
          message: `Git command timed out after ${timeoutMs / 1000} seconds: git ${args.join(" ")}`
        };
      }
      return {
        ok: false,
        errorType: "ENV",
        message: `Git command failed: git ${args.join(" ")}\nReason: ${result.error.message}`
      };
    }

    if (result.status !== 0) {
      const stderr = result.stderr ? result.stderr.toString().trim() : "";
      const parsedMessage = parseGitError(args, stderr);
      return {
        ok: false,
        errorType: "ENV",
        message: `Git command failed: git ${args.join(" ")}\nReason: ${parsedMessage}`
      };
    }

    const stdout = result.stdout ? result.stdout.toString().trim() : "";
    return {
      ok: true,
      data: stdout
    };
  } catch (err: any) {
    return {
      ok: false,
      errorType: "ENV",
      message: `Failed to execute git command: git ${args.join(" ")}\nReason: ${err.message || String(err)}`
    };
  }
}
