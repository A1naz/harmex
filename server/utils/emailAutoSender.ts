import { User } from "../lib/models/User";
import MailService from "../lib/mailService";
import { emailTemplates, generateEmailHtml } from "../lib/emailTemplates";

// Флаг для включения/выключения автоматической рассылки
export const EMAIL_AUTO_SENDER_ENABLED = true;

// Дата старта рассылки
const START_DATE = new Date("2025-11-20T00:00:00.000Z");

// Максимальное количество писем
const MAX_EMAILS = 21;

/**
 * Расписание отправки: количество часов с момента регистрации до отправки каждого письма.
 * Индекс = номер письма - 1 (0-based).
 */
const EMAIL_SCHEDULE_HOURS: number[] = [
  0,     // Письмо 1  — сразу после регистрации
  2.5,   // Письмо 2  — через 2-3 часа
  24,    // Письмо 3  — через 1 день
  48,    // Письмо 4  — через 2 дня
  120,   // Письмо 5  — через 5 дней
  168,   // Письмо 6  — через 7 дней
  240,   // Письмо 7  — через 10 дней
  264,   // Письмо 8  — через 11 дней
  504,   // Письмо 9  — через 21 день
  720,   // Письмо 10 — через 30 дней
  888,   // Письмо 11 — через 37 дней
  1080,  // Письмо 12 — через 45 дней
  1200,  // Письмо 13 — через 50 дней
  1440,  // Письмо 14 — через 60 дней
  1680,  // Письмо 15 — через 70 дней
  1920,  // Письмо 16 — через 80 дней
  2160,  // Письмо 17 — через 90 дней
  2400,  // Письмо 18 — через 100 дней
  2640,  // Письмо 19 — через 110 дней
  2880,  // Письмо 20 — через 120 дней
  3120,  // Письмо 21 — через 130 дней
];

// Задержка между отправками (в миллисекундах) для избежания rate limiting
const SEND_DELAY = 30000; // 15 секунд между письмами

// Максимальное количество попыток отправки
const MAX_RETRIES = 3;

// Задержка перед повторной попыткой (в миллисекундах)
const RETRY_DELAY = 30000; // 30 секунд

// Рабочее окно времени для писем 3–21 (МСК)
const WORK_START_HOUR = 8;  // 8:00
const WORK_END_HOUR = 13;   // 13:00

// Цикл проверки: каждые 30 минут, 24/7
const CYCLE_INTERVAL = 30 * 60 * 1000;

/**
 * Функция задержки
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Получает текущее время в часовом поясе МСК
 */
function getMoscowTime(): Date {
  const now = new Date();
  // Преобразуем в МСК (UTC+3)
  const moscowTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Europe/Moscow" })
  );
  return moscowTime;
}

/**
 * Проверяет, находимся ли мы в рабочем окне времени (8:00 - 10:00 МСК)
 */
function isInWorkingHours(): boolean {
  const moscowTime = getMoscowTime();
  const hour = moscowTime.getHours();
  return hour >= WORK_START_HOUR && hour < WORK_END_HOUR;
}

/**
 * Получает дату в формате YYYY-MM-DD для МСК
 */
function getMoscowDateString(): string {
  const moscowTime = getMoscowTime();
  return moscowTime.toISOString().split("T")[0];
}


/**
 * Отправляет email с повторными попытками при ошибке
 */
async function sendEmailWithRetry(
  email: string,
  subject: string,
  html: string,
  retries: number = MAX_RETRIES
): Promise<boolean> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await MailService.sendAutoEmail(email, subject, html);
      return true;
    } catch (error) {
      console.error(
        `[EmailAutoSender] Попытка ${attempt}/${retries} не удалась для ${email}:`,
        error
      );

      if (attempt < retries) {
        // console.log(
        //   `[EmailAutoSender] Ожидание ${
        //     RETRY_DELAY / 1000
        //   } сек. перед повторной попыткой...`
        // );
        await sleep(RETRY_DELAY);
      } else {
        // console.error(
        //   `[EmailAutoSender] Все ${retries} попытки исчерпаны для ${email}`
        // );
        return false;
      }
    }
  }
  return false;
}

/**
 * Проверяет и отправляет автоматические письма пользователям
 */
