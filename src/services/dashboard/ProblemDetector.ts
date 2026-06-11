import * as fs from "fs";
import * as path from "path";

export const SUPPORTED_EXTENSIONS = [
  ".java",
  ".py",
  ".cpp",
  ".cc",
  ".cxx",
  ".c",
  ".js",
  ".ts",
  ".go",
  ".cs",
  ".kt",
  ".rs"
];

export const EXCLUSIONS = [
  "templates",
  "utils",
  "boilerplate",
  "notes",
  "assets",
  "doc",
  "docs",
  "test",
  "tests",
  "debug",
  "scripts",
  ".git",
  ".github",
  ".vscode",
  "node_modules",
  "out",
  "dist",
  "venv",
  "bin",
  "obj"
];

export function hasSourceCode(dirPath: string): boolean {
  try {
    const files = fs.readdirSync(dirPath);
    return files.some(file => {
      const ext = path.extname(file).toLowerCase();
      const fullPath = path.join(dirPath, file);
      if (fs.statSync(fullPath).isFile()) {
        // filter out files under 50 bytes to avoid empty templates
        if (fs.statSync(fullPath).size >= 50) {
          if (SUPPORTED_EXTENSIONS.includes(ext)) {
            // Check for utility/boilerplate filename exclusions
            const baseName = path.basename(file).toLowerCase();
            if (["fastio", "template", "boilerplate"].some(word => baseName.includes(word))) {
              return false;
            }
            return true;
          }
        }
      }
      return false;
    });
  } catch {
    return false;
  }
}

export function isProblemFolder(dirPath: string): boolean {
  const baseName = path.basename(dirPath).toLowerCase();
  if (EXCLUSIONS.includes(baseName)) {
    return false;
  }

  // 1. Must contain source code
  if (!hasSourceCode(dirPath)) {
    return false;
  }

  // 2. Leaf folder check: must not contain any child folders that are problem folders
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subName = entry.name.toLowerCase();
        if (EXCLUSIONS.includes(subName)) {
          continue;
        }
        const subDirPath = path.join(dirPath, entry.name);
        if (isProblemFolder(subDirPath)) {
          return false;
        }
      }
    }
  } catch {
    return false;
  }

  return true;
}
