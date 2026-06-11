import { PublishContext } from "./PublishContext";
import { PipelineStage } from "./PipelineStage";
import { PipelineResult } from "./PipelineResult";
import { StageResult } from "./StageResult";
import { performance } from "perf_hooks";

export class PipelineExecutor {
  private stages: PipelineStage[] = [];

  addStage(stage: PipelineStage): this {
    this.stages.push(stage);
    return this;
  }

  async run(context: PublishContext): Promise<PipelineResult> {
    const metrics: StageResult[] = [];
    const executedStages: PipelineStage[] = [];

    for (const stage of this.stages) {
      const startTime = performance.now();
      try {
        const result = await stage.execute(context);
        const durationMs = Number((performance.now() - startTime).toFixed(2));
        result.durationMs = durationMs;
        result.operation = "EXECUTE";
        metrics.push(result);
        console.log(`   [Pipeline Metric] ${result.stageName} took ${durationMs}ms (success: ${result.success})`);

        if (!result.success) {
          const rollbackMetrics = await this.rollbackAll(executedStages, context);
          metrics.push(...rollbackMetrics);
          return {
            ok: false,
            errorType: result.errorType || "ENV",
            message: result.error || "Stage failed without message",
            metrics
          };
        }

        executedStages.push(stage);
      } catch (err: any) {
        const durationMs = Number((performance.now() - startTime).toFixed(2));
        metrics.push({
          success: false,
          stageName: (stage as any).constructor.name || "UnknownStage",
          durationMs,
          error: err.message || String(err),
          errorType: "ENV",
          operation: "EXECUTE"
        });

        const rollbackMetrics = await this.rollbackAll(executedStages, context);
        metrics.push(...rollbackMetrics);

        return {
          ok: false,
          errorType: "ENV",
          message: err.message || String(err),
          metrics
        };
      }
    }

    return {
      ok: true,
      metrics
    };
  }

  private async rollbackAll(executedStages: PipelineStage[], context: PublishContext): Promise<StageResult[]> {
    const rollbackMetrics: StageResult[] = [];
    for (let i = executedStages.length - 1; i >= 0; i--) {
      const stage = executedStages[i];
      const stageName = (stage as any).constructor.name || "UnknownStage";
      const startTime = performance.now();
      let success = true;
      let error: string | undefined;

      try {
        await stage.rollback(context);
      } catch (err: any) {
        success = false;
        error = err.message || String(err);
        console.error(`[Rollback Error] Failed to roll back stage ${stageName}:`, err);
      }

      const durationMs = Number((performance.now() - startTime).toFixed(2));
      rollbackMetrics.push({
        success,
        stageName,
        durationMs,
        operation: "ROLLBACK",
        error
      });
    }
    return rollbackMetrics;
  }
}