async function processAutoEmails() {
  try {
    // console.log(
    //   "[EmailAutoSender] Запуск проверки пользователей для автоматической рассылки..."
    // );

    // Получаем всех пользователей, зарегистрированных после 21.11.2025
    // и у которых emailAutoSentCount < 21 или поля нет
    const users = await User.find({
      registrationDate: { $gte: START_DATE },
      $or: [
        { emailAutoSentCount: { $exists: false } },
        { emailAutoSentCount: { $lt: MAX_EMAILS } },
      ],
      email: { $exists: true, $nin: [null, ""] },
      // Включаем пользователей где поле отсутствует, false или null
      disableEmailAutoSender: { $ne: true },
    });

    // console.log(
    //   `[EmailAutoSender] Найдено пользователей для обработки: ${users.length}`
    // );

    let sentCount = 0;
    let skippedCount = 0;

    // Обрабатываем каждого пользователя
    for (const user of users) {
      try {
        // Проверка на наличие email
        if (!user.email) {
          // console.log(`[EmailAutoSender] Пропущен пользователь без email`);
          continue;
        }

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

        // Часов прошло с момента регистрации
        const hoursSinceRegistration =
          (now.getTime() - registrationDate.getTime()) / (1000 * 60 * 60);

        // Индекс следующего письма для отправки
        const emailIndex = user.emailAutoSentCount;

        // Минимум часов с регистрации, необходимый для отправки этого письма
        const requiredHours = EMAIL_SCHEDULE_HOURS[emailIndex];

        if (hoursSinceRegistration < requiredHours) {
          const hoursLeft = (requiredHours - hoursSinceRegistration).toFixed(1);
          // console.log(
          //   `[EmailAutoSender] Пропущен ${user.email}: письмо #${emailIndex + 1} — ещё ${hoursLeft} ч. до отправки`
          // );
          skippedCount++;
          continue;
        }

        // Письма 3–21 (index >= 2) — только в рабочие часы (8:00–13:00 МСК)
        if (emailIndex >= 2 && !isInWorkingHours()) {
          skippedCount++;
          continue;
        }

        // Защита: не отправлять, если последнее письмо было < 1 часа назад
        if (user.emailLastSentDate) {
          const minGapMs = 60 * 60 * 1000; // 1 час
          if (now.getTime() - new Date(user.emailLastSentDate).getTime() < minGapMs) {
            skippedCount++;
            continue;
          }
        }
        if (emailIndex >= emailTemplates.length) {
            // console.log(
            //   `[EmailAutoSender] Нет шаблона для индекса ${emailIndex}, пользователь ${user.email}`
            // );
          continue;
        }

        const template = emailTemplates[emailIndex];

        // Генерируем HTML с подставленными параметрами
        const htmlWithParams = generateEmailHtml(
          template,
          user.uuid,
          emailIndex + 1 // Номер письма начинается с 1
        );

        // Отправляем письмо с retry логикой
        const success = await sendEmailWithRetry(
          user.email,
          template.subject,
          htmlWithParams
        );

        if (!success) {
          // console.error(
          //   `[EmailAutoSender] Не удалось отправить письмо пользователю ${user.email} после всех попыток`
          // );
          continue;
        }

        // Обновляем счетчик и дату последней отправки
        user.emailAutoSentCount = (user.emailAutoSentCount || 0) + 1;
        user.emailLastSentDate = now;
        await user.save();

        sentCount++;
        // console.log(
        //   `[EmailAutoSender] Отправлено письмо #${user.emailAutoSentCount} пользователю ${user.email}`
        // );

        // Добавляем задержку между отправками для избежания rate limiting
        if (sentCount < users.length) {
          // console.log(
          //   `[EmailAutoSender] Ожидание ${
          //     SEND_DELAY / 1000
          //   } сек. перед следующей отправкой...`
          // );
          await sleep(SEND_DELAY);
        }
      } catch (error) {
        // console.error(
        //   `[EmailAutoSender] Ошибка при обработке пользователя ${user.email}:`,
        //   error
        // );
      }
    }

    // console.log(
    //   `[EmailAutoSender] Завершено. Отправлено писем: ${sentCount}, Пропущено: ${skippedCount}`
    // );
  } catch (error) {
    // console.error(
    //   "[EmailAutoSender] Критическая ошибка при обработке автоматической рассылки:",
    //   error
    // );
  }
}

/**
 * Выполняет один цикл рассылки
 */
async function runCycle() {
  const moscowTime = getMoscowTime();
  // console.log(
  //   `[EmailAutoSender] Запуск цикла в ${moscowTime.toLocaleTimeString("ru-RU")} МСК`
  // );
  await processAutoEmails();
  console.log(`[EmailAutoSender] Цикл завершен.`);
}

/**
 * Планирует следующий запуск через CYCLE_INTERVAL (30 мин)
 */
function scheduleNextRun() {
  // console.log(
  //   `[EmailAutoSender] Следующий цикл через ${CYCLE_INTERVAL / 1000 / 60} мин.`
  // );
  setTimeout(() => {
    runCycle().then(() => scheduleNextRun());
  }, CYCLE_INTERVAL);
}

/**
 * Запускает автоматическую рассылку писем
 */
export function startEmailAutoSender() {
  if (!EMAIL_AUTO_SENDER_ENABLED) {
    // console.log("[EmailAutoSender] Автоматическая рассылка отключена");
    return;
  }

  const moscowTime = getMoscowTime();
  // console.log("[EmailAutoSender] Автоматическая рассылка запущена (24/7)");
  // console.log(
  //   `[EmailAutoSender] Текущее время МСК: ${moscowTime.toLocaleString("ru-RU")}`
  // );
  // console.log(
  //   `[EmailAutoSender] Письма 1–2 — круглосуточно. Письма 3–21 — только ${WORK_START_HOUR}:00–${WORK_END_HOUR}:00 МСК.`
  // );
  // console.log(`[EmailAutoSender] Интервал цикла: ${CYCLE_INTERVAL / 1000 / 60} мин.`);

  // Первый цикл сразу
  runCycle().then(() => scheduleNextRun());
}

/**
 * Останавливает автоматическую рассылку (для будущего использования)
 */
export function stopEmailAutoSender() {
  // console.log("[EmailAutoSender] Автоматическая рассылка остановлена");
  // В будущем здесь можно добавить логику для очистки интервала
}
