import { User } from "../lib/models/User";
import MailService from "../lib/mailService";
import { emailTemplates } from "../lib/emailTemplates";

// Флаг для включения/выключения автоматической рассылки
export const EMAIL_AUTO_SENDER_ENABLED = true;

// Дата старта рассылки
const START_DATE = new Date("2025-11-20T00:00:00.000Z");

// Максимальное количество писем
const MAX_EMAILS = 21;

// Интервал между письмами в миллисекундах (24 часа)
const EMAIL_INTERVAL = 24 * 60 * 60 * 1000;

// Задержка между отправками (в миллисекундах) для избежания rate limiting
const SEND_DELAY = 30000; // 15 секунд между письмами

// Максимальное количество попыток отправки
const MAX_RETRIES = 3;

// Задержка перед повторной попыткой (в миллисекундах)
const RETRY_DELAY = 10000; // 10 секунд

// Рабочее окно времени (МСК)
const WORK_START_HOUR = 8; // Начало работы: 8:00 утра
const WORK_END_HOUR = 10; // Конец работы: 10:00 утра
const MAX_CYCLES_PER_DAY = 5; // Максимум 5 циклов рассылки в день
const CYCLE_INTERVAL = 24 * 60 * 1000; // 24 минуты между циклами (5 циклов за 2 часа)

// Переменная для отслеживания циклов
let cyclesCompletedToday = 0;
let lastCycleDate = "";

/**
 * Функция задержки
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Получает текущее время в часовом поясе МСК
 */
function getMoscowTime(): Date {
  const now = new Date();
  // Преобразуем в МСК (UTC+3)
  const moscowTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Moscow" }));
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
  return moscowTime.toISOString().split('T')[0];
}

/**
 * Вычисляет время до следующего запуска (8:00 утра МСК следующего дня)
 */
