import { StageResult } from "./StageResult";

export interface PipelineResult {
  ok: boolean;
  errorType?: "USER" | "ENV" | "LOGIC";
  message?: string;
  metrics: StageResult[];
}
