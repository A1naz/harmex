import emailCampaignService from "~/server/lib/emailCampaignService";
import { User } from "~/server/lib/models/User";
import { UserRoles } from "~/data/enums";

/**
 * Manually trigger email campaign processing
 * Useful for testing or immediate processing
 */
export default eventHandler(async (event) => {
  const isAuth = await getUserSession(event);

  if (!isAuth) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }

  // Check if user is admin - get full user from DB
  const currentUser = await User.findOne({ uuid: isAuth.user?.uuid });
  if (!currentUser || !currentUser.roles?.includes(UserRoles.admin)) {
    throw createError({
      statusCode: 403,
      message: "Forbidden - Admin access required",
    });
  }

  try {
    console.log("[API] Manual email campaign processing triggered");
    const stats = await emailCampaignService.processCampaigns();
    return {
      status: "ok",
      message: "Email campaign processing completed",
      stats,
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || "Failed to process email campaigns",
    });
  }
});