function getTimeUntilNextRun(): number {
  const moscowTime = getMoscowTime();
  const hour = moscowTime.getHours();
  
  // Создаем дату для следующего запуска в 8:00 МСК
  const nextRun = new Date(moscowTime);
  
  if (hour < WORK_START_HOUR) {
    // Если еще не 8 утра сегодня, запускаем сегодня в 8:00
    nextRun.setHours(WORK_START_HOUR, 0, 0, 0);
  } else {
    // Если уже прошло 8 утра или позже, запускаем завтра в 8:00
    nextRun.setDate(nextRun.getDate() + 1);
    nextRun.setHours(WORK_START_HOUR, 0, 0, 0);
  }
  
  // Вычисляем разницу в миллисекундах
  const diff = nextRun.getTime() - moscowTime.getTime();
  return diff;
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
        console.log(
          `[EmailAutoSender] Ожидание ${RETRY_DELAY / 1000} сек. перед повторной попыткой...`
        );
        await sleep(RETRY_DELAY);
      } else {
        console.error(
          `[EmailAutoSender] Все ${retries} попытки исчерпаны для ${email}`
        );
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
      email: { $exists: true, $nin: [null, ""] },
    });

    console.log(
      `[EmailAutoSender] Найдено пользователей для обработки: ${users.length}`
    );

    let sentCount = 0;
    let skippedCount = 0;

    // Обрабатываем каждого пользователя
    for (const user of users) {
      try {
        // Проверка на наличие email
        if (!user.email) {
          console.log(`[EmailAutoSender] Пропущен пользователь без email`);
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

        // Количество полных дней с момента регистрации
        const daysSinceRegistration = Math.floor(
          (now.getTime() - registrationDate.getTime()) / EMAIL_INTERVAL
        );

        // Определяем, какое письмо должно быть отправлено (номер письма = количество дней с регистрации)
        // День 0 (день регистрации) - письмо 1
        // День 1 - письмо 2
        // День 2 - письмо 3 и т.д.
        const expectedEmailIndex = daysSinceRegistration;
        // Если текущий счетчик отправленных писем меньше ожидаемого индекса
        
          // Проверяем, прошло ли 24 часа с последней отправки
          if (user.emailLastSentDate) {
            const timeSinceLastEmail =
              now.getTime() - new Date(user.emailLastSentDate).getTime();
            if (timeSinceLastEmail < EMAIL_INTERVAL) {
              console.log(
                `[EmailAutoSender] Пропущен пользователь ${user.email}: не прошло 24 часа с последней отправки`
              );
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

          // Отправляем письмо с retry логикой
          const success = await sendEmailWithRetry(
            user.email,
            template.subject,
            template.html
          );

          if (!success) {
            console.error(
              `[EmailAutoSender] Не удалось отправить письмо пользователю ${user.email} после всех попыток`
            );
            continue;
          }

          // Обновляем счетчик и дату последней отправки
          user.emailAutoSentCount = (user.emailAutoSentCount || 0) + 1;
          user.emailLastSentDate = now;
          await user.save();

          sentCount++;
          console.log(
            `[EmailAutoSender] Отправлено письмо #${user.emailAutoSentCount} пользователю ${user.email}`
          );

          // Добавляем задержку между отправками для избежания rate limiting
          if (sentCount < users.length) {
            console.log(
              `[EmailAutoSender] Ожидание ${SEND_DELAY / 1000} сек. перед следующей отправкой...`
            );
            await sleep(SEND_DELAY);
          }
        
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
 * Выполняет цикл рассылки с проверкой рабочего времени
 */
async function runCycleIfAllowed() {
  const todayDate = getMoscowDateString();
  
  // Сбрасываем счетчик циклов, если наступил новый день
  if (lastCycleDate !== todayDate) {
    cyclesCompletedToday = 0;
    lastCycleDate = todayDate;
    console.log(`[EmailAutoSender] Новый день: ${todayDate}. Счетчик циклов сброшен.`);
  }
  
  // Проверяем, находимся ли в рабочем окне времени
  if (!isInWorkingHours()) {
    const moscowTime = getMoscowTime();
    console.log(
      `[EmailAutoSender] Сейчас ${moscowTime.toLocaleTimeString('ru-RU')} МСК. ` +
      `Рабочее время: ${WORK_START_HOUR}:00 - ${WORK_END_HOUR}:00. Пропуск цикла.`
    );
    return false;
  }
  
  // Проверяем, не превышен ли лимит циклов за день
  if (cyclesCompletedToday >= MAX_CYCLES_PER_DAY) {
    console.log(
      `[EmailAutoSender] Выполнено ${cyclesCompletedToday} из ${MAX_CYCLES_PER_DAY} циклов за сегодня. ` +
      `Ожидание следующего дня.`
    );
    return false;
  }
  
  // Выполняем рассылку
  const moscowTime = getMoscowTime();
  console.log(
    `[EmailAutoSender] Запуск цикла #${cyclesCompletedToday + 1}/${MAX_CYCLES_PER_DAY} ` +
    `в ${moscowTime.toLocaleTimeString('ru-RU')} МСК`
  );
  
  await processAutoEmails();
  
  cyclesCompletedToday++;
  console.log(`[EmailAutoSender] Цикл #${cyclesCompletedToday} завершен.`);
  
  return true;
}

/**
 * Планирует следующий запуск рассылки
 */
function scheduleNextRun() {
  const todayDate = getMoscowDateString();
  
  // Сбрасываем счетчик циклов, если наступил новый день
  if (lastCycleDate !== todayDate) {
    cyclesCompletedToday = 0;
    lastCycleDate = todayDate;
  }
  
  // Если мы в рабочем окне и еще не выполнили все циклы
  if (isInWorkingHours() && cyclesCompletedToday < MAX_CYCLES_PER_DAY) {
    // Запускаем следующий цикл через CYCLE_INTERVAL
    console.log(
      `[EmailAutoSender] Следующий цикл через ${CYCLE_INTERVAL / 1000 / 60} минут`
    );
    setTimeout(() => {
      runCycleIfAllowed().then(() => scheduleNextRun());
    }, CYCLE_INTERVAL);
  } else {
    // Вычисляем время до следующего запуска (8:00 утра следующего дня)
    const timeUntilNext = getTimeUntilNextRun();
    const hours = Math.floor(timeUntilNext / (1000 * 60 * 60));
    const minutes = Math.floor((timeUntilNext % (1000 * 60 * 60)) / (1000 * 60));
    
    console.log(
      `[EmailAutoSender] Переход в спящий режим. ` +
      `Следующий запуск через ${hours} ч. ${minutes} мин. (в 8:00 МСК)`
    );
    
    setTimeout(() => {
      cyclesCompletedToday = 0; // Сброс счетчика для нового дня
      runCycleIfAllowed().then(() => scheduleNextRun());
    }, timeUntilNext);
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
    `[EmailAutoSender] Рабочее время: ${WORK_START_HOUR}:00 - ${WORK_END_HOUR}:00 МСК`
  );
  console.log(
    `[EmailAutoSender] Циклов в день: ${MAX_CYCLES_PER_DAY}, интервал: ${CYCLE_INTERVAL / 1000 / 60} мин.`
  );

  const moscowTime = getMoscowTime();
  console.log(`[EmailAutoSender] Текущее время МСК: ${moscowTime.toLocaleString('ru-RU')}`);

  // Запускаем первый цикл (если в рабочее время)
  runCycleIfAllowed().then(() => scheduleNextRun());
}

/**
 * Останавливает автоматическую рассылку (для будущего использования)
 */
export function stopEmailAutoSender() {
  console.log("[EmailAutoSender] Автоматическая рассылка остановлена");
  // В будущем здесь можно добавить логику для очистки интервала
}
