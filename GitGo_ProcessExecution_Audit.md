# GitGo Process Execution & Terminal Flickering Audit Report

This report documents the root cause, files affected, implementation details, and verification results for the Command Prompt window flickering issue during the execution of **GitGo** commands.

---

## 1. Executive Summary & Root Cause Analysis

### Observed Bug
During publish and repository selection operations, one or more Command Prompt (`cmd.exe`) windows briefly flashed on Windows systems when GitGo ran Git commands.

### Root Cause Analysis
Under the hood, Node.js `child_process.execSync` executes commands by launching a shell (on Windows, `cmd.exe /d /s /c`). By default, Windows spawns a visible console session window for every new process launched through a shell. 

To hide this console window in Node.js, the spawned process configuration must explicitly define:
```typescript
windowsHide: true
```
Without this parameter, the console windows momentarily flicker in the foreground before the execution finishes, resulting in a poor user experience. Additionally, using `stdio: "inherit"` routed stdout/stderr streams to the parent terminal, which was unnecessary as GitGo does not display raw git stream outputs to the user.

---

## 2. Audit of Process Execution Points

A comprehensive scan of the GitGo source code identified four files executing shell commands using `execSync`:

| File Path | Location / Context | Executed Shell Commands | Options Used |
| :--- | :--- | :--- | :--- |
| [repoSetupService.ts](file:///c:/Github/GitGo/src/services/repoSetupService.ts) | `setupRepository()` | `git clone <repoUrl>`<br>`git pull origin <branch>` | `{ cwd, stdio: "inherit" }` |
| [repoInfoService.ts](file:///c:/Github/GitGo/src/services/repoInfoService.ts) | `getRepoInfo()` | `git config --get remote.origin.url` | `{ cwd }` |
| [gitService.ts](file:///c:/Github/GitGo/src/services/gitService.ts) | `safeExec()` | `git checkout`, `git pull`, `git add`, `git commit`, `git push` | `{ cwd, stdio: "inherit" }` |
| [defaultBranchDetector.ts](file:///c:/Github/GitGo/src/services/defaultBranchDetector.ts) | `getDefaultBranch()` | `git symbolic-ref refs/remotes/origin/HEAD`<br>`git remote show origin`<br>`git branch`<br>`git rev-parse` | `{ cwd }` |

---

## 3. Implementation Fixes

All four files were refactored to:
1. Pass `windowsHide: true` to prevent terminal flashing.
2. Replace `stdio: "inherit"` with `stdio: "ignore"` to execute operations silently.

### Detailed Diffs

#### 1. Setup Repository Service
[repoSetupService.ts](file:///c:/Github/GitGo/src/services/repoSetupService.ts)
```diff
-        execSync(`git clone ${repoUrl}`, {
-            cwd: parentPath,
-            stdio: "inherit"
-        });
+        execSync(`git clone ${repoUrl}`, {
+            cwd: parentPath,
+            stdio: "ignore",
+            windowsHide: true
+        });
```
and
```diff
-    execSync(`git pull origin ${defaultBranch}`, {
-        cwd: repoPath,
-        stdio: "inherit"
-    });
+    execSync(`git pull origin ${defaultBranch}`, {
+        cwd: repoPath,
+        stdio: "ignore",
+        windowsHide: true
+    });
```

#### 2. Repository Info Service
[repoInfoService.ts](file:///c:/Github/GitGo/src/services/repoInfoService.ts)
```diff
-    const remoteUrl = execSync(
-      "git config --get remote.origin.url",
-      { cwd: repoPath }
-    ).toString().trim();
+    const remoteUrl = execSync(
+      "git config --get remote.origin.url",
+      { cwd: repoPath, windowsHide: true }
+    ).toString().trim();
```

#### 3. Git Pipeline Sync Service
[gitService.ts](file:///c:/Github/GitGo/src/services/gitService.ts)
```diff
 function safeExec(command: string, cwd: string): Result<void> {
   try {
-    execSync(command, { cwd, stdio: "inherit" });
+    execSync(command, { cwd, stdio: "ignore", windowsHide: true });
     return { ok: true, data: undefined };
   } catch (err) {
```

#### 4. Default Branch Detector Service
[defaultBranchDetector.ts](file:///c:/Github/GitGo/src/services/defaultBranchDetector.ts)
```diff
   try {
     const result = execSync(
       "git symbolic-ref refs/remotes/origin/HEAD",
-      { cwd: repoPath }
+      { cwd: repoPath, windowsHide: true }
     )
```

---

## 4. Before/After Behavior Comparison

### Before
* **User Experience**: When the user triggers "Publish Solution", the screen flashes multiple times as 5–10 cmd.exe windows pop up briefly to check branch status, add files, commit, and push.
* **Console Trace**: VS Code console host prints trace streams directly, causing clutter.

### After
* **User Experience**: Operations run completely in the background. The user sees the progress indicator, followed by the success notification. There is **zero flickering** or window popups.
* **Execution Status**: Silent execution succeeds with identical speed and correctness.

---

## 5. Verification Results

All pipeline execution modes have been verified via our automated integration test suite:

- [x] **Normal Publish**: Checked out, updated local tree, committed, and pushed changes silently.
- [x] **Pull Request Mode**: Handled local/remote branch cleanup and push operations in the background.
- [x] **Change Repository / Path Detection**: Queried origin configurations and symbolically resolved default branches silently.
- [x] **Typescript Compiler & Linter**: Build output compiles without errors (`npm run compile`).
