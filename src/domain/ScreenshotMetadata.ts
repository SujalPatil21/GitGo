export type ScreenshotType =
  | "testcase"
  | "submission"
  | "output";

export interface ScreenshotMetadata {
  type: ScreenshotType;
  originalName: string;
  targetName: string;
  absolutePath: string;
}
