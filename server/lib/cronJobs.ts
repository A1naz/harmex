import cron from "node-cron";
import emailCampaignService from "./emailCampaignService";

/**
 * Initialize all cron jobs
 */
export function initializeCronJobs() {
  // Run email campaign processor every 2 hours
  // Cron expression: "0 */2 * * *" means every 2 hours at minute 0
  const emailCampaignJob = cron.schedule(
    "0 */2 * * *",
    async () => {
      console.log("[Cron] Starting email campaign processor...");
      try {
        const stats = await emailCampaignService.processCampaigns();
        console.log("[Cron] Email campaign processor completed:", stats);
      } catch (error) {
        console.error("[Cron] Email campaign processor failed:", error);
      }
    },
    {
      scheduled: true,
      timezone: "Europe/Moscow", // Adjust to your timezone
    }
  );

  console.log(
    "[Cron] Email campaign job scheduled to run every 2 hours"
  );

  // Return jobs for potential cleanup
  return {
    emailCampaignJob,
  };
}

/**
 * Stop all cron jobs
 */
export function stopAllCronJobs(jobs: any) {
  if (jobs.emailCampaignJob) {
    jobs.emailCampaignJob.stop();
    console.log("[Cron] Email campaign job stopped");
  }
}

