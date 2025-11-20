import { EmailCampaign } from "~/server/lib/models/EmailCampaign";
import { User } from "~/server/lib/models/User";
import { UserRoles } from "~/data/enums";

/**
 * Get all email campaign templates
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
    const templates = await EmailCampaign.find().sort({ day: 1 });
    return {
      status: "ok",
      templates,
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || "Failed to fetch templates",
    });
  }
});

