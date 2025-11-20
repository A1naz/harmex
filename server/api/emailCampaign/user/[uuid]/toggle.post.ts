import { User } from "~/server/lib/models/User";
import { UserRoles } from "~/data/enums";

/**
 * Enable or disable email campaign for a specific user
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

  const body = await readBody(event);
  const { enabled } = body;

  if (typeof enabled !== "boolean") {
    throw createError({
      statusCode: 400,
      message: "enabled must be a boolean",
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

    user.emailCampaignEnabled = enabled;
    await user.save();

    return {
      status: "ok",
      message: `Email campaign ${enabled ? "enabled" : "disabled"} for user`,
      user: {
        uuid: user.uuid,
        email: user.email,
        emailCampaignEnabled: user.emailCampaignEnabled,
      },
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to toggle email campaign",
    });
  }
});

