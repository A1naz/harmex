import MailService from "~/server/lib/mailService";
import { emailTemplates, generateEmailHtml } from "~/server/lib/emailTemplates";

export default eventHandler(async (event) => {
  try {
    const { emailNumber } = getQuery(event);

    // Определяем номер письма (по умолчанию первое)
    const emailIndex = emailNumber ? Number(emailNumber) - 1 : 0;

    if (emailIndex < 0 || emailIndex >= emailTemplates.length) {
      throw createError({
        statusCode: 400,
        message: `Номер письма должен быть от 1 до ${emailTemplates.length}`,
      });
    }

    const template = emailTemplates[emailIndex];

    // Генерируем HTML с тестовыми данными
    const htmlWithParams = generateEmailHtml(
      template,
      "test-user-uuid", // Тестовый UUID
      emailIndex + 1 // Номер письма
    );

    // Отправляем письмо
    await MailService.sendAutoEmail(
      "mr_flane@mail.ru",
      template.subject,
      htmlWithParams
    );

    console.log(
      `[TestEmail] Отправлено письмо #${emailIndex + 1} на mr_flane@mail.ru`
    );

    return {
      success: true,
      message: `Письмо #${emailIndex + 1} успешно отправлено на mr_flane@mail.ru`,
      subject: template.subject,
    };
  } catch (error: any) {
    console.error("[TestEmail] Ошибка при отправке тестового письма:", error);
    throw createError({
      statusCode: 500,
      message: error.message || "Ошибка при отправке тестового письма",
    });
  }
});

