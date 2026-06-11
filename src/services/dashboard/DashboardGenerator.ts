import { ProblemMetadata } from "./DashboardScanner";

const LANGUAGE_MAP: Record<string, string> = {
  ".java": "Java",
  ".py": "Python",
  ".cpp": "C++",
  ".cc": "C++",
  ".cxx": "C++",
  ".c": "C",
  ".js": "JavaScript",
  ".ts": "TypeScript",
  ".go": "Go",
  ".cs": "C#",
  ".kt": "Kotlin",
  ".rs": "Rust"
};

const LANGUAGE_COLORS: Record<string, string> = {
  "Java": "blue",
  "Python": "yellow",
  "C++": "purple",
  "C": "grey",
  "JavaScript": "gold",
  "TypeScript": "blue",
  "Go": "lightblue",
  "C#": "purple",
  "Kotlin": "purple",
  "Rust": "orange"
};

export function generateDashboardMarkdown(
  problems: ProblemMetadata[],
  title: string = "Progress Dashboard",
  currentDate: Date = new Date()
): string {
  const totalProblems = problems.length;

  const difficultyCounts = {
    Easy: 0,
    Medium: 0,
    Hard: 0,
    Unclassified: 0
  };

  const languageCounts: Record<string, number> = {};

  for (const prob of problems) {
    // 1. Difficulty count
    if (prob.difficulty in difficultyCounts) {
      difficultyCounts[prob.difficulty]++;
    } else {
      difficultyCounts.Unclassified++;
    }

    // 2. Language count (deduplicated per problem folder)
    const uniqueLangsInProb = new Set<string>();
    for (const ext of prob.languages) {
      const langName = LANGUAGE_MAP[ext.toLowerCase()];
      if (langName) {
        uniqueLangsInProb.add(langName);
      }
    }

    for (const lang of uniqueLangsInProb) {
      languageCounts[lang] = (languageCounts[lang] || 0) + 1;
    }
  }

  const sections: string[] = [];

  // Section 1: Title & Badges
  const badgeLines: string[] = [];
  badgeLines.push(`![Problems](https://img.shields.io/badge/Problems-${totalProblems}-blue)`);
  if (difficultyCounts.Easy > 0) {
    badgeLines.push(`![Easy](https://img.shields.io/badge/Easy-${difficultyCounts.Easy}-success)`);
  }
  if (difficultyCounts.Medium > 0) {
    badgeLines.push(`![Medium](https://img.shields.io/badge/Medium-${difficultyCounts.Medium}-orange)`);
  }
  if (difficultyCounts.Hard > 0) {
    badgeLines.push(`![Hard](https://img.shields.io/badge/Hard-${difficultyCounts.Hard}-red)`);
  }
  if (difficultyCounts.Unclassified > 0) {
    badgeLines.push(`![Unclassified](https://img.shields.io/badge/Unclassified-${difficultyCounts.Unclassified}-grey)`);
  }
  sections.push(`# ${title}\n\n${badgeLines.join("\n")}`);

  // Section 2: Statistics Table
  const tableLines: string[] = [];
  tableLines.push("## Statistics");
  tableLines.push("");
  tableLines.push("| Metric         | Count |");
  tableLines.push("| -------------- | ----- |");
  tableLines.push(`| Total Problems | ${totalProblems}   |`);
  if (difficultyCounts.Easy > 0) {
    tableLines.push(`| Easy           | ${difficultyCounts.Easy}    |`);
  }
  if (difficultyCounts.Medium > 0) {
    tableLines.push(`| Medium         | ${difficultyCounts.Medium}    |`);
  }
  if (difficultyCounts.Hard > 0) {
    tableLines.push(`| Hard           | ${difficultyCounts.Hard}    |`);
  }
  if (difficultyCounts.Unclassified > 0) {
    tableLines.push(`| Unclassified   | ${difficultyCounts.Unclassified}    |`);
  }
  sections.push(tableLines.join("\n"));

  // Section 3: Languages
  const sortedLanguages = Object.entries(languageCounts)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => {
      if (b[1] !== a[1]) {
        return b[1] - a[1];
      }
      return a[0].localeCompare(b[0]);
    });

  if (sortedLanguages.length > 0) {
    const langBadgeLines: string[] = [];
    langBadgeLines.push("## Languages");
    langBadgeLines.push("");
    const badges = sortedLanguages.map(([langName, count]) => {
      const color = LANGUAGE_COLORS[langName] || "grey";
      const encodedName = encodeURIComponent(langName);
      return `![${langName}](https://img.shields.io/badge/${encodedName}-${count}-${color})`;
    });
    langBadgeLines.push(badges.join("\n"));
    sections.push(langBadgeLines.join("\n"));
  }

  // Section 4: Last Updated
  const yyyy = currentDate.getFullYear();
  const mm = String(currentDate.getMonth() + 1).padStart(2, "0");
  const dd = String(currentDate.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}-${mm}-${dd}`;
  sections.push(`Last Updated: ${dateStr}`);

  return sections.join("\n\n---\n\n");
}
