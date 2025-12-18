import { aiModelsConfig } from "./AI";

export default defineEventHandler(() => {
  return {
    success: true,
    models: aiModelsConfig,
  };
});
