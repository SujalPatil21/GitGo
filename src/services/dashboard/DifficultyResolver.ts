import * as fs from "fs";
import * as path from "path";
import { SUPPORTED_EXTENSIONS } from "./ProblemDetector";

export function resolveDifficulty(dirPath: string, repoPath: string): "Easy" | "Medium" | "Hard" | "Unclassified" {
  // 1. README Metadata check
  const readmePath = path.join(dirPath, "README.md");
  if (fs.existsSync(readmePath)) {
    try {
      const readmeContent = fs.readFileSync(readmePath, "utf8");
      
      // Check table format first: | Difficulty | Easy |
      const tableMatch = readmeContent.match(/Difficulty\s*\|\s*(Easy|Medium|Hard)\b/i);
      if (tableMatch && tableMatch[1]) {
        return normalizeDifficulty(tableMatch[1]);
      }

      // Check list/text format: - Difficulty: Easy
      const listMatch = readmeContent.match(/(?:Difficulty\s*[:|-]\s*)\b(Easy|Medium|Hard)\b/i);
      if (listMatch && listMatch[1]) {
        return normalizeDifficulty(listMatch[1]);
      }
    } catch {
      // ignore
    }
  }

  // 2. Folder Path keywords check
  const relativePath = path.relative(repoPath, dirPath);
  const segments = relativePath.split(path.sep).map(s => s.toLowerCase());
  for (const segment of segments) {
    if (segment === "easy") { return "Easy"; }
    if (segment === "medium") { return "Medium"; }
    if (segment === "hard") { return "Hard"; }
  }

  // 3. Source Comment check (first 30 lines of source files)
  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (SUPPORTED_EXTENSIONS.includes(ext)) {
        const filePath = path.join(dirPath, file);
        const contentLines = fs.readFileSync(filePath, "utf8").split("\n").slice(0, 30);
        const diffCommentRegex = /(?:@difficulty|difficulty)\s*[:=~-]?\s*\b(easy|medium|hard)\b/i;
        for (const line of contentLines) {
          const commentMatch = line.match(diffCommentRegex);
          if (commentMatch && commentMatch[1]) {
            return normalizeDifficulty(commentMatch[1]);
          }
        }
      }
    }
  } catch {
    // ignore
  }

  // 4. Folder Name check
  const folderName = path.basename(dirPath).toLowerCase();
  const nameParts = folderName.split(/[^a-zA-Z0-9]/);
  if (nameParts.includes("easy")) { return "Easy"; }
  if (nameParts.includes("medium")) { return "Medium"; }
  if (nameParts.includes("hard")) { return "Hard"; }

  // 5. Unclassified fallback
  return "Unclassified";
}

function normalizeDifficulty(val: string): "Easy" | "Medium" | "Hard" | "Unclassified" {
  const norm = val.trim().toLowerCase();
  if (norm === "easy") { return "Easy"; }
  if (norm === "medium") { return "Medium"; }
  if (norm === "hard") { return "Hard"; }
  return "Unclassified";
}
