import { User } from "~/server/lib/models/User";
import { EmailLog } from "~/server/lib/models/EmailLog";
import { UserRoles } from "~/data/enums";

/**
 * Get email campaign information for a specific user
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

  const uuid = event.context.params?.uuid;

  if (!uuid) {
    throw createError({
      statusCode: 400,
      message: "User UUID is required",
    });
  }

  try {
    const user = await User.findOne({ uuid });

    if (!user) {
      throw createError({
        statusCode: 404,
        message: "User not found",
      });
    }

    // Get email logs for this user
    const emailLogs = await EmailLog.find({ userId: uuid })
      .sort({ campaignDay: 1 })
      .lean();

    // Calculate campaign progress
    const registrationDate = new Date(user.registrationDate);
    const now = new Date();
    const daysSinceRegistration = Math.floor(
      (now.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      status: "ok",
      user: {
        uuid: user.uuid,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        registrationDate: user.registrationDate,
        emailCampaignDay: user.emailCampaignDay,
        lastCampaignEmailSent: user.lastCampaignEmailSent,
        emailCampaignEnabled: user.emailCampaignEnabled,
        daysSinceRegistration,
      },
      emailLogs,
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to fetch user campaign info",
    });
  }
});

