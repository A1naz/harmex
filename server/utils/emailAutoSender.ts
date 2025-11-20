import { User } from "../lib/models/User";
import MailService from "../lib/mailService";
import { emailTemplates } from "../lib/emailTemplates";

// Флаг для включения/выключения автоматической рассылки
export const EMAIL_AUTO_SENDER_ENABLED = true;

// Интервал проверки в миллисекундах (2 часа)
const CHECK_INTERVAL = 2 * 60 * 60 * 1000;

// Дата старта рассылки
const START_DATE = new Date("2025-11-19T00:00:00.000Z");

// Максимальное количество писем
const MAX_EMAILS = 21;

// Интервал между письмами в миллисекундах (24 часа)
const EMAIL_INTERVAL = 24 * 60 * 60 * 1000;

/**
 * Проверяет и отправляет автоматические письма пользователям
 */
async function processAutoEmails() {
  try {
    console.log(
      "[EmailAutoSender] Запуск проверки пользователей для автоматической рассылки..."
    );

    // Получаем всех пользователей, зарегистрированных после 21.11.2025
    // и у которых emailAutoSentCount < 21 или поля нет
    const users = await User.find({
      registrationDate: { $gte: START_DATE },
      $or: [
        { emailAutoSentCount: { $exists: false } },
        { emailAutoSentCount: { $lt: MAX_EMAILS } },
      ],
      email: { $exists: true, $ne: null, $ne: "" },
    });

    console.log(
      `[EmailAutoSender] Найдено пользователей для обработки: ${users.length}`
    );

    let sentCount = 0;
    let skippedCount = 0;

    // Обрабатываем каждого пользователя
    for (const user of users) {
      try {
        // Инициализируем поле emailAutoSentCount если его нет
        if (
          user.emailAutoSentCount === undefined ||
          user.emailAutoSentCount === null
        ) {
          user.emailAutoSentCount = 0;
        }

        // Если уже отправлено максимальное количество писем, пропускаем
        if (user.emailAutoSentCount >= MAX_EMAILS) {
          continue;
        }

        // Текущее время
        const now = new Date();

        // Время регистрации пользователя
        const registrationDate = new Date(user.registrationDate);

        // Количество полных дней с момента регистрации
        const daysSinceRegistration = Math.floor(
          (now.getTime() - registrationDate.getTime()) / EMAIL_INTERVAL
        );

        // Определяем, какое письмо должно быть отправлено (номер письма = количество дней с регистрации)
        // День 0 (день регистрации) - письмо 1
        // День 1 - письмо 2
        // День 2 - письмо 3 и т.д.
        const expectedEmailIndex = daysSinceRegistration;
        console.log(expectedEmailIndex);

        // Если текущий счетчик отправленных писем меньше ожидаемого индекса
        
          // Проверяем, прошло ли 24 часа с последней отправки
          if (user.emailLastSentDate) {
            const timeSinceLastEmail =
              now.getTime() - new Date(user.emailLastSentDate).getTime();
            if (timeSinceLastEmail < EMAIL_INTERVAL) {
              console.log
              skippedCount++;
              continue;
            }
          }

          // Получаем шаблон письма по индексу счетчика
          const emailIndex = user.emailAutoSentCount;
          if (emailIndex >= emailTemplates.length) {
            console.log(
              `[EmailAutoSender] Нет шаблона для индекса ${emailIndex}, пользователь ${user.email}`
            );
            continue;
          }

          const template = emailTemplates[emailIndex];

          // Отправляем письмо
          await MailService.sendAutoEmail(
            user.email,
            template.subject,
            template.html
          );

          // Обновляем счетчик и дату последней отправки
          user.emailAutoSentCount = (user.emailAutoSentCount || 0) + 1;
          user.emailLastSentDate = now;
          await user.save();



          sentCount++;
          console.log(
            `[EmailAutoSender] Отправлено письмо #${user.emailAutoSentCount} пользователю ${user.email}`
          );
        
      } catch (error) {
        console.error(
          `[EmailAutoSender] Ошибка при обработке пользователя ${user.email}:`,
          error
        );
      }
    }

    console.log(
      `[EmailAutoSender] Завершено. Отправлено писем: ${sentCount}, Пропущено: ${skippedCount}`
    );
  } catch (error) {
    console.error(
      "[EmailAutoSender] Критическая ошибка при обработке автоматической рассылки:",
      error
    );
  }
}

/**
 * Запускает автоматическую рассылку писем
 */
export function startEmailAutoSender() {
  if (!EMAIL_AUTO_SENDER_ENABLED) {
    console.log("[EmailAutoSender] Автоматическая рассылка отключена");
    return;
  }

  console.log("[EmailAutoSender] Автоматическая рассылка запущена");
  console.log(
    `[EmailAutoSender] Интервал проверки: ${CHECK_INTERVAL / 1000 / 60} минут`
  );

  // Запускаем первую проверку сразу
  processAutoEmails();

  // Запускаем периодическую проверку каждые 2 часа
  setInterval(() => {
    processAutoEmails();
  }, CHECK_INTERVAL);
}

/**
 * Останавливает автоматическую рассылку (для будущего использования)
 */
export function stopEmailAutoSender() {
  console.log("[EmailAutoSender] Автоматическая рассылка остановлена");
  // В будущем здесь можно добавить логику для очистки интервала
}
