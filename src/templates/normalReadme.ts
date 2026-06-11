import { ScreenshotMetadata } from "../domain/ScreenshotMetadata";

export interface NormalProblemData {
  problemName: string;
  description?: string;
  fileName: string;
  authorName: string;
  github: string;
  linkedin: string;
  screenshots: ScreenshotMetadata[];
  language: string;
}

function renderRepositoryContentsTable(fileName: string, screenshots: ScreenshotMetadata[]): string {
  let md = `## Repository Contents\n\n`;
  md += `| File | Description |\n`;
  md += `|--------|-------------|\n`;
  md += `| ${fileName} | Solution implementation |\n`;
  md += `| README.md | Problem documentation |\n`;
  for (const s of screenshots) {
    let desc = "Program output screenshot";
    md += `| ${s.targetName} | ${desc} |\n`;
  }
  md += `\n`;
  return md;
}

function renderNormalScreenshots(screenshots: ScreenshotMetadata[]): string {
  const outputScreenshots = screenshots.filter(s => s.type === "output");
  if (outputScreenshots.length === 0) {
    return "";
  }

  let md = "## Output\n\n";
  if (outputScreenshots.length >= 1) {
    md += `![Program Output](${outputScreenshots[0].targetName})\n\n`;
  }
  for (let i = 1; i < outputScreenshots.length; i++) {
    md += `![Output ${i + 1}](${outputScreenshots[i].targetName})\n\n`;
  }
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

export function getNormalReadme(data: NormalProblemData): string {
  const repositoryContentsTable = renderRepositoryContentsTable(data.fileName, data.screenshots);
  const screenshotsSection = renderNormalScreenshots(data.screenshots);
  const authorSection = renderAuthorSection(data.authorName, data.github, data.linkedin);

  let md = `# ${data.problemName}\n\n`;
  if (data.description && data.description.trim() !== "") {
    md += `${data.description.trim()}\n\n`;
  }
  md += `---\n\n`;
  md += repositoryContentsTable;
  md += `---\n\n`;
  md += screenshotsSection;
  md += authorSection;

  return md;
}
