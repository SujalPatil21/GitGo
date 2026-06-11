import { ScreenshotMetadata } from "../domain/ScreenshotMetadata";

export interface LeetCodeTemplateInput {
  problemName: string;
  language: string;
  difficulty: string;
  executionTime: string;
  solutionFile: string;
  authorName: string;
  github: string;
  linkedin: string;
  screenshots: ScreenshotMetadata[];
}

function renderMetadataTable(difficulty: string, language: string, executionTime?: string): string {
  let md = `## Problem Metadata\n\n`;
  md += `| Attribute | Value |\n`;
  md += `|------------|--------|\n`;
  md += `| Difficulty | ${difficulty} |\n`;
  md += `| Language | ${language} |\n`;
  if (executionTime && executionTime.trim() !== "" && executionTime.trim().toLowerCase() !== "not measured") {
    md += `| Execution Time | ${executionTime.trim()} |\n`;
  }
  md += `\n`;
  return md;
}

function renderRepositoryContentsTable(solutionFile: string, screenshots: ScreenshotMetadata[]): string {
  let md = `## Repository Contents\n\n`;
  md += `| File | Description |\n`;
  md += `|--------|-------------|\n`;
  md += `| ${solutionFile} | Solution implementation |\n`;
  md += `| README.md | Problem documentation |\n`;
  for (const s of screenshots) {
    let desc = "Program output screenshot";
    if (s.type === "testcase") {
      desc = "Test case screenshot";
    } else if (s.type === "submission") {
      desc = "Accepted submission screenshot";
    }
    md += `| ${s.targetName} | ${desc} |\n`;
  }
  md += `\n`;
  return md;
}

function renderLeetCodeScreenshots(screenshots: ScreenshotMetadata[]): string {
  const testcase = screenshots.find(s => s.type === "testcase");
  const submission = screenshots.find(s => s.type === "submission");
  const extraScreenshots = screenshots.filter(s => s.type === "output");

  if (!testcase && !submission && extraScreenshots.length === 0) {
    return "";
  }

  let md = "## Screenshots\n\n";
  if (testcase) {
    md += `**Test Case Result**\n\n![Test Case Screenshot](${testcase.targetName})\n\n`;
  }
  if (submission) {
    md += `**Submission Result**\n\n![Submission Screenshot](${submission.targetName})\n\n`;
  }
  extraScreenshots.forEach((s, idx) => {
    md += `**Screenshot ${idx + 3}**\n\n![Screenshot ${idx + 3}](${s.targetName})\n\n`;
  });

  md += "---\n\n";
  return md;
}

function renderAuthorSection(name: string, github: string, linkedin: string): string {
  let md = `## Author\n\n`;
  md += `${name}\n\n`;
  if (github) {
    const cleanGithub = github.trim().replace(/^https?:\/\/(www\.)?github\.com\//, "");
    md += `GitHub:\nhttps://github.com/${cleanGithub}\n\n`;
  }
  if (linkedin) {
    let url = linkedin.trim();
    if (!url.startsWith("http")) {
      url = `https://linkedin.com/in/${url}`;
    }
    md += `LinkedIn:\n${url}\n\n`;
  }
  return md;
}

export function getLeetCodeReadme(data: LeetCodeTemplateInput): string {
  const metadataTable = renderMetadataTable(data.difficulty, data.language, data.executionTime);
  const repositoryContentsTable = renderRepositoryContentsTable(data.solutionFile, data.screenshots);
  const screenshotsSection = renderLeetCodeScreenshots(data.screenshots);
  const authorSection = renderAuthorSection(data.authorName, data.github, data.linkedin);

  let md = `# ${data.problemName}\n\n`;
  md += `A ${data.language} solution for the LeetCode problem **${data.problemName}**.\n\n`;
  md += `---\n\n`;
  md += metadataTable;
  md += `---\n\n`;
  md += repositoryContentsTable;
  md += `---\n\n`;
  md += screenshotsSection;
  md += authorSection;

  return md;
}
