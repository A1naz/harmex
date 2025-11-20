import { EmailCampaign } from "~/server/lib/models/EmailCampaign";
import { User } from "~/server/lib/models/User";
import { UserRoles } from "~/data/enums";

/**
 * Get a specific email campaign template by day
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

  const day = parseInt(event.context.params?.day || "0");

  if (day < 1 || day > 21) {
    throw createError({
      statusCode: 400,
      message: "Day must be between 1 and 21",
    });
  }

  try {
    const template = await EmailCampaign.findOne({ day });
    
    if (!template) {
      throw createError({
        statusCode: 404,
        message: `Template for day ${day} not found`,
      });
    }

    return {
      status: "ok",
      template,
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to fetch template",
    });
  }
});

