import { User } from "../lib/models/User";

export default eventHandler(async (event) => {
  try {
    const { username } = getQuery(event);

    if (!username) {
      throw createError({
        statusCode: 400,
        message: "Отсутствует параметр username",
      });
    }

    // Находим пользователя по UUID
    const user = await User.findOne({ uuid: username });

    if (!user) {
      throw createError({
        statusCode: 404,
        message: "Пользователь не найден",
      });
    }

    // Устанавливаем флаг отключения рассылки
    user.disableEmailAutoSender = true;
    await user.save();

    console.log(
      `[UnsubscribeEmail] Пользователь ${user.email} (${username}) отписался от рассылки`
    );

    // Перенаправляем на профиль с параметром для показа уведомления
    return sendRedirect(event, "/profile?unsubscribed=true", 302);
  } catch (error) {
    console.error("[UnsubscribeEmail] Ошибка при отписке от рассылки:", error);
    throw createError({
      statusCode: 500,
      message: "Ошибка при отписке от рассылки",
    });
  }
});

