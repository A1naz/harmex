import { User } from "~~/server/lib/models/User";

export default defineEventHandler(async (event) => {
  try {
    // Получаем параметры из query
    const query = getQuery(event);
    const username = query.username as string | undefined;
    const numberOfEmail = query.numberOfEmail as string | undefined;

    // Валидация параметров
    if (!username || !numberOfEmail) {
      console.error("[emailsSent] Отсутствуют обязательные параметры");
      return sendRedirect(event, "/profile", 302);
    }

    const emailNumber = parseInt(numberOfEmail, 10);
    if (isNaN(emailNumber) || emailNumber < 1 || emailNumber > 21) {
      console.error(`[emailsSent] Некорректный номер письма: ${numberOfEmail}`);
      return sendRedirect(event, "/profile", 302);
    }

    // Находим пользователя по UUID
    const user = await User.findOne({ uuid: username });
    if (!user) {
      console.error(`[emailsSent] Пользователь не найден: ${username}`);
      return sendRedirect(event, "/profile", 302);
    }

    // Инициализируем массив emailFunnel если его нет
    if (!user.emailFunnel) {
      user.emailFunnel = [];
    }

    // Проверяем, есть ли уже запись о клике на это письмо
    const existingClick = user.emailFunnel.find(
      (item: any) => item.emailNumber === emailNumber
    );

    if (!existingClick) {
      // Добавляем новую запись о клике
      user.emailFunnel.push({
        emailNumber: emailNumber,
        isClicked: true,
        clickedAt: new Date(),
      });

      // Увеличиваем счетчик кликов
      user.emailFunnelClicksCount = (user.emailFunnelClicksCount || 0) + 1;

      // Сохраняем пользователя
      await user.save();

      console.log(
        `[emailsSent] Зарегистрирован клик: пользователь ${username}, письмо #${emailNumber}`
      );
    } else {
      console.log(
        `[emailsSent] Клик уже был зарегистрирован: пользователь ${username}, письмо #${emailNumber}`
      );
    }

    // Редиректим на профиль
    return sendRedirect(event, "/profile", 302);
  } catch (error) {
    console.error("[emailsSent] Ошибка при обработке клика:", error);
    return sendRedirect(event, "/profile", 302);
  }
});

