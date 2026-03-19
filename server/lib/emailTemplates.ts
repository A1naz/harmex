export interface EmailTemplate {
  subject: string;
  html: string;
}

/**
 * Генерирует HTML письма с подставленными параметрами
 */
export function generateEmailHtml(
  template: EmailTemplate,
  username: string,
  emailNumber: number
): string {
  return template.html
    .replace(/{{username}}/g, username)
    .replace(/{{emailNumber}}/g, emailNumber.toString());
}

export const emailTemplates: EmailTemplate[] = [
  {
    subject: "Добро пожаловать в Harmex",
    html: `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Добро пожаловать в Harmex</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; max-width: 600px;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #fc8b3b; padding: 20px 40px; text-align: center;">
                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 10px; line-height: 0;">
                          <img src="https://ozonmpportal.hb.vkcs.cloud/icons/mailicon.png" width="36" height="36" alt="Harmex" style="display: block; border: 0;" />
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 30px 40px 0; text-align: center;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                      Добро пожаловать в Harmex
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Здравствуйте!
                    </p>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Благодарим вас за регистрацию в <strong>Harmex</strong> — экосистеме, которая автоматизирует самовыкупы, продвижение карточек и рост позиций ваших товаров. Теперь у вас появился инструмент, который экономит время, минимизирует риски и помогает вывести магазин на стабильные показатели.
                    </p>
                    
                    <div style="background-color: #f8f9fa; border-left: 4px solid #fc8b3b; padding: 20px; margin: 30px 0; border-radius: 4px;">
                      <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">
                        В ближайшие дни вы получите полезный контент, где мы разберем механику продвижения, структуру задач и стратегии, которые используют сильнейшие продавцы.
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Наша цель — чтобы вы быстро адаптировались, уверенно запустили продвижение ваших карточек и увидели результат уже в первые 5–7 дней.
                    </p>
                    
                    <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6; font-weight: 600;">
                      Начните путь к росту продаж прямо сейчас!
                    </p>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #fc8b3b; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(252, 139, 59, 0.35);">
                            Перейти в личный кабинет
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e9ecef;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding-bottom: 16px;">
                          <p style="margin: 0; color: #6c757d; font-size: 13px; line-height: 1.6; text-align: center;">
                            Вы получили это сообщение, потому что выразили согласие получать письма от «Harmex».<br>
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #333333; text-decoration: underline;">здесь</a>.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.6; text-align: center;">
                            С уважением,<br>
                            <strong style="color: #495057;">команда Harmex</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  },
  {
    subject: "Как работает система Harmex",
    html: `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Как работает система Harmex</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; max-width: 600px;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #fc8b3b; padding: 20px 40px; text-align: center;">
                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 10px; line-height: 0;">
                          <img src="https://ozonmpportal.hb.vkcs.cloud/icons/mailicon.png" width="36" height="36" alt="Harmex" style="display: block; border: 0;" />
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 30px 40px 0; text-align: center;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                      Как работает система Harmex
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Добрый день!
                    </p>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Самовыкупы часто кажутся хаотичным процессом, но в <strong>Harmex</strong> всё работает как четко выстроенная цепочка.
                    </p>
                    
                    <div style="background-color: #f8f9fa; padding: 24px; margin: 30px 0; border-radius: 8px; border: 1px solid #e9ecef;">
                      <p style="margin: 0 0 16px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Вы создаете задачу, система автоматически распределяет её среди исполнителей, контролирует выполнение и формирует детальную отчётность.
                      </p>
                      <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">
                        Каждый этап — от запуска до закрытия задачи — прозрачный и легко отслеживаемый.
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Вам <strong>не нужно «держать руку на пульсе»</strong> каждые 10 минут. Механизм сделан так, чтобы процесс шел плавно, естественно и безопасно для карточки.
                    </p>
                    
                    <div style="background-color: #f8f9fa; border-left: 4px solid #fc8b3b; padding: 20px; margin: 20px 0; border-radius: 4px;">
                      <p style="margin: 0; color: #333333; font-size: 17px; line-height: 1.6; font-weight: 600;">
                        Ваше участие минимально → результат стабильный.
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Не откладывайте продвижение вашего магазина «на потом» — сделайте шаг к росту продаж!
                    </p>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #fc8b3b; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(252, 139, 59, 0.35);">
                            Повысить рейтинг карточек
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e9ecef;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding-bottom: 16px;">
                          <p style="margin: 0; color: #6c757d; font-size: 13px; line-height: 1.6; text-align: center;">
                            Вы получили это сообщение, потому что выразили согласие получать письма от «Harmex».<br>
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #333333; text-decoration: underline;">здесь</a>.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.6; text-align: center;">
                            С уважением,<br>
                            <strong style="color: #495057;">команда Harmex</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  },
  {
    subject: "Создаем первую задачу правильно: краткое руководство",
    html: `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Создаем первую задачу правильно: краткое руководство</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; max-width: 600px;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #fc8b3b; padding: 20px 40px; text-align: center;">
                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 10px; line-height: 0;">
                          <img src="https://ozonmpportal.hb.vkcs.cloud/icons/mailicon.png" width="36" height="36" alt="Harmex" style="display: block; border: 0;" />
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 30px 40px 0; text-align: center;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                      Создаем первую задачу правильно: краткое руководство
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Вас приветствует компания <strong>Harmex</strong>!
                    </p>
                    
                    <p style="margin: 0 0 24px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Итак, чтобы запустить свои первые выкупы без ошибок, выполните три простых шага:
                    </p>
                    
                    <!-- Step 1 -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                      <tr>
                        <td style="width: 40px; vertical-align: top; padding-top: 2px;">
                          <div style="width: 36px; height: 36px; background-color: #fc8b3b; border-radius: 50%; color: #ffffff; font-weight: 700; font-size: 18px; text-align: center; line-height: 36px;">1</div>
                        </td>
                        <td style="padding-left: 16px;">
                          <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">
                            <strong>Добавьте артикулы в систему.</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Step 2 -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                      <tr>
                        <td style="width: 40px; vertical-align: top; padding-top: 2px;">
                          <div style="width: 36px; height: 36px; background-color: #fc8b3b; border-radius: 50%; color: #ffffff; font-weight: 700; font-size: 18px; text-align: center; line-height: 36px;">2</div>
                        </td>
                        <td style="padding-left: 16px;">
                          <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">
                            <strong>Укажите параметры задачи</strong> — количество, гео, время, ключевые слова.
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Step 3 -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                      <tr>
                        <td style="width: 40px; vertical-align: top; padding-top: 2px;">
                          <div style="width: 36px; height: 36px; background-color: #fc8b3b; border-radius: 50%; color: #ffffff; font-weight: 700; font-size: 18px; text-align: center; line-height: 36px;">3</div>
                        </td>
                        <td style="padding-left: 16px;">
                          <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">
                            <strong>Сохраните</strong> — дальше процесс запустится автоматически.
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Исполнители начнут работать по задаче, а вы увидите отчёты по каждому действию: переходам, поискам, выкупам, скринам.
                    </p>
                    
                    <div style="background-color: #f8f9fa; border-left: 4px solid #fc8b3b; padding: 20px; margin: 30px 0; border-radius: 4px;">
                      <p style="margin: 0 0 12px; color: #555555; font-size: 16px; line-height: 1.6;">
                        <strong>Этот процесс занимает 5 минут</strong>, но именно он запускает рост вашей карточки в поисковой выдаче.
                      </p>
                      <p style="margin: 0; color: #555555; font-size: 16px; line-height: 1.6;">
                        Первый шаг — всегда ключевой!
                      </p>
                    </div>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #fc8b3b; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(252, 139, 59, 0.35);">
                            Сделать шаг к бусту продаж
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e9ecef;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding-bottom: 16px;">
                          <p style="margin: 0; color: #6c757d; font-size: 13px; line-height: 1.6; text-align: center;">
                            Вы получили это сообщение, потому что выразили согласие получать письма от «Harmex».<br>
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #333333; text-decoration: underline;">здесь</a>.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.6; text-align: center;">
                            С уважением,<br>
                            <strong style="color: #495057;">команда Harmex</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  },
  {
    subject: "Первые трое суток — самые важные для запуска",
    html: `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Первые трое суток — самые важные для запуска</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; max-width: 600px;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #fc8b3b; padding: 20px 40px; text-align: center;">
                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 10px; line-height: 0;">
                          <img src="https://ozonmpportal.hb.vkcs.cloud/icons/mailicon.png" width="36" height="36" alt="Harmex" style="display: block; border: 0;" />
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 30px 40px 0; text-align: center;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                      Первые трое суток — самые важные для запуска
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Здравствуйте!
                    </p>
                    
                    <div style="background-color: #f8f9fa; border: 2px solid #fc8b3b; padding: 24px; margin: 20px 0; border-radius: 8px; text-align: center;">
                      <p style="margin: 0; color: #333333; font-size: 18px; line-height: 1.5; font-weight: 600;">
                        <strong style="font-size: 32px; display: block; margin-bottom: 8px;">83%</strong>
                        продавцов, запустивших первую задачу<br>
                        в течение 72 часов после регистрации,<br>
                        получают лучшие позиции и стабильный рост
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      <strong>Причина проста:</strong> алгоритмы маркетплейса фиксируют раннюю активность товара, отмечают положительную динамику и начинают поднимать карточку выше в поиске.
                    </p>
                    
                    <div style="background-color: #fff5ee; border-left: 4px solid #fc8b3b; padding: 20px; margin: 30px 0; border-radius: 4px;">
                      <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">
                        Если отложить старт, окно возможностей сужается — активность рассеивается, а конкуренты продолжают продвигаться вперед.
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 30px; color: #333333; font-size: 17px; line-height: 1.6; font-weight: 600; text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
                      Первые 72 часа часто определяют<br>последующие 30 дней продаж.
                    </p>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #fc8b3b; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(252, 139, 59, 0.35);">
                            Обогнать конкурентов
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e9ecef;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding-bottom: 16px;">
                          <p style="margin: 0; color: #6c757d; font-size: 13px; line-height: 1.6; text-align: center;">
                            Вы получили это сообщение, потому что выразили согласие получать письма от «Harmex».<br>
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #333333; text-decoration: underline;">здесь</a>.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.6; text-align: center;">
                            С уважением,<br>
                            <strong style="color: #495057;">команда Harmex</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  },
  {
    subject: "Как быстро выполняются задачи: разбираем",
    html: `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Как быстро выполняются задачи: разбираем</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; max-width: 600px;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #fc8b3b; padding: 20px 40px; text-align: center;">
                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 10px; line-height: 0;">
                          <img src="https://ozonmpportal.hb.vkcs.cloud/icons/mailicon.png" width="36" height="36" alt="Harmex" style="display: block; border: 0;" />
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 30px 40px 0; text-align: center;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                      Как быстро выполняются задачи: разбираем
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Вас приветствует команда <strong>Harmex</strong>!
                    </p>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Скорость выполнения задач зависит от ряда факторов, и важно понимать их заранее.
                    </p>
                    
                    <div style="background-color: #f8f9fa; padding: 24px; margin: 24px 0; border-radius: 8px; border-left: 4px solid #fc8b3b;">
                      <p style="margin: 0 0 12px; color: #333333; font-size: 15px; line-height: 1.6; font-weight: 600;">
                        На процесс влияет:
                      </p>
                      <ul style="margin: 0; padding-left: 20px; color: #495057; font-size: 15px; line-height: 1.8;">
                        <li>География выкупов</li>
                        <li>Общее количество запросов в вашей нише</li>
                        <li>Активность пользователей в конкретное время дня</li>
                        <li>Лимиты маркетплейса</li>
                        <li>Технические нюансы самой карточки — SEO, остатки, фотографии</li>
                      </ul>
                    </div>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Мы <strong>не выполняем выкупы «моментально»</strong>. Система делает всё естественно и распределенно, чтобы продвижение выглядело органично. Это обеспечивает долгосрочный эффект и снижает риски.
                    </p>
                    
                    <div style="background-color: #f8f9fa; border: 2px solid #fc8b3b; padding: 20px; margin: 30px 0; border-radius: 8px; text-align: center;">
                      <p style="margin: 0; color: #333333; font-size: 17px; line-height: 1.5; font-weight: 600;">
                        Скорость зависит от рынка —<br>качество от нас.
                      </p>
                    </div>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #fc8b3b; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(252, 139, 59, 0.35);">
                            Оформить самовыкупы
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e9ecef;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding-bottom: 16px;">
                          <p style="margin: 0; color: #6c757d; font-size: 13px; line-height: 1.6; text-align: center;">
                            Вы получили это сообщение, потому что выразили согласие получать письма от «Harmex».<br>
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #333333; text-decoration: underline;">здесь</a>.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.6; text-align: center;">
                            С уважением,<br>
                            <strong style="color: #495057;">команда Harmex</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  },
  {
    subject: "Распределяем бюджет правильно: практические советы",
    html: `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Распределяем бюджет правильно: практические советы</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; max-width: 600px;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #fc8b3b; padding: 20px 40px; text-align: center;">
                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 10px; line-height: 0;">
                          <img src="https://ozonmpportal.hb.vkcs.cloud/icons/mailicon.png" width="36" height="36" alt="Harmex" style="display: block; border: 0;" />
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 30px 40px 0; text-align: center;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                      Распределяем бюджет правильно: практические советы
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Добрый день, на связи команда <strong>Harmex</strong>!
                    </p>
                    
                    <p style="margin: 0 0 24px; color: #333333; font-size: 16px; line-height: 1.6;">
                      <strong>Грамотное распределение бюджета — ключ к стабильному росту.</strong>
                    </p>
                    
                    <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Чтобы продвижение не «скакало» и давало предсказуемый результат, используйте стратегию, проверенную сотнями магазинов.
                    </p>
                    
                    <!-- Budget breakdown -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                      <tr>
                        <td style="padding-bottom: 16px;">
                          <div style="background-color: #fff5ee; padding: 20px; border-radius: 8px; border: 2px solid #fc8b3b;">
                            <p style="margin: 0 0 8px; color: #fc8b3b; font-size: 32px; font-weight: 700; line-height: 1;">
                              30%
                            </p>
                            <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.4;">
                              <strong>Старт</strong> — первые выкупы создают динамику и формируют положительную историю товара
                            </p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 16px;">
                          <div style="background-color: #fff5ee; padding: 20px; border-radius: 8px; border: 2px solid #fc8b3b;">
                            <p style="margin: 0 0 8px; color: #fc8b3b; font-size: 32px; font-weight: 700; line-height: 1;">
                              50%
                            </p>
                            <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.4;">
                              <strong>Основной пул</strong> — регулярные, ежедневные задачи, создающие стабильный рост позиций
                            </p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div style="background-color: #fff5ee; padding: 20px; border-radius: 8px; border: 2px solid #fc8b3b;">
                            <p style="margin: 0 0 8px; color: #fc8b3b; font-size: 32px; font-weight: 700; line-height: 1;">
                              20%
                            </p>
                            <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.4;">
                              <strong>Фонд удержания</strong> — поддержание результатов
                            </p>
                          </div>
                        </td>
                      </tr>
                    </table>
                    
                    <div style="background-color: #f8f9fa; border-left: 4px solid #fc8b3b; padding: 20px; margin: 30px 0; border-radius: 4px;">
                      <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">
                        Такой подход защищает от просадок, помогает масштабировать нишу и укрепляет позиции органично.
                      </p>
                    </div>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #fc8b3b; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(252, 139, 59, 0.35);">
                            Перейти в личный кабинет
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e9ecef;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding-bottom: 16px;">
                          <p style="margin: 0; color: #6c757d; font-size: 13px; line-height: 1.6; text-align: center;">
                            Вы получили это сообщение, потому что выразили согласие получать письма от «Harmex».<br>
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #333333; text-decoration: underline;">здесь</a>.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.6; text-align: center;">
                            С уважением,<br>
                            <strong style="color: #495057;">команда Harmex</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  },
  {
    subject: "Частые ошибки новичков на маркетплейсах",
    html: `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Частые ошибки новичков</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; max-width: 600px;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #fc8b3b; padding: 20px 40px; text-align: center;">
                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 10px; line-height: 0;">
                          <img src="https://ozonmpportal.hb.vkcs.cloud/icons/mailicon.png" width="36" height="36" alt="Harmex" style="display: block; border: 0;" />
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 30px 40px 0; text-align: center;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                      Частые ошибки новичков на маркетплейсах
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Здравствуйте!
                    </p>
                    
                    <p style="margin: 0 0 24px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Новички часто допускают ошибки, которые тормозят продвижение и делают процесс дороже. Самые распространенные:
                    </p>
                    
                    <div style="background-color: #fff5ee; padding: 24px; margin: 24px 0; border-radius: 8px; border-left: 4px solid #fc8b3b;">
                      <ul style="margin: 0; padding-left: 20px; color: #333333; font-size: 15px; line-height: 1.8;">
                        <li>Слишком большой объем выкупов в начале — алгоритм фиксирует неестественный всплеск</li>
                        <li>Установка одинаковых ключевых слов</li>
                        <li>Игнорирование остатков</li>
                        <li>Отсутствие корректной аналитики</li>
                        <li>Попытка продвигать сразу всё без стратегии</li>
                      </ul>
                    </div>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      <strong>Исправить это легко</strong> — работать постепенно, анализировать динамику, держать баланс и учитывать ограничения маркетплейса.
                    </p>
                    
                    <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Теперь вы понимаете механику и сможете избежать типичных ловушек.
                    </p>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #fc8b3b; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(252, 139, 59, 0.35);">
                            Проверить статистику в личном кабинете
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e9ecef;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding-bottom: 16px;">
                          <p style="margin: 0; color: #6c757d; font-size: 13px; line-height: 1.6; text-align: center;">
                            Вы получили это сообщение, потому что выразили согласие получать письма от «Harmex».<br>
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #333333; text-decoration: underline;">здесь</a>.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.6; text-align: center;">
                            С уважением,<br>
                            <strong style="color: #495057;">команда Harmex</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  },
  {
    subject: "Первые результаты продвижения: когда ожидать",
    html: `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Первые результаты продвижения: когда ожидать</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; max-width: 600px;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #fc8b3b; padding: 20px 40px; text-align: center;">
                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 10px; line-height: 0;">
                          <img src="https://ozonmpportal.hb.vkcs.cloud/icons/mailicon.png" width="36" height="36" alt="Harmex" style="display: block; border: 0;" />
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 30px 40px 0; text-align: center;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                      Первые результаты продвижения: когда ожидать
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Вас приветствует компания <strong>Harmex</strong>!
                    </p>
                    
                    <!-- Timeline -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                      <tr>
                        <td style="padding-bottom: 20px;">
                          <div style="background-color: #fff5ee; padding: 24px; border-radius: 8px; border: 2px solid #fc8b3b;">
                            <p style="margin: 0 0 8px; color: #fc8b3b; font-size: 36px; font-weight: 700; line-height: 1; text-align: center;">
                              3–7 дней
                            </p>
                            <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.4; text-align: center;">
                              Первые изменения позиций обычно фиксируются после старта задач
                            </p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div style="background-color: #fff5ee; padding: 24px; border-radius: 8px; border: 2px solid #fc8b3b;">
                            <p style="margin: 0 0 8px; color: #fc8b3b; font-size: 36px; font-weight: 700; line-height: 1; text-align: center;">
                              10–14 дней
                            </p>
                            <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.4; text-align: center;">
                              Закрепление результата происходит на этом горизонте
                            </p>
                          </div>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Это естественный темп, учитывающий алгоритмы маркетплейса и органическую активность покупателей.
                    </p>
                    
                    <div style="background-color: #f8f9fa; border-left: 4px solid #fc8b3b; padding: 20px; margin: 30px 0; border-radius: 4px;">
                      <p style="margin: 0 0 8px; color: #333333; font-size: 16px; line-height: 1.6; font-weight: 600;">
                        Важно:
                      </p>
                      <p style="margin: 0; color: #555555; font-size: 16px; line-height: 1.6;">
                        Продвижение — это <strong>не спринт, а устойчивая стратегия</strong>. Быстрые рывки работают только в теории.
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      <strong>Стабильность, постепенность и повторяемость</strong> — то, что дает долгосрочный рост и удержание позиций.
                    </p>
                    
                    <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6; font-weight: 600; text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
                      Harmex создан именно для такой модели.
                    </p>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #fc8b3b; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(252, 139, 59, 0.35);">
                            Повысить позиции товаров
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e9ecef;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding-bottom: 16px;">
                          <p style="margin: 0; color: #6c757d; font-size: 13px; line-height: 1.6; text-align: center;">
                            Вы получили это сообщение, потому что выразили согласие получать письма от «Harmex».<br>
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #333333; text-decoration: underline;">здесь</a>.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.6; text-align: center;">
                            С уважением,<br>
                            <strong style="color: #495057;">команда Harmex</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  },
  {
    subject: "Держите все под контролем: подробная аналитика",
    html: `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Держите все под контролем: подробная аналитика</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; max-width: 600px;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #fc8b3b; padding: 20px 40px; text-align: center;">
                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 10px; line-height: 0;">
                          <img src="https://ozonmpportal.hb.vkcs.cloud/icons/mailicon.png" width="36" height="36" alt="Harmex" style="display: block; border: 0;" />
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 30px 40px 0; text-align: center;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                      Держите все под контролем: подробная аналитика
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Добрый день, уважаемый клиент!
                    </p>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      <strong>Harmex</strong> дает вам полный контроль над продвижением. По каждому из выполненных действий формируется прозрачная отчетность:
                    </p>
                    
                    <div style="background-color: #f8f9fa; padding: 24px; margin: 24px 0; border-radius: 8px; border-left: 4px solid #fc8b3b;">
                      <ul style="margin: 0; padding-left: 20px; color: #495057; font-size: 15px; line-height: 1.8;">
                        <li>Скрин выдачи по ключевому запросу</li>
                        <li>Переходы на карточку</li>
                        <li>Фиксацию выкупа</li>
                        <li>Динамику по позициям</li>
                        <li>Статус выполнения задачи</li>
                      </ul>
                    </div>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Эта система <strong>не оставляет «слепых зон»</strong>. Вы понимаете, что именно влияет на рост, где результаты самые сильные, какие ниши дают максимальный отклик.
                    </p>
                    
                    <div style="background-color: #f8f9fa; border: 2px solid #fc8b3b; padding: 24px; margin: 30px 0; border-radius: 8px; text-align: center;">
                      <p style="margin: 0; color: #333333; font-size: 17px; line-height: 1.6; font-weight: 600;">
                        Такой уровень аналитики позволяет принимать решения,<br>основанные на данных, а не догадках.
                      </p>
                    </div>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #fc8b3b; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(252, 139, 59, 0.35);">
                            Посмотреть статистику
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e9ecef;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding-bottom: 16px;">
                          <p style="margin: 0; color: #6c757d; font-size: 13px; line-height: 1.6; text-align: center;">
                            Вы получили это сообщение, потому что выразили согласие получать письма от «Harmex».<br>
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #333333; text-decoration: underline;">здесь</a>.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.6; text-align: center;">
                            С уважением,<br>
                            <strong style="color: #495057;">команда Harmex</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  },
  {
    subject: "Регулярность — наше всё!",
    html: `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Регулярность — наше всё!</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; max-width: 600px;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #fc8b3b; padding: 20px 40px; text-align: center;">
                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 10px; line-height: 0;">
                          <img src="https://ozonmpportal.hb.vkcs.cloud/icons/mailicon.png" width="36" height="36" alt="Harmex" style="display: block; border: 0;" />
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 30px 40px 0; text-align: center;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                      Регулярность — наше всё!
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      На связи <strong>Harmex</strong>!
                    </p>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Алгоритмы любят последовательность. Если ваши задачи поступают регулярно, маркетплейс фиксирует стабильную активность вокруг товара и поднимает карточку выше в поисковой выдаче.
                    </p>
                    
                    <div style="background-color: #fff5ee; border-left: 4px solid #fc8b3b; padding: 20px; margin: 24px 0; border-radius: 4px;">
                      <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">
                        Разовые всплески не работают — они дают короткий эффект, но не формируют историю.
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      <strong>Регулярность — это основа долгой игры.</strong> Она создаёт органический рост, увеличивает CTR, повышает вероятность получения отзывов и дает лучший ROI в перспективе месяца и квартала.
                    </p>
                    
                    <div style="background-color: #f8f9fa; border: 2px solid #fc8b3b; padding: 24px; margin: 30px 0; border-radius: 8px; text-align: center;">
                      <p style="margin: 0; color: #333333; font-size: 17px; line-height: 1.5; font-weight: 600;">
                        Стратегия «понемногу, но стабильно»<br>всегда побеждает хаотичные попытки.
                      </p>
                    </div>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #fc8b3b; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(252, 139, 59, 0.35);">
                            Зайти в личный кабинет
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e9ecef;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding-bottom: 16px;">
                          <p style="margin: 0; color: #6c757d; font-size: 13px; line-height: 1.6; text-align: center;">
                            Вы получили это сообщение, потому что выразили согласие получать письма от «Harmex».<br>
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #333333; text-decoration: underline;">здесь</a>.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.6; text-align: center;">
                            С уважением,<br>
                            <strong style="color: #495057;">команда Harmex</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  },
  {
    subject: "Как правильно работать с отзывами и рейтингом?",
    html: `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Как правильно работать с отзывами и рейтингом?</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; max-width: 600px;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #fc8b3b; padding: 20px 40px; text-align: center;">
                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 10px; line-height: 0;">
                          <img src="https://ozonmpportal.hb.vkcs.cloud/icons/mailicon.png" width="36" height="36" alt="Harmex" style="display: block; border: 0;" />
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 30px 40px 0; text-align: center;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                      Как правильно работать с отзывами и рейтингом?
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Добрый день, уважаемый клиент!
                    </p>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Отзывы — это второй по силе фактор, который влияет на рост карточки, удержание позиций и конверсию в покупку.
                    </p>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Даже идеально выполненные выкупы не спасут товар с низким рейтингом или слабой визуализацией.
                    </p>
                    
                    <div style="background-color: #f8f9fa; padding: 24px; margin: 24px 0; border-radius: 8px; border-left: 4px solid #fc8b3b;">
                      <p style="margin: 0 0 12px; color: #333333; font-size: 16px; line-height: 1.4; font-weight: 600;">
                        Убедитесь, что карточка упакована профессионально:
                      </p>
                      <ul style="margin: 0; padding-left: 20px; color: #495057; font-size: 15px; line-height: 1.8;">
                        <li>Качественные фото</li>
                        <li>Корректное описание</li>
                        <li>Отсутствие брака</li>
                      </ul>
                    </div>
                    
                    <div style="background-color: #fff5ee; border: 2px solid #fc8b3b; padding: 24px; margin: 30px 0; border-radius: 8px; text-align: center;">
                      <p style="margin: 0 0 12px; color: #333333; font-size: 17px; line-height: 1.5; font-weight: 600;">
                        80% падений в выдаче происходят из-за негативных отзывов
                      </p>
                      <p style="margin: 0; color: #555555; font-size: 15px; line-height: 1.6;">
                        Иногда один плохой комментарий с фото может перечеркнуть месяц продвижения — поэтому важно работать с качеством товара и опытом покупателей.
                      </p>
                    </div>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #fc8b3b; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(252, 139, 59, 0.35);">
                            Проверить отзывы и рейтинг
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e9ecef;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding-bottom: 16px;">
                          <p style="margin: 0; color: #6c757d; font-size: 13px; line-height: 1.6; text-align: center;">
                            Вы получили это сообщение, потому что выразили согласие получать письма от «Harmex».<br>
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #333333; text-decoration: underline;">здесь</a>.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.6; text-align: center;">
                            С уважением,<br>
                            <strong style="color: #495057;">команда Harmex</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  },
  {
    subject: 'Выкуп "завис": только без паники!',
    html: `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Что делать, если выкуп "завис"</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; max-width: 600px;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #fc8b3b; padding: 20px 40px; text-align: center;">
                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 10px; line-height: 0;">
                          <img src="https://ozonmpportal.hb.vkcs.cloud/icons/mailicon.png" width="36" height="36" alt="Harmex" style="display: block; border: 0;" />
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 30px 40px 0; text-align: center;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                      Выкуп "завис": только без паники!
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Здравствуйте!
                    </p>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Если вы видите, что выкуп не начался сразу — это нормально. На запуск могут влиять множество факторов:
                    </p>
                    
                    <div style="background-color: #f8f9fa; padding: 24px; margin: 24px 0; border-radius: 8px; border-left: 4px solid #fc8b3b;">
                      <ul style="margin: 0; padding-left: 20px; color: #495057; font-size: 15px; line-height: 1.8;">
                        <li>Низкая активность покупателей в конкретном регионе</li>
                        <li>Ограничения маркетплейса</li>
                        <li>Лимиты по товару</li>
                        <li>Ночное время</li>
                        <li>Резкая смена спроса</li>
                      </ul>
                    </div>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Может быть множество причин — не переживайте в такие моменты временных трудностей, всё решится.
                    </p>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      <strong>Harmex</strong> выстраивает естественный, безопасный темп выполнения задач.
                    </p>
                    
                    <div style="background-color: #fff5ee; border: 2px solid #fc8b3b; padding: 24px; margin: 30px 0; border-radius: 8px; text-align: center;">
                      <p style="margin: 0; color: #333333; font-size: 18px; line-height: 1.5; font-weight: 600;">
                        Подождите 3–4 часа — и процесс стабилизируется.
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Система автоматически распределяет задачи среди исполнителей так, чтобы продвижение выглядело максимально органично и безопасно.
                    </p>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #fc8b3b; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(252, 139, 59, 0.35);">
                            Перейти в личный кабинет
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e9ecef;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding-bottom: 16px;">
                          <p style="margin: 0; color: #6c757d; font-size: 13px; line-height: 1.6; text-align: center;">
                            Вы получили это сообщение, потому что выразили согласие получать письма от «Harmex».<br>
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #333333; text-decoration: underline;">здесь</a>.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.6; text-align: center;">
                            С уважением,<br>
                            <strong style="color: #495057;">команда Harmex</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  },
  {
    subject: "У вас несколько магазинов? Все процессы в одном окне",
    html: `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Как работать с несколькими магазинами</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; max-width: 600px;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #fc8b3b; padding: 20px 40px; text-align: center;">
                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 10px; line-height: 0;">
                          <img src="https://ozonmpportal.hb.vkcs.cloud/icons/mailicon.png" width="36" height="36" alt="Harmex" style="display: block; border: 0;" />
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 30px 40px 0; text-align: center;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                      У вас несколько магазинов? Все процессы в одном окне
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Здравствуйте!
                    </p>
                    
                    <p style="margin: 0 0 24px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Если вы управляете несколькими магазинами или ведете клиентов, <strong>Harmex</strong> полностью поддерживает эту модель.
                    </p>
                    
                    <!-- Option 1 -->
                    <div style="background-color: #f8f9fa; padding: 24px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #fc8b3b;">
                      <p style="margin: 0 0 8px; color: #333333; font-size: 16px; line-height: 1.4; font-weight: 600;">
                        Один кабинет
                      </p>
                      <p style="margin: 0; color: #555555; font-size: 15px; line-height: 1.6;">
                        Вы можете работать в одном кабинете, если процессы общие и контролируются вами.
                      </p>
                    </div>
                    
                    <!-- Option 2 -->
                    <div style="background-color: #f8f9fa; padding: 24px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #fc8b3b;">
                      <p style="margin: 0 0 8px; color: #333333; font-size: 16px; line-height: 1.4; font-weight: 600;">
                        Несколько кабинетов
                      </p>
                      <p style="margin: 0; color: #555555; font-size: 15px; line-height: 1.6;">
                        Если магазины принадлежат разным владельцам — рекомендуется разделять кабинеты, чтобы избежать путаницы и ошибок в заказах.
                      </p>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 24px; margin: 24px 0; border-radius: 8px; border: 1px solid #e9ecef;">
                      <p style="margin: 0 0 12px; color: #333333; font-size: 16px; line-height: 1.4; font-weight: 600;">
                        В системе есть:
                      </p>
                      <ul style="margin: 0; padding-left: 20px; color: #495057; font-size: 15px; line-height: 1.8;">
                        <li>Распределение ролей</li>
                        <li>Управление доступами</li>
                        <li>Отчёты по каждому магазину</li>
                      </ul>
                    </div>
                    
                    <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Это удобная инфраструктура для менеджеров и агентств, которые ведут 5–20 кабинетов одновременно.
                    </p>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #fc8b3b; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(252, 139, 59, 0.35);">
                            Перейти в единое окно
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e9ecef;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding-bottom: 16px;">
                          <p style="margin: 0; color: #6c757d; font-size: 13px; line-height: 1.6; text-align: center;">
                            Вы получили это сообщение, потому что выразили согласие получать письма от «Harmex».<br>
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #333333; text-decoration: underline;">здесь</a>.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.6; text-align: center;">
                            С уважением,<br>
                            <strong style="color: #495057;">команда Harmex</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  },
  {
    subject: "Получите бонус за приведенных клиентов",
    html: `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Партнёрская программа</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; max-width: 600px;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #fc8b3b; padding: 20px 40px; text-align: center;">
                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 10px; line-height: 0;">
                          <img src="https://ozonmpportal.hb.vkcs.cloud/icons/mailicon.png" width="36" height="36" alt="Harmex" style="display: block; border: 0;" />
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 30px 40px 0; text-align: center;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                      Получите бонус за приведенных клиентов
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Здравствуйте!
                    </p>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Менеджерам, агентствам и специалистам мы предлагаем <strong>партнерскую программу с прозрачной системой начислений</strong>. Если вы приводите клиентов, каждая их услуга приносит вам стабильный процент.
                    </p>
                    
                    <div style="background-color: #f8f9fa; border-left: 4px solid #fc8b3b; padding: 20px; margin: 24px 0; border-radius: 4px;">
                      <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">
                        Это не разовая история — вы получаете выплаты постоянно, пока клиент работает в системе.
                      </p>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 24px; margin: 24px 0; border-radius: 8px; border: 1px solid #e9ecef;">
                      <p style="margin: 0 0 12px; color: #333333; font-size: 16px; line-height: 1.4; font-weight: 600;">
                        Для кого это выгодно:
                      </p>
                      <ul style="margin: 0; padding-left: 20px; color: #495057; font-size: 15px; line-height: 1.8;">
                        <li><strong>Для агентств</strong> — отдельный источник дохода</li>
                        <li><strong>Для менеджеров</strong> — возможность монетизировать опыт и контакты</li>
                      </ul>
                    </div>
                    
                    <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                      <strong>Harmex</strong> выгоден не только как инструмент продвижения, но и как точка роста вашего бизнеса.
                    </p>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #fc8b3b; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(252, 139, 59, 0.35);">
                            Перейти в личный кабинет
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e9ecef;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding-bottom: 16px;">
                          <p style="margin: 0; color: #6c757d; font-size: 13px; line-height: 1.6; text-align: center;">
                            Вы получили это сообщение, потому что выразили согласие получать письма от «Harmex».<br>
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #333333; text-decoration: underline;">здесь</a>.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.6; text-align: center;">
                            С уважением,<br>
                            <strong style="color: #495057;">команда Harmex</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  },
  {
    subject: "Увеличиваем объем продаж вдвое",
    html: `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Как увеличить объём продаж x2</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; max-width: 600px;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #fc8b3b; padding: 20px 40px; text-align: center;">
                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 10px; line-height: 0;">
                          <img src="https://ozonmpportal.hb.vkcs.cloud/icons/mailicon.png" width="36" height="36" alt="Harmex" style="display: block; border: 0;" />
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 30px 40px 0; text-align: center;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                      Увеличиваем объем продаж вдвое
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      На связи команда <strong>Harmex</strong>!
                    </p>
                    
                    <p style="margin: 0 0 24px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Рост продаж складывается из 4 основных факторов:
                    </p>
                    
                    <!-- Factor 1 -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
                      <tr>
                        <td style="width: 40px; vertical-align: top; padding-top: 2px;">
                          <div style="width: 32px; height: 32px; background-color: #fc8b3b; border-radius: 50%; color: #ffffff; font-weight: 700; font-size: 16px; text-align: center; line-height: 32px;">1</div>
                        </td>
                        <td style="padding-left: 16px;">
                          <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">Качественный визуал карточки</p>
                        </td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
                      <tr>
                        <td style="width: 40px; vertical-align: top; padding-top: 2px;">
                          <div style="width: 32px; height: 32px; background-color: #fc8b3b; border-radius: 50%; color: #ffffff; font-weight: 700; font-size: 16px; text-align: center; line-height: 32px;">2</div>
                        </td>
                        <td style="padding-left: 16px;">
                          <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">Регулярные и естественные выкупы</p>
                        </td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
                      <tr>
                        <td style="width: 40px; vertical-align: top; padding-top: 2px;">
                          <div style="width: 32px; height: 32px; background-color: #fc8b3b; border-radius: 50%; color: #ffffff; font-weight: 700; font-size: 16px; text-align: center; line-height: 32px;">3</div>
                        </td>
                        <td style="padding-left: 16px;">
                          <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">Корректировка SEO и ключевых запросов</p>
                        </td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                      <tr>
                        <td style="width: 40px; vertical-align: top; padding-top: 2px;">
                          <div style="width: 32px; height: 32px; background-color: #fc8b3b; border-radius: 50%; color: #ffffff; font-weight: 700; font-size: 16px; text-align: center; line-height: 32px;">4</div>
                        </td>
                        <td style="padding-left: 16px;">
                          <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">Системная работа с отзывами</p>
                        </td>
                      </tr>
                    </table>
                    
                    <div style="background-color: #fff5ee; border: 2px solid #fc8b3b; padding: 24px; margin: 30px 0; border-radius: 8px;">
                      <p style="margin: 0 0 12px; color: #333333; font-size: 17px; line-height: 1.5; font-weight: 600;">
                        Эффект «снежного кома»:
                      </p>
                      <p style="margin: 0; color: #555555; font-size: 16px; line-height: 1.6;">
                        Когда эти элементы работают синхронно, позиции растут → органика увеличивается → отзывы множатся → карточка становится более привлекательной для алгоритмов маркетплейса и самих покупателей.
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6; text-align: center; background-color: #f8f9fa; padding: 20px; border-radius: 8px; font-weight: 600;">
                      Эта формула проверена сотнями магазинов — применяйте её последовательно.
                    </p>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #fc8b3b; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(252, 139, 59, 0.35);">
                            Увеличить продажи х2
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e9ecef;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding-bottom: 16px;">
                          <p style="margin: 0; color: #6c757d; font-size: 13px; line-height: 1.6; text-align: center;">
                            Вы получили это сообщение, потому что выразили согласие получать письма от «Harmex».<br>
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #333333; text-decoration: underline;">здесь</a>.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.6; text-align: center;">
                            С уважением,<br>
                            <strong style="color: #495057;">команда Harmex</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  },
  {
    subject: "Секреты выхода в ТОП выдачи",
    html: `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Как выйти в ТОП выдачи</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; max-width: 600px;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #fc8b3b; padding: 20px 40px; text-align: center;">
                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 10px; line-height: 0;">
                          <img src="https://ozonmpportal.hb.vkcs.cloud/icons/mailicon.png" width="36" height="36" alt="Harmex" style="display: block; border: 0;" />
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 30px 40px 0; text-align: center;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                      Секреты выхода в ТОП выдачи
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Здравствуйте! На связи команда <strong>Harmex</strong>.
                    </p>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Выход в ТОП — это не удача и не «везение» карточки. Это результат управления 4 ключевыми метриками:
                    </p>
                    
                    <div style="background-color: #f8f9fa; padding: 24px; margin: 24px 0; border-radius: 8px; border-left: 4px solid #fc8b3b;">
                      <ul style="margin: 0; padding-left: 20px; color: #495057; font-size: 15px; line-height: 1.8;">
                        <li><strong>Динамика продаж</strong></li>
                        <li><strong>Частота безопасных выкупов</strong></li>
                        <li><strong>Рост отзывов</strong></li>
                        <li><strong>Качество магазина</strong> — рейтинг, показатели по доставке, возвратам, упаковке</li>
                      </ul>
                    </div>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      <strong>Harmex</strong> помогает воздействовать на каждый из этих факторов одновременно. Когда вы регулярно двигаете карточку, алгоритм видит стабильный спрос и начинает поднимать товар в выдаче естественным способом.
                    </p>
                    
                    <div style="background-color: #fff5ee; border: 2px solid #fc8b3b; padding: 24px; margin: 30px 0; border-radius: 8px; text-align: center;">
                      <p style="margin: 0; color: #333333; font-size: 17px; line-height: 1.5; font-weight: 600;">
                        Важна не разовая активность, а ритм — тот самый темп, который создает устойчивый рост.
                      </p>
                    </div>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #fc8b3b; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(252, 139, 59, 0.35);">
                            Вывести карточки в топ
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e9ecef;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding-bottom: 16px;">
                          <p style="margin: 0; color: #6c757d; font-size: 13px; line-height: 1.6; text-align: center;">
                            Вы получили это сообщение, потому что выразили согласие получать письма от «Harmex».<br>
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #333333; text-decoration: underline;">здесь</a>.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.6; text-align: center;">
                            С уважением,<br>
                            <strong style="color: #495057;">команда Harmex</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  },
  {
    subject: "Почему 50% клиентов выходят на повторные пополнения",
    html: `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Почему 50% клиентов выходят на повторные пополнения</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; max-width: 600px;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #fc8b3b; padding: 20px 40px; text-align: center;">
                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 10px; line-height: 0;">
                          <img src="https://ozonmpportal.hb.vkcs.cloud/icons/mailicon.png" width="36" height="36" alt="Harmex" style="display: block; border: 0;" />
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 30px 40px 0; text-align: center;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; line-height: 1.3;">
                      Почему 50% клиентов выходят на повторные пополнения
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Вас приветствует <strong>Harmex</strong>!
                    </p>
                    
                    <div style="background-color: #fff5ee; border: 2px solid #fc8b3b; padding: 24px; margin: 24px 0; border-radius: 8px; text-align: center;">
                      <p style="margin: 0 0 8px; color: #fc8b3b; font-size: 42px; line-height: 1; font-weight: 700;">50%</p>
                      <p style="margin: 0; color: #333333; font-size: 17px; line-height: 1.4; font-weight: 600;">
                        Каждый второй пользователь регулярно<br>возвращается к новым задачам и дополнительным пополнениям
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      <strong>Причина проста: Harmex дает предсказуемый результат.</strong> Вы видите отчёты по каждому действию, понимаете, как распределяются задачи, видите движение карточки и фиксированный эффект от регулярного темпа.
                    </p>
                    
                    <div style="background-color: #f8f9fa; border-left: 4px solid #fc8b3b; padding: 20px; margin: 24px 0; border-radius: 4px;">
                      <p style="margin: 0 0 8px; color: #333333; font-size: 16px; line-height: 1.6; font-weight: 600;">
                        Не нужно вручную:
                      </p>
                      <ul style="margin: 0; padding-left: 20px; color: #555555; font-size: 15px; line-height: 1.8;">
                        <li>Координировать исполнителей</li>
                        <li>Искать трафик</li>
                        <li>Решать проблемы со скоростью</li>
                      </ul>
                      <p style="margin: 12px 0 0; color: #333333; font-size: 16px; line-height: 1.6; font-weight: 600;">Всё автоматизировано.</p>
                    </div>
                    
                    <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6; font-weight: 600; text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
                      Когда система обеспечивает порядок и прозрачность, появляется ощущение опоры. Поэтому клиенты возвращаются.
                    </p>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #fc8b3b; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(252, 139, 59, 0.35);">
                            Оформить самовыкупы
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e9ecef;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding-bottom: 16px;">
                          <p style="margin: 0; color: #6c757d; font-size: 13px; line-height: 1.6; text-align: center;">
                            Вы получили это сообщение, потому что выразили согласие получать письма от «Harmex».<br>
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #333333; text-decoration: underline;">здесь</a>.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.6; text-align: center;">
                            С уважением,<br>
                            <strong style="color: #495057;">команда Harmex</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  },
  {
    subject: "Масштабируем магазин правильно",
    html: `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Как масштабировать магазин</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; max-width: 600px;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #fc8b3b; padding: 20px 40px; text-align: center;">
                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 10px; line-height: 0;">
                          <img src="https://ozonmpportal.hb.vkcs.cloud/icons/mailicon.png" width="36" height="36" alt="Harmex" style="display: block; border: 0;" />
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 30px 40px 0; text-align: center;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                      Как масштабировать магазин
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Вас приветствует <strong>Harmex</strong>!
                    </p>
                    
                    <div style="background-color: #fff5ee; border-left: 4px solid #fc8b3b; padding: 20px; margin: 24px 0; border-radius: 4px;">
                      <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">
                        Когда карточка закрепилась в ТОП-позициях, продавцы часто делают <strong>ошибку — прекращают работать с продвижением</strong>. Но именно здесь начинается момент масштабирования.
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 16px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Вы можете заходить в новые ниши, запускать дополнительные артикулы, усиливать линейку, создавать вариации товаров, открывать новые магазины.
                    </p>
                    
                    <div style="background-color: #f8f9fa; border: 2px solid #fc8b3b; padding: 24px; margin: 24px 0; border-radius: 8px; text-align: center;">
                      <p style="margin: 0; color: #333333; font-size: 17px; line-height: 1.5; font-weight: 600;">
                        Harmex поддерживает любое направление: вы можете вести 1 магазин или 20 — система адаптируется под масштаб.
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6; text-align: center; background-color: #f8f9fa; padding: 20px; border-radius: 8px; font-weight: 600;">
                      Рост — это стратегия, а не случайность. И у вас уже есть инструмент, который этот рост поддерживает.
                    </p>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #fc8b3b; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(252, 139, 59, 0.35);">
                            Перейти в личный кабинет
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e9ecef;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding-bottom: 16px;">
                          <p style="margin: 0; color: #6c757d; font-size: 13px; line-height: 1.6; text-align: center;">
                            Вы получили это сообщение, потому что выразили согласие получать письма от «Harmex».<br>
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #333333; text-decoration: underline;">здесь</a>.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.6; text-align: center;">
                            С уважением,<br>
                            <strong style="color: #495057;">команда Harmex</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  },
  {
    subject: "Какие KPI нужно считать продавцу",
    html: `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Какие KPI нужно считать продавцу</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; max-width: 600px;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #fc8b3b; padding: 20px 40px; text-align: center;">
                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 10px; line-height: 0;">
                          <img src="https://ozonmpportal.hb.vkcs.cloud/icons/mailicon.png" width="36" height="36" alt="Harmex" style="display: block; border: 0;" />
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 30px 40px 0; text-align: center;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                      Какие KPI нужно считать продавцу
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Здравствуйте!
                    </p>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Сильные продавцы всегда держат под контролем правильные показатели. В <strong>Harmex</strong> вы можете отслеживать:
                    </p>
                    
                    <div style="background-color: #f8f9fa; padding: 24px; margin: 24px 0; border-radius: 8px; border-left: 4px solid #fc8b3b;">
                      <ul style="margin: 0; padding-left: 20px; color: #495057; font-size: 15px; line-height: 1.8;">
                        <li><strong>Динамику позиций</strong></li>
                        <li><strong>CPR</strong> (стоимость продвижения)</li>
                        <li><strong>Маржинальность</strong></li>
                        <li><strong>Частоту повторных продаж</strong></li>
                        <li><strong>Брендовый спрос</strong></li>
                        <li><strong>Изменения в выдаче</strong></li>
                      </ul>
                    </div>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Эти метрики — <strong>основа грамотной стратегии</strong>. Они помогают избежать слепых зон, перерасхода бюджета, неправильных гипотез и бессистемных действий.
                    </p>
                    
                    <div style="background-color: #fff5ee; border: 2px solid #fc8b3b; padding: 24px; margin: 30px 0; border-radius: 8px; text-align: center;">
                      <p style="margin: 0; color: #333333; font-size: 17px; line-height: 1.5; font-weight: 600;">
                        Когда продавец ориентируется на цифры, а не на эмоции — результат становится стабильным и прогнозируемым.
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Формируйте свой подход так, как у профессионалов.
                    </p>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #fc8b3b; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(252, 139, 59, 0.35);">
                            Узнать статистику
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e9ecef;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding-bottom: 16px;">
                          <p style="margin: 0; color: #6c757d; font-size: 13px; line-height: 1.6; text-align: center;">
                            Вы получили это сообщение, потому что выразили согласие получать письма от «Harmex».<br>
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #333333; text-decoration: underline;">здесь</a>.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.6; text-align: center;">
                            С уважением,<br>
                            <strong style="color: #495057;">команда Harmex</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  },
  {
    subject: "Ваш стратегический план на 30 дней",
    html: `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ваш стратегический план на 30 дней</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; max-width: 600px;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #fc8b3b; padding: 20px 40px; text-align: center;">
                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 10px; line-height: 0;">
                          <img src="https://ozonmpportal.hb.vkcs.cloud/icons/mailicon.png" width="36" height="36" alt="Harmex" style="display: block; border: 0;" />
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 30px 40px 0; text-align: center;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                      Ваш стратегический план на 30 дней
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      На связи команда <strong>Harmex</strong>!
                    </p>
                    
                    <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Чтобы закрепиться в выдаче и создать прогнозируемый рост, придерживайтесь следующего плана:
                    </p>
                    
                    <!-- Step 1 -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                      <tr>
                        <td style="width: 40px; vertical-align: top; padding-top: 2px;">
                          <div style="width: 36px; height: 36px; background-color: #fc8b3b; border-radius: 50%; color: #ffffff; font-weight: 700; font-size: 18px; text-align: center; line-height: 36px;">
                            1
                          </div>
                        </td>
                        <td style="padding-left: 16px;">
                          <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">
                            Запустите <strong>2–3 стабильные задачи</strong> по ключевым артикулам
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Step 2 -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                      <tr>
                        <td style="width: 40px; vertical-align: top; padding-top: 2px;">
                          <div style="width: 36px; height: 36px; background-color: #fc8b3b; border-radius: 50%; color: #ffffff; font-weight: 700; font-size: 18px; text-align: center; line-height: 36px;">
                            2
                          </div>
                        </td>
                        <td style="padding-left: 16px;">
                          <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">
                            Отслеживайте <strong>еженедельное движение позиций</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Step 3 -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                      <tr>
                        <td style="width: 40px; vertical-align: top; padding-top: 2px;">
                          <div style="width: 36px; height: 36px; background-color: #fc8b3b; border-radius: 50%; color: #ffffff; font-weight: 700; font-size: 18px; text-align: center; line-height: 36px;">
                            3
                          </div>
                        </td>
                        <td style="padding-left: 16px;">
                          <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">
                            Обновите <strong>SEO</strong> под спрос и сезонность
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Step 4 -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                      <tr>
                        <td style="width: 40px; vertical-align: top; padding-top: 2px;">
                          <div style="width: 36px; height: 36px; background-color: #fc8b3b; border-radius: 50%; color: #ffffff; font-weight: 700; font-size: 18px; text-align: center; line-height: 36px;">
                            4
                          </div>
                        </td>
                        <td style="padding-left: 16px;">
                          <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">
                            Корректируйте <strong>карточку:</strong> фото, описание, УТП
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Step 5 -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                      <tr>
                        <td style="width: 40px; vertical-align: top; padding-top: 2px;">
                          <div style="width: 36px; height: 36px; background-color: #fc8b3b; border-radius: 50%; color: #ffffff; font-weight: 700; font-size: 18px; text-align: center; line-height: 36px;">
                            5
                          </div>
                        </td>
                        <td style="padding-left: 16px;">
                          <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">
                            Постепенно <strong>увеличивайте объём задач</strong> по мере роста органики
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <div style="background-color: #f8f9fa; border: 2px solid #fc8b3b; padding: 24px; margin: 30px 0; border-radius: 8px; text-align: center;">
                      <p style="margin: 0; color: #333333; font-size: 17px; line-height: 1.5; font-weight: 600;">
                        Этот план — фундамент, который используют все сильные продавцы. Он подходит и новичку, и магазину с объемом в миллионы.
                      </p>
                    </div>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #fc8b3b; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(252, 139, 59, 0.35);">
                            Перейти в личный кабинет
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e9ecef;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding-bottom: 16px;">
                          <p style="margin: 0; color: #6c757d; font-size: 13px; line-height: 1.6; text-align: center;">
                            Вы получили это сообщение, потому что выразили согласие получать письма от «Harmex».<br>
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #333333; text-decoration: underline;">здесь</a>.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.6; text-align: center;">
                            С уважением,<br>
                            <strong style="color: #495057;">команда Harmex</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  },
  {
    subject: "Как сделать правильный старт на маркетплейсах",
    html: `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Как сделать правильный старт на маркетплейсах</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; max-width: 600px;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #fc8b3b; padding: 20px 40px; text-align: center;">
                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 10px; line-height: 0;">
                          <img src="https://ozonmpportal.hb.vkcs.cloud/icons/mailicon.png" width="36" height="36" alt="Harmex" style="display: block; border: 0;" />
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 30px 40px 0; text-align: center;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; line-height: 1.3;">
                      Как сделать правильный старт<br>на маркетплейсах
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Здравствуйте!
                    </p>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Поздравляем — вы прошли всю цепочку, разобрались в механиках работы <strong>Harmex</strong> и теперь управляете продвижением как профессионал.
                    </p>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Если вы хотите ускориться, масштабироваться или получить стратегию под ваш товар — наш менеджер готов подключиться.
                    </p>
                    
                    <div style="background-color: #f8f9fa; padding: 24px; margin: 24px 0; border-radius: 8px; border-left: 4px solid #fc8b3b;">
                      <p style="margin: 0 0 12px; color: #333333; font-size: 16px; line-height: 1.4; font-weight: 600;">
                        Мы можем помочь вам:
                      </p>
                      <ul style="margin: 0; padding-left: 20px; color: #495057; font-size: 15px; line-height: 1.8;">
                        <li>Создать <strong>индивидуальный план</strong></li>
                        <li>Подсказать <strong>оптимальный темп задач</strong></li>
                        <li>Рассчитать <strong>бюджеты</strong></li>
                        <li>Подготовить <strong>стратегию выхода в ТОП</strong></li>
                      </ul>
                    </div>
                    
                    <div style="background-color: #fff5ee; border: 2px solid #fc8b3b; padding: 24px; margin: 30px 0; border-radius: 8px; text-align: center;">
                      <p style="margin: 0; color: #333333; font-size: 18px; line-height: 1.5; font-weight: 700;">
                        Ваш рост — это наша зона ответственности.<br>Давайте усилим его вместе.
                      </p>
                    </div>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #fc8b3b; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(252, 139, 59, 0.35);">
                            Перейти в личный кабинет
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e9ecef;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding-bottom: 16px;">
                          <p style="margin: 0; color: #6c757d; font-size: 13px; line-height: 1.6; text-align: center;">
                            Вы получили это сообщение, потому что выразили согласие получать письма от «Harmex».<br>
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #333333; text-decoration: underline;">здесь</a>.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.6; text-align: center;">
                            С уважением,<br>
                            <strong style="color: #495057;">команда Harmex</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  },
];
