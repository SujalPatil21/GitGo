import * as fs from "fs";
import * as path from "path";

export function writeDashboardToReadme(targetDirectory: string, dashboardMarkdown: string): void {
  const readmePath = path.join(targetDirectory, "README.md");
  const startMarker = "<!-- GITGO_DASHBOARD_START -->";
  const endMarker = "<!-- GITGO_DASHBOARD_END -->";
  const wrappedDashboard = `${startMarker}\n${dashboardMarkdown}\n${endMarker}`;

  // Case C: README does not exist. Create README and insert dashboard.
  if (!fs.existsSync(readmePath)) {
    // Ensure parent directory exists
    fs.mkdirSync(targetDirectory, { recursive: true });
    fs.writeFileSync(readmePath, `${wrappedDashboard}\n`, "utf8");
    return;
  }

  let content = fs.readFileSync(readmePath, "utf8");

  // Regex to match existing markers (case-insensitive, optional spaces)
  const markerRegex = /<!--\s*GITGO_DASHBOARD_START\s*-->[\s\S]*<!--\s*GITGO_DASHBOARD_END\s*-->/i;

  if (markerRegex.test(content)) {
    // Case A: Replace dashboard content between existing markers
    content = content.replace(markerRegex, wrappedDashboard);
  } else {
    // Case B: README exists but markers do not exist. Append to bottom.
    content = `${content.trimEnd()}\n\n${wrappedDashboard}\n`;
  }

  fs.writeFileSync(readmePath, content, "utf8");
}
