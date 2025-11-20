import { User } from "./models/User";
import { EmailCampaign } from "./models/EmailCampaign";
import { EmailLog } from "./models/EmailLog";
import MailService from "./mailService";

export class EmailCampaignService {
  /**
   * Process all users who need to receive campaign emails
   * This should be called periodically (e.g., every 2 hours)
   */
  async processCampaigns(): Promise<{
    processed: number;
    sent: number;
    failed: number;
    skipped: number;
  }> {
    const stats = {
      processed: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
    };

    try {
      // Date threshold: registration date must be after November 20, 2024
      const startDate = new Date("2024-11-20T00:00:00.000Z");

      // Get all users registered after the cutoff date
      const users = await User.find({
        registrationDate: { $gt: startDate },
        email: { $exists: true, $ne: null },
        emailCampaignEnabled: true,
        emailCampaignDay: { $lt: 21 }, // Only users who haven't completed all 21 days
      }).where("email").ne("");

      console.log(
        `[EmailCampaign] Found ${users.length} users to process`
      );

      for (const user of users) {
        stats.processed++;

        try {
          // Skip if no email
          if (!user.email) {
            stats.skipped++;
            continue;
          }

          // Calculate days since registration
          const registrationDate = new Date(user.registrationDate);
          const now = new Date();
          const daysSinceRegistration = Math.floor(
            (now.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          // Determine which day email should be sent (1-21)
          const nextDayToSend = user.emailCampaignDay + 1;

          // Skip if it's not time yet
          if (daysSinceRegistration < nextDayToSend) {
            stats.skipped++;
            continue;
          }

          // Skip if email was already sent today
          if (user.lastCampaignEmailSent) {
            const lastSent = new Date(user.lastCampaignEmailSent);
            const hoursSinceLastSent =
              (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60);
            if (hoursSinceLastSent < 23) {
              // Wait at least 23 hours between emails
              stats.skipped++;
              continue;
            }
          }

          // Check if this email was already sent (safety check)
          const existingLog = await EmailLog.findOne({
            userId: user.uuid,
            campaignDay: nextDayToSend,
            status: "sent",
          });

          if (existingLog) {
            // Email already sent, update user state
            user.emailCampaignDay = nextDayToSend;
            user.lastCampaignEmailSent = existingLog.sentAt;
            await user.save();
            stats.skipped++;
            continue;
          }

          // Get the email template for this day
          const campaign = await EmailCampaign.findOne({
            day: nextDayToSend,
            isActive: true,
          });

          if (!campaign) {
            console.warn(
              `[EmailCampaign] No active campaign found for day ${nextDayToSend}`
            );
            stats.skipped++;
            continue;
          }

          // Replace variables in email content
          let htmlContent = campaign.htmlContent;
          htmlContent = htmlContent.replace(/\{firstName\}/g, user.firstName || "");
          htmlContent = htmlContent.replace(/\{lastName\}/g, user.lastName || "");
          htmlContent = htmlContent.replace(/\{username\}/g, user.username || "");
          htmlContent = htmlContent.replace(/\{email\}/g, user.email || "");
          htmlContent = htmlContent.replace(/\{day\}/g, nextDayToSend.toString());

          // Send the email
          try {
            await MailService.sendCampaignEmail(
              user.email,
              campaign.subject,
              htmlContent
            );

            // Log success
            await EmailLog.create({
              userId: user.uuid,
              campaignDay: nextDayToSend,
              email: user.email,
              subject: campaign.subject,
              status: "sent",
              sentAt: new Date(),
            });

            // Update user state
            user.emailCampaignDay = nextDayToSend;
            user.lastCampaignEmailSent = new Date();
            await user.save();

            stats.sent++;
            console.log(
              `[EmailCampaign] Sent day ${nextDayToSend} email to ${user.email}`
            );
          } catch (emailError: any) {
            // Log failure
            await EmailLog.create({
              userId: user.uuid,
              campaignDay: nextDayToSend,
              email: user.email,
              subject: campaign.subject,
              status: "failed",
              error: emailError?.message || "Unknown error",
              sentAt: new Date(),
            });

            stats.failed++;
            console.error(
              `[EmailCampaign] Failed to send day ${nextDayToSend} email to ${user.email}:`,
              emailError
            );
          }
        } catch (userError) {
          console.error(
            `[EmailCampaign] Error processing user ${user.uuid}:`,
            userError
          );
          stats.failed++;
        }
      }

      console.log(
        `[EmailCampaign] Processing complete:`,
        JSON.stringify(stats)
      );
      return stats;
    } catch (error) {
      console.error("[EmailCampaign] Fatal error during processing:", error);
      throw error;
    }
  }

  /**
   * Get campaign statistics
   */
  async getStats() {
    const totalUsers = await User.countDocuments({
      registrationDate: { $gt: new Date("2024-11-20T00:00:00.000Z") },
      emailCampaignEnabled: true,
    });

    const completedUsers = await User.countDocuments({
      registrationDate: { $gt: new Date("2024-11-20T00:00:00.000Z") },
      emailCampaignEnabled: true,
      emailCampaignDay: 21,
    });

    const totalEmailsSent = await EmailLog.countDocuments({
      status: "sent",
    });

    const totalEmailsFailed = await EmailLog.countDocuments({
      status: "failed",
    });

    return {
      totalUsers,
      completedUsers,
      activeUsers: totalUsers - completedUsers,
      totalEmailsSent,
      totalEmailsFailed,
    };
  }
}

export default new EmailCampaignService();

