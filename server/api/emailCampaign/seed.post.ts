import { EmailCampaign } from "~/server/lib/models/EmailCampaign";
import { User } from "~/server/lib/models/User";
import { UserRoles } from "~/data/enums";

/**
 * Seed initial email campaign templates (for development/testing)
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
    // Check if templates already exist
    const existingCount = await EmailCampaign.countDocuments();
    if (existingCount > 0) {
      throw createError({
        statusCode: 400,
        message: `Templates already exist (${existingCount} found). Delete them first if you want to reseed.`,
      });
    }

    // Create sample templates for all 21 days
    const templates = [];
    for (let day = 1; day <= 21; day++) {
      templates.push({
        day,
        subject: `[HARMEX] День ${day} - Добро пожаловать на платформу`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Привет, {firstName}!</h2>
            
            <p>Это письмо №${day} из нашей серии писем для новых пользователей.</p>
            
            <p>Добро пожаловать на платформу HARMEX! Мы рады видеть вас среди наших пользователей.</p>
            
            <h3>Что вы можете сделать сегодня:</h3>
            <ul>
              <li>Изучите возможности платформы</li>
              <li>Настройте свой профиль</li>
              <li>Начните работать с маркетплейсами</li>
            </ul>
            
            <p>Если у вас есть вопросы, обращайтесь в нашу поддержку:</p>
            <a href="https://t.me/Marketmonstr_bot" style="display: inline-block; background-color: #0088cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0;">Поддержка</a>
            
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            
            <p style="color: #666; font-size: 12px;">
              Данное письмо было создано автоматически. 
              Пожалуйста, не отвечайте на него.
            </p>
            
            <p>
              С уважением,<br>
              Команда HARMEX
            </p>
          </div>
        `,
        isActive: true,
      });
    }

    await EmailCampaign.insertMany(templates);

    return {
      status: "ok",
      message: `Successfully created ${templates.length} email templates`,
      count: templates.length,
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to seed templates",
    });
  }
});

