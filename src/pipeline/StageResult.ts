export interface StageResult {
  success: boolean;
  stageName: string;
  durationMs: number;
  error?: string;
  errorType?: "USER" | "ENV" | "LOGIC";
  operation?: "EXECUTE" | "ROLLBACK";
}
