import { EmailCampaign } from "~/server/lib/models/EmailCampaign";
import { User } from "~/server/lib/models/User";
import { UserRoles } from "~/data/enums";

/**
 * Create or update an email campaign template
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

  const body = await readBody(event);
  const { day, subject, htmlContent, isActive } = body;

  // Validation
  if (!day || day < 1 || day > 21) {
    throw createError({
      statusCode: 400,
      message: "Day must be between 1 and 21",
    });
  }

  if (!subject || subject.trim() === "") {
    throw createError({
      statusCode: 400,
      message: "Subject is required",
    });
  }

  if (!htmlContent || htmlContent.trim() === "") {
    throw createError({
      statusCode: 400,
      message: "HTML content is required",
    });
  }

  try {
    // Find and update, or create new
    const template = await EmailCampaign.findOneAndUpdate(
      { day },
      {
        day,
        subject,
        htmlContent,
        isActive: isActive !== undefined ? isActive : true,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return {
      status: "ok",
      message: "Template saved successfully",
      template,
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || "Failed to save template",
    });
  }
});

