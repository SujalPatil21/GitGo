import { PublishContext } from "./PublishContext";
import { StageResult } from "./StageResult";

export interface PipelineStage {
  execute(context: PublishContext): Promise<StageResult>;
  rollback(context: PublishContext): Promise<void>;
}
