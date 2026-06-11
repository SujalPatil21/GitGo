import * as fs from "fs";
import * as path from "path";
import { isProblemFolder, EXCLUSIONS, SUPPORTED_EXTENSIONS } from "./ProblemDetector";
import { resolveDifficulty } from "./DifficultyResolver";

export interface ProblemMetadata {
  folderPath: string;
  folderName: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Unclassified";
  languages: string[];
  lastModified: Date;
}

export function scanRepository(repoPath: string, trackedFolders: string[] = []): ProblemMetadata[] {
  const problems: ProblemMetadata[] = [];

  function scanDir(dirPath: string) {
    const baseName = path.basename(dirPath).toLowerCase();
    if (EXCLUSIONS.includes(baseName)) {
      return;
    }

    if (isProblemFolder(dirPath)) {
      const folderName = path.basename(dirPath);
      const difficulty = resolveDifficulty(dirPath, repoPath);

      const files = fs.readdirSync(dirPath);
      const languagesSet = new Set<string>();
      let maxTime = new Date(0);

      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (SUPPORTED_EXTENSIONS.includes(ext)) {
          languagesSet.add(ext);
          try {
            const stats = fs.statSync(path.join(dirPath, file));
            if (stats.mtime > maxTime) {
              maxTime = stats.mtime;
            }
          } catch {
            // ignore
          }
        }
      }

      problems.push({
        folderPath: dirPath,
        folderName,
        difficulty,
        languages: Array.from(languagesSet),
        lastModified: maxTime.getTime() > 0 ? maxTime : new Date()
      });
      return;
    }

    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const subName = entry.name.toLowerCase();
          if (EXCLUSIONS.includes(subName)) {
            continue;
          }
          scanDir(path.join(dirPath, entry.name));
        }
      }
    } catch {
      // ignore
    }
  }

  if (trackedFolders && trackedFolders.length > 0) {
    for (const folder of trackedFolders) {
      const folderPath = path.join(repoPath, folder);
      if (fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory()) {
        scanDir(folderPath);
      }
    }
  } else {
    scanDir(repoPath);
  }

  return problems;
}
