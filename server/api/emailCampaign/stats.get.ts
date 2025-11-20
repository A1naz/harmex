import emailCampaignService from "~/server/lib/emailCampaignService";
import { User } from "~/server/lib/models/User";
import { UserRoles } from "~/data/enums";

/**
 * Get email campaign statistics
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
    const stats = await emailCampaignService.getStats();
    return {
      status: "ok",
      stats,
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || "Failed to fetch statistics",
    });
  }
});

