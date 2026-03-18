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
                  <td style="background-color: #FF5E34; padding: 20px 40px; text-align: center;">
                    <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
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
                      Благодарим вас за регистрацию в <strong>Harmex</strong> — экосистеме, которая автоматизирует самовыкупы, продвижение карточек и рост позиций ваших товаров.
                    </p>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      С этого момента у вас появляется инструмент, который экономит время, снижает ошибки и помогает вывести магазин на стабильные показатели.
                    </p>
                    
                    <div style="background-color: #f8f9fa; border-left: 4px solid #FF5E34; padding: 20px; margin: 30px 0; border-radius: 4px;">
                      <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">
                        В ближайшие дни вы получите серию писем, где мы разберём механику продвижения, структуру задач и стратегии, которые используют сильнейшие продавцы.
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Наша цель — чтобы вы быстро адаптировались, уверенно запустили первые задачи и увидели результат в ближайшие дни. <strong>Начнём путь к росту.</strong>
                    </p>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #FF5E34; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(255, 94, 52, 0.35);">
                            Войти в личный кабинет
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
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #1565c0; text-decoration: underline;">здесь</a>.
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
    subject: "Как работает система внутри?",
    html: `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Как работает система внутри?</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; max-width: 600px;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #FF5E34; padding: 20px 40px; text-align: center;">
                    <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 30px 40px 0; text-align: center;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                      Как работает система внутри?
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
                      Самовыкупы часто кажутся хаотичным процессом, но в <strong>Harmex</strong> всё работает как чёткая технологическая цепочка.
                    </p>
                    
                    <div style="background-color: #f8f9fa; padding: 24px; margin: 30px 0; border-radius: 8px; border: 1px solid #e9ecef;">
                      <p style="margin: 0 0 16px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Вы создаёте задачу, система автоматически распределяет её среди исполнителей, контролирует выполнение и формирует детальную отчётность.
                      </p>
                      <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">
                        Каждый этап — от запуска до закрытия задачи — прозрачный и отслеживаемый.
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Вам <strong>не нужно «держать руку на пульсе»</strong> каждые 10 минут.
                    </p>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Механизм сделан так, чтобы процесс шёл плавно, естественно и безопасно для карточки.
                    </p>
                    
                    <div style="background-color: #e7f3ff; border-left: 4px solid #1e88e5; padding: 20px; margin: 30px 0; border-radius: 4px;">
                      <p style="margin: 0; color: #1565c0; font-size: 17px; line-height: 1.6; font-weight: 600;">
                        Ваше участие минимально → результат стабильный.
                      </p>
                    </div>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #FF5E34; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(255, 94, 52, 0.35);">
                            Войти в личный кабинет
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
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #1565c0; text-decoration: underline;">здесь</a>.
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
    subject: "Как создать первую задачу правильно",
    html: `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Как создать первую задачу правильно</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; max-width: 600px;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #FF5E34; padding: 20px 40px; text-align: center;">
                    <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 30px 40px 0; text-align: center;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                      Как создать первую задачу правильно
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
                      Чтобы запустить свои первые выкупы без ошибок, просто выполните три шага:
                    </p>
                    
                    <!-- Step 1 -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                      <tr>
                        <td style="width: 40px; vertical-align: top; padding-top: 2px;">
                          <div style="width: 32px; height: 32px; background-color: #FF5E34; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 700; font-size: 16px; text-align: center; line-height: 32px;">
                            1
                          </div>
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
                          <div style="width: 32px; height: 32px; background-color: #FF5E34; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 700; font-size: 16px; text-align: center; line-height: 32px;">
                            2
                          </div>
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
                          <div style="width: 32px; height: 32px; background-color: #FF5E34; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 700; font-size: 16px; text-align: center; line-height: 32px;">
                            3
                          </div>
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
                    
                    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 30px 0; border-radius: 4px;">
                      <p style="margin: 0 0 12px; color: #856404; font-size: 16px; line-height: 1.6;">
                        <strong>Этот процесс занимает 5 минут</strong>, но именно он запускает рост вашей карточки в поисковой выдаче.
                      </p>
                      <p style="margin: 0; color: #856404; font-size: 16px; line-height: 1.6;">
                        Первый шаг всегда самый ключевой.
                      </p>
                    </div>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #FF5E34; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(255, 94, 52, 0.35);">
                            Войти в личный кабинет
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
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #1565c0; text-decoration: underline;">здесь</a>.
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
    subject: "Почему важны первые 72 часа",
    html: `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Почему важны первые 72 часа</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; max-width: 600px;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #FF5E34; padding: 20px 40px; text-align: center;">
                    <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 30px 40px 0; text-align: center;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                      Почему важны первые 72 часа
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Здравствуйте!
                    </p>
                    
                    <div style="background-color: #e8f5e9; border: 2px solid #4caf50; padding: 24px; margin: 20px 0; border-radius: 8px; text-align: center;">
                      <p style="margin: 0; color: #2e7d32; font-size: 18px; line-height: 1.5; font-weight: 600;">
                        <strong style="font-size: 32px; display: block; margin-bottom: 8px;">83%</strong>
                        продавцов, которые запускают первую задачу<br>
                        в течение 72 часов после регистрации,<br>
                        получают лучшие позиции
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      По аналитике <strong>Harmex</strong>, 83% продавцов, которые запускают первую задачу в течение 72 часов после регистрации, получают лучшие позиции и более стабильный рост.
                    </p>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      <strong>Причина проста:</strong> алгоритмы маркетплейса фиксируют раннюю активность товара, отмечают положительную динамику и начинают поднимать карточку выше в поиске.
                    </p>
                    
                    <div style="background-color: #ffebee; border-left: 4px solid #f44336; padding: 20px; margin: 30px 0; border-radius: 4px;">
                      <p style="margin: 0; color: #c62828; font-size: 16px; line-height: 1.6;">
                        Если отложить старт, окно возможностей сужается — активность рассеивается, а конкуренты продолжают продвигаться вперёд.
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Поэтому важно включиться сразу.
                    </p>
                    
                    <p style="margin: 0 0 30px; color: #333333; font-size: 17px; line-height: 1.6; font-weight: 600; text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
                      Первые 72 часа часто определяют<br>последующие 30 дней продаж.
                    </p>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #FF5E34; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(255, 94, 52, 0.35);">
                            Войти в личный кабинет
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
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #1565c0; text-decoration: underline;">здесь</a>.
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
    subject: "Что влияет на скорость выполнения задач",
    html: `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Что влияет на скорость выполнения задач</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; max-width: 600px;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #FF5E34; padding: 20px 40px; text-align: center;">
                    <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 30px 40px 0; text-align: center;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                      Что влияет на скорость выполнения задач
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
                      Скорость выполнения задач зависит от ряда факторов, и важно понимать их заранее.
                    </p>
                    
                    <div style="background-color: #f8f9fa; padding: 24px; margin: 24px 0; border-radius: 8px; border-left: 4px solid #FF5E34;">
                      <p style="margin: 0 0 12px; color: #333333; font-size: 15px; line-height: 1.6; font-weight: 600;">
                        На процесс влияет:
                      </p>
                      <ul style="margin: 0; padding-left: 20px; color: #495057; font-size: 15px; line-height: 1.8;">
                        <li>География выкупов</li>
                        <li>Общее количество запросов в вашей нише</li>
                        <li>Активность пользователей в конкретное время дня</li>
                        <li>Лимиты маркетплейса</li>
                        <li>Технические нюансы карточки — SEO, остатки, фотографии</li>
                      </ul>
                    </div>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Мы <strong>не выполняем выкупы «мгновенно»</strong>. Система делает всё естественно и распределённо, чтобы продвижение выглядело органично.
                    </p>
                    
                    <p style="margin: 0 0 24px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Это предоставляет лучший долгосрочный эффект и снижает риски.
                    </p>
                    
                    <div style="background-color: #e3f2fd; border: 2px solid #2196f3; padding: 20px; margin: 30px 0; border-radius: 8px; text-align: center;">
                      <p style="margin: 0; color: #1565c0; font-size: 17px; line-height: 1.5; font-weight: 600;">
                        Скорость зависит от рынка —<br>качество от нас.
                      </p>
                    </div>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #FF5E34; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(255, 94, 52, 0.35);">
                            Войти в личный кабинет
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
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #1565c0; text-decoration: underline;">здесь</a>.
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
    subject: "Как правильно распределять бюджет",
    html: `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Как правильно распределять бюджет</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; max-width: 600px;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #FF5E34; padding: 20px 40px; text-align: center;">
                    <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 30px 40px 0; text-align: center;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                      Как правильно распределять бюджет
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
                      <strong>Грамотное распределение бюджета — ключ к стабильному росту.</strong>
                    </p>
                    
                    <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Чтобы продвижение не «скакало» и давало предсказуемый результат, используйте стратегию, проверенную сотнями магазинов.
                    </p>
                    
                    <!-- Budget breakdown -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                      <tr>
                        <td style="padding-bottom: 16px;">
                          <div style="background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);">
                            <p style="margin: 0 0 8px; color: #ffffff; font-size: 32px; font-weight: 700; line-height: 1;">
                              30%
                            </p>
                            <p style="margin: 0; color: #ffffff; font-size: 16px; line-height: 1.4;">
                              <strong>Старт</strong> — первые выкупы создают динамику и формируют положительную историю товара
                            </p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 16px;">
                          <div style="background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);">
                            <p style="margin: 0 0 8px; color: #ffffff; font-size: 32px; font-weight: 700; line-height: 1;">
                              50%
                            </p>
                            <p style="margin: 0; color: #ffffff; font-size: 16px; line-height: 1.4;">
                              <strong>Основной пул</strong> — регулярные, ежедневные задачи, создающие стабильный рост позиций
                            </p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div style="background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);">
                            <p style="margin: 0 0 8px; color: #ffffff; font-size: 32px; font-weight: 700; line-height: 1;">
                              20%
                            </p>
                            <p style="margin: 0; color: #ffffff; font-size: 16px; line-height: 1.4;">
                              <strong>Фонд удержания</strong> — поддержание результатов
                            </p>
                          </div>
                        </td>
                      </tr>
                    </table>
                    
                    <div style="background-color: #f1f8e9; border-left: 4px solid #8bc34a; padding: 20px; margin: 30px 0; border-radius: 4px;">
                      <p style="margin: 0; color: #558b2f; font-size: 16px; line-height: 1.6;">
                        Такой подход защищает от просадок, помогает масштабировать нишу и укрепляет позиции органично.
                      </p>
                    </div>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #FF5E34; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(255, 94, 52, 0.35);">
                            Войти в личный кабинет
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
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #1565c0; text-decoration: underline;">здесь</a>.
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
    subject: "Частые ошибки новичков",
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
                  <td style="background-color: #FF5E34; padding: 20px 40px; text-align: center;">
                    <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 30px 40px 0; text-align: center;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                      Частые ошибки новичков
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
                      Новички часто допускают ошибки, которые тормозят продвижение и делают процесс дороже.
                    </p>
                    
                    <div style="background-color: #ffebee; padding: 24px; margin: 24px 0; border-radius: 8px; border-left: 4px solid #f44336;">
                      <p style="margin: 0 0 16px; color: #c62828; font-size: 16px; line-height: 1.4; font-weight: 600;">
                        ❌ Самые распространённые ошибки:
                      </p>
                      <ul style="margin: 0; padding-left: 20px; color: #d32f2f; font-size: 15px; line-height: 1.8;">
                        <li>Слишком большой объём выкупов в начале (алгоритм фиксирует неестественный всплеск)</li>
                        <li>Установка одинаковых ключевых слов</li>
                        <li>Игнорирование остатков</li>
                        <li>Отсутствие корректной аналитики</li>
                        <li>Попытка продвигать сразу всё без стратегии</li>
                      </ul>
                    </div>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      <strong>Исправить это легко</strong> — работать постепенно, анализировать динамику, держать баланс и учитывать ограничения маркетплейса.
                    </p>
                    
                    <div style="background-color: #e8f5e9; border: 2px solid #4caf50; padding: 20px; margin: 30px 0; border-radius: 8px; text-align: center;">
                      <p style="margin: 0; color: #2e7d32; font-size: 17px; line-height: 1.5; font-weight: 600;">
                        ✅ Теперь вы понимаете механику и<br>сможете избежать типичных ловушек
                      </p>
                    </div>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #FF5E34; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(255, 94, 52, 0.35);">
                            Войти в личный кабинет
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
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #1565c0; text-decoration: underline;">здесь</a>.
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
    subject: "Когда ждать первые результаты",
    html: `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Когда ждать первые результаты</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; max-width: 600px;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #FF5E34; padding: 20px 40px; text-align: center;">
                    <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 30px 40px 0; text-align: center;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                      Когда ждать первые результаты
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Здравствуйте!
                    </p>
                    
                    <!-- Timeline -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                      <tr>
                        <td style="padding-bottom: 20px;">
                          <div style="background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); padding: 24px; border-radius: 8px; box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);">
                            <p style="margin: 0 0 8px; color: #ffffff; font-size: 36px; font-weight: 700; line-height: 1; text-align: center;">
                              3–7 дней
                            </p>
                            <p style="margin: 0; color: #ffffff; font-size: 16px; line-height: 1.4; text-align: center;">
                              Первые изменения позиций обычно фиксируются после старта задач
                            </p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div style="background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); padding: 24px; border-radius: 8px; box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);">
                            <p style="margin: 0 0 8px; color: #ffffff; font-size: 36px; font-weight: 700; line-height: 1; text-align: center;">
                              10–14 дней
                            </p>
                            <p style="margin: 0; color: #ffffff; font-size: 16px; line-height: 1.4; text-align: center;">
                              Закрепление результата происходит на этом горизонте
                            </p>
                          </div>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Это естественный темп, учитывающий алгоритмы маркетплейса и органическую активность покупателей.
                    </p>
                    
                    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 30px 0; border-radius: 4px;">
                      <p style="margin: 0 0 12px; color: #856404; font-size: 16px; line-height: 1.6; font-weight: 600;">
                        ⚠️ Важно:
                      </p>
                      <p style="margin: 0; color: #856404; font-size: 16px; line-height: 1.6;">
                        Продвижение — это <strong>не спринт, а устойчивая стратегия</strong>. Быстрые рывки работают только в теории.
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 24px; color: #333333; font-size: 16px; line-height: 1.6;">
                      <strong>Стабильность, постепенность и повторяемость</strong> — то, что даёт долгосрочный рост и удержание позиций.
                    </p>
                    
                    <div style="background-color: #e3f2fd; padding: 20px; margin: 30px 0; border-radius: 8px; text-align: center;">
                      <p style="margin: 0; color: #1565c0; font-size: 17px; line-height: 1.5; font-weight: 600;">
                        Harmex создан именно для такой модели
                      </p>
                    </div>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #FF5E34; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(255, 94, 52, 0.35);">
                            Войти в личный кабинет
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
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #1565c0; text-decoration: underline;">здесь</a>.
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
    subject: "Глубокая аналитика продвижения",
    html: `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Глубокая аналитика продвижения</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; max-width: 600px;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #FF5E34; padding: 20px 40px; text-align: center;">
                    <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 30px 40px 0; text-align: center;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                      Глубокая аналитика продвижения
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Здравствуйте!
                    </p>
                    
                    <p style="margin: 0 0 30px; color: #333333; font-size: 17px; line-height: 1.6; font-weight: 600;">
                      Harmex даёт вам полный контроль над продвижением.
                    </p>
                    
                    <div style="background-color: #f8f9fa; padding: 24px; margin: 24px 0; border-radius: 8px; border: 1px solid #e9ecef;">
                      <p style="margin: 0 0 16px; color: #333333; font-size: 16px; line-height: 1.4; font-weight: 600;">
                        📊 В каждом выполненном действии вы увидите:
                      </p>
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
                    
                    <div style="background: linear-gradient(135deg, #e3f2fd 0%, #e8eaf6 100%); border: 2px solid #5e35b1; padding: 24px; margin: 30px 0; border-radius: 8px;">
                      <p style="margin: 0; color: #4527a0; font-size: 17px; line-height: 1.6; text-align: center; font-weight: 600;">
                        💡 Такой уровень аналитики позволяет принимать решения,<br>
                        основанные на данных, а не догадках
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Прозрачность работы — это то, что отличает профессиональные инструменты от остальных.
                    </p>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #FF5E34; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(255, 94, 52, 0.35);">
                            Войти в личный кабинет
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
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #1565c0; text-decoration: underline;">здесь</a>.
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
    subject: "Почему важна регулярность",
    html: `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Почему важна регулярность</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; max-width: 600px;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #FF5E34; padding: 20px 40px; text-align: center;">
                    <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 30px 40px 0; text-align: center;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                      Почему важна регулярность
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Здравствуйте!
                    </p>
                    
                    <div style="background: linear-gradient(135deg, #e8eaf6 0%, #e3f2fd 100%); border: 2px solid #5e35b1; padding: 24px; margin: 24px 0; border-radius: 8px; text-align: center;">
                      <p style="margin: 0; color: #4527a0; font-size: 18px; line-height: 1.5; font-weight: 600;">
                        🔄 Алгоритмы любят последовательность
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Если ваши задачи идут регулярно, маркетплейс фиксирует стабильную активность вокруг товара и поднимает карточку выше в поисковой выдаче.
                    </p>
                    
                    <div style="background-color: #ffebee; border-left: 4px solid #f44336; padding: 20px; margin: 30px 0; border-radius: 4px;">
                      <p style="margin: 0; color: #c62828; font-size: 16px; line-height: 1.6;">
                        ❌ Разовые всплески не работают — они дают короткий эффект, но не формируют историю.
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      <strong>Регулярность — это основа долгой игры.</strong>
                    </p>
                    
                    <div style="background-color: #f8f9fa; padding: 24px; margin: 24px 0; border-radius: 8px; border: 1px solid #e9ecef;">
                      <p style="margin: 0 0 12px; color: #333333; font-size: 16px; line-height: 1.4; font-weight: 600;">
                        ✅ Регулярность создаёт:
                      </p>
                      <ul style="margin: 0; padding-left: 20px; color: #495057; font-size: 15px; line-height: 1.8;">
                        <li>Органический рост</li>
                        <li>Увеличение CTR</li>
                        <li>Повышение вероятности получения отзывов</li>
                        <li>Лучший ROI в перспективе месяца и квартала</li>
                      </ul>
                    </div>
                    
                    <div style="background-color: #e8f5e9; border: 2px solid #4caf50; padding: 24px; margin: 30px 0; border-radius: 8px; text-align: center;">
                      <p style="margin: 0; color: #2e7d32; font-size: 18px; line-height: 1.5; font-weight: 600;">
                        💪 Стратегия «понемногу, но стабильно»<br>всегда побеждает хаотичные попытки
                      </p>
                    </div>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #FF5E34; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(255, 94, 52, 0.35);">
                            Войти в личный кабинет
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
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #1565c0; text-decoration: underline;">здесь</a>.
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
    subject: "Работа с отзывами и рейтингом",
    html: `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Работа с отзывами и рейтингом</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; max-width: 600px;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #FF5E34; padding: 20px 40px; text-align: center;">
                    <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 30px 40px 0; text-align: center;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                      Работа с отзывами и рейтингом
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Здравствуйте!
                    </p>
                    
                    <div style="background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); border: 2px solid #ff9800; padding: 24px; margin: 24px 0; border-radius: 8px;">
                      <p style="margin: 0; color: #e65100; font-size: 17px; line-height: 1.5; font-weight: 600; text-align: center;">
                        ⭐ Отзывы — второй по силе фактор,<br>который влияет на рост карточки
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Даже идеально выполненные выкупы не спасут товар с низким рейтингом или слабой визуализацией.
                    </p>
                    
                    <div style="background-color: #e3f2fd; padding: 24px; margin: 24px 0; border-radius: 8px; border-left: 4px solid #2196f3;">
                      <p style="margin: 0 0 12px; color: #0d47a1; font-size: 16px; line-height: 1.4; font-weight: 600;">
                        ✅ Убедитесь, что карточка упакована профессионально:
                      </p>
                      <ul style="margin: 0; padding-left: 20px; color: #1565c0; font-size: 15px; line-height: 1.8;">
                        <li>Качественные фото</li>
                        <li>Корректное описание</li>
                        <li>Отсутствие брака</li>
                      </ul>
                    </div>
                    
                    <div style="background-color: #ffebee; border: 2px solid #f44336; padding: 24px; margin: 30px 0; border-radius: 8px;">
                      <p style="margin: 0 0 16px; color: #c62828; font-size: 17px; line-height: 1.5; font-weight: 600; text-align: center;">
                        ⚠️ Помните: <span style="font-size: 24px;">80%</span> падений в выдаче<br>происходят из-за негативных отзывов
                      </p>
                      <p style="margin: 0; color: #d32f2f; font-size: 15px; line-height: 1.6; text-align: center;">
                        Иногда один плохой комментарий с фото может перечеркнуть месяц продвижения
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Поэтому важно работать с <strong>качеством товара и опытом покупателей</strong>.
                    </p>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #FF5E34; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(255, 94, 52, 0.35);">
                            Войти в личный кабинет
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
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #1565c0; text-decoration: underline;">здесь</a>.
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
    subject: 'Что делать, если выкуп "завис"',
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
                  <td style="background-color: #FF5E34; padding: 20px 40px; text-align: center;">
                    <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 30px 40px 0; text-align: center;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                      Что делать, если выкуп "завис"
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Здравствуйте!
                    </p>
                    
                    <div style="background-color: #e8f5e9; border: 2px solid #4caf50; padding: 24px; margin: 24px 0; border-radius: 8px; text-align: center;">
                      <p style="margin: 0; color: #2e7d32; font-size: 18px; line-height: 1.5; font-weight: 600;">
                        ✅ Если вы видите, что выкуп не начался сразу —<br>это нормально
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      На запуск могут влиять множество факторов:
                    </p>
                    
                    <div style="background-color: #f8f9fa; padding: 24px; margin: 24px 0; border-radius: 8px; border: 1px solid #e9ecef;">
                      <ul style="margin: 0; padding-left: 20px; color: #495057; font-size: 15px; line-height: 1.8;">
                        <li>Низкая активность покупателей в конкретном регионе</li>
                        <li>Ограничения маркетплейса</li>
                        <li>Лимиты по товару</li>
                        <li>Ночное время</li>
                        <li>Резкая смена спроса</li>
                      </ul>
                    </div>
                    
                    <p style="margin: 0 0 24px; color: #333333; font-size: 16px; line-height: 1.6;">
                      <strong>100500 причин</strong> может влиять, не переживайте в такие момент временных трудностей — всё решится.
                    </p>
                    
                    <div style="background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; margin: 30px 0; border-radius: 4px;">
                      <p style="margin: 0; color: #1565c0; font-size: 16px; line-height: 1.6;">
                        💡 <strong>Harmex</strong> выстраивает естественный, безопасный темп выполнения задач.
                      </p>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); border: 2px solid #ff9800; padding: 24px; margin: 30px 0; border-radius: 8px; text-align: center;">
                      <p style="margin: 0; color: #e65100; font-size: 18px; line-height: 1.5; font-weight: 600;">
                        ⏱️ Подождите 3–4 часа —<br>и процесс стабилизируется
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Система автоматически распределяет задания среди исполнителей так, чтобы продвижение выглядело максимально органично и безопасно.
                    </p>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #FF5E34; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(255, 94, 52, 0.35);">
                            Войти в личный кабинет
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
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #1565c0; text-decoration: underline;">здесь</a>.
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
    subject: "Как работать с несколькими магазинами",
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
                  <td style="background-color: #FF5E34; padding: 20px 40px; text-align: center;">
                    <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 30px 40px 0; text-align: center;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                      Как работать с несколькими магазинами
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
                      Если вы управляете несколькими магазинами или ведёте клиентов, <strong>Harmex</strong> полностью поддерживает эту модель.
                    </p>
                    
                    <!-- Option 1 -->
                    <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding: 24px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #4caf50;">
                      <p style="margin: 0 0 12px; color: #2e7d32; font-size: 17px; line-height: 1.4; font-weight: 600;">
                        🏪 Один кабинет
                      </p>
                      <p style="margin: 0; color: #388e3c; font-size: 15px; line-height: 1.6;">
                        Вы можете работать в одном кабинете, если процессы общие и контролируются вами.
                      </p>
                    </div>
                    
                    <!-- Option 2 -->
                    <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); padding: 24px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #2196f3;">
                      <p style="margin: 0 0 12px; color: #1565c0; font-size: 17px; line-height: 1.4; font-weight: 600;">
                        🏬 Несколько кабинетов
                      </p>
                      <p style="margin: 0; color: #1976d2; font-size: 15px; line-height: 1.6;">
                        Если магазины принадлежат разным владельцам — рекомендуется разделять кабинеты, чтобы избежать путаницы и ошибок в заказах.
                      </p>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 24px; margin: 30px 0; border-radius: 8px; border: 1px solid #e9ecef;">
                      <p style="margin: 0 0 16px; color: #333333; font-size: 16px; line-height: 1.4; font-weight: 600;">
                        ⚙️ В системе есть:
                      </p>
                      <ul style="margin: 0; padding-left: 20px; color: #495057; font-size: 15px; line-height: 1.8;">
                        <li>Распределение ролей</li>
                        <li>Управление доступами</li>
                        <li>Отчёты по каждому магазину</li>
                      </ul>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%); border: 2px solid #5e35b1; padding: 24px; margin: 30px 0; border-radius: 8px; text-align: center;">
                      <p style="margin: 0; color: #4527a0; font-size: 17px; line-height: 1.5; font-weight: 600;">
                        💼 Удобная инфраструктура для менеджеров<br>и агентств, которые ведут 5–20 кабинетов
                      </p>
                    </div>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #FF5E34; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(255, 94, 52, 0.35);">
                            Войти в личный кабинет
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
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #1565c0; text-decoration: underline;">здесь</a>.
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
    subject: "Партнёрская программа",
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
                  <td style="background-color: #FF5E34; padding: 20px 40px; text-align: center;">
                    <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 30px 40px 0; text-align: center;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                      Партнёрская программа
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Здравствуйте!
                    </p>
                    
                    <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border: 2px solid #4caf50; padding: 24px; margin: 24px 0; border-radius: 8px; text-align: center;">
                      <p style="margin: 0; color: #2e7d32; font-size: 18px; line-height: 1.5; font-weight: 600;">
                        🤝 Менеджерам, агентствам и специалистам<br>мы предлагаем партнёрскую программу
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Если вы приводите клиентов, каждая их услуга приносит вам <strong>стабильный процент</strong>.
                    </p>
                    
                    <div style="background-color: #e3f2fd; padding: 24px; margin: 24px 0; border-radius: 8px; border-left: 4px solid #2196f3;">
                      <p style="margin: 0 0 16px; color: #1565c0; font-size: 17px; line-height: 1.4; font-weight: 600;">
                        💰 Это не разовая история:
                      </p>
                      <p style="margin: 0; color: #1976d2; font-size: 16px; line-height: 1.6;">
                        Вы получаете выплаты постоянно, пока клиент работает в системе.
                      </p>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 24px; margin: 24px 0; border-radius: 8px; border: 1px solid #e9ecef;">
                      <p style="margin: 0 0 16px; color: #333333; font-size: 16px; line-height: 1.4; font-weight: 600;">
                        ✅ Для кого это выгодно:
                      </p>
                      <ul style="margin: 0; padding-left: 20px; color: #495057; font-size: 15px; line-height: 1.8;">
                        <li><strong>Для агентств</strong> — отдельный источник дохода</li>
                        <li><strong>Для менеджеров</strong> — возможность монетизировать опыт и контакты</li>
                      </ul>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); border: 2px solid #ff9800; padding: 24px; margin: 30px 0; border-radius: 8px; text-align: center;">
                      <p style="margin: 0; color: #e65100; font-size: 17px; line-height: 1.5; font-weight: 600;">
                        📈 Harmex выгоден не только как инструмент продвижения,<br>но и как точка роста вашего бизнеса
                      </p>
                    </div>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #FF5E34; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(255, 94, 52, 0.35);">
                            Войти в личный кабинет
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
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #1565c0; text-decoration: underline;">здесь</a>.
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
    subject: "Как увеличить объём продаж x2",
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
                  <td style="background-color: #FF5E34; padding: 20px 40px; text-align: center;">
                    <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 30px 40px 0; text-align: center;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                      Как увеличить объём продаж x2
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 24px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Здравствуйте!
                    </p>
                    
                    <p style="margin: 0 0 24px; color: #333333; font-size: 17px; line-height: 1.6; font-weight: 600;">
                      Рост продаж — это всегда комбинация из четырёх факторов:
                    </p>
                    
                    <!-- Factor 1 -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
                      <tr>
                        <td style="width: 40px; vertical-align: top; padding-top: 2px;">
                          <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); border-radius: 50%; color: #ffffff; font-weight: 700; font-size: 16px; text-align: center; line-height: 32px;">
                            1
                          </div>
                        </td>
                        <td style="padding-left: 16px;">
                          <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">
                            Качественный визуал карточки
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Factor 2 -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
                      <tr>
                        <td style="width: 40px; vertical-align: top; padding-top: 2px;">
                          <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); border-radius: 50%; color: #ffffff; font-weight: 700; font-size: 16px; text-align: center; line-height: 32px;">
                            2
                          </div>
                        </td>
                        <td style="padding-left: 16px;">
                          <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">
                            Регулярные и естественные выкупы
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Factor 3 -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
                      <tr>
                        <td style="width: 40px; vertical-align: top; padding-top: 2px;">
                          <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); border-radius: 50%; color: #ffffff; font-weight: 700; font-size: 16px; text-align: center; line-height: 32px;">
                            3
                          </div>
                        </td>
                        <td style="padding-left: 16px;">
                          <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">
                            Корректировка SEO и ключевых запросов
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Factor 4 -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                      <tr>
                        <td style="width: 40px; vertical-align: top; padding-top: 2px;">
                          <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%); border-radius: 50%; color: #ffffff; font-weight: 700; font-size: 16px; text-align: center; line-height: 32px;">
                            4
                          </div>
                        </td>
                        <td style="padding-left: 16px;">
                          <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">
                            Системная работа с отзывами
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border: 2px solid #2196f3; padding: 24px; margin: 30px 0; border-radius: 8px;">
                      <p style="margin: 0 0 12px; color: #1565c0; font-size: 17px; line-height: 1.5; font-weight: 600;">
                        ❄️ Эффект «снежного кома»:
                      </p>
                      <p style="margin: 0; color: #1976d2; font-size: 16px; line-height: 1.6;">
                        Позиции растут → органика увеличивается → отзывы множатся → карточка становится более привлекательной для маркетплейса
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6; text-align: center; background-color: #f8f9fa; padding: 20px; border-radius: 8px; font-weight: 600;">
                      ✅ Эта формула проверена сотнями магазинов —<br>применяйте её последовательно
                    </p>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #FF5E34; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(255, 94, 52, 0.35);">
                            Войти в личный кабинет
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
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #1565c0; text-decoration: underline;">здесь</a>.
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
    subject: "Как выйти в ТОП выдачи",
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
                  <td style="background-color: #FF5E34; padding: 20px 40px; text-align: center;">
                    <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 30px 40px 0; text-align: center;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                      Как выйти в ТОП выдачи
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Здравствуйте!
                    </p>
                    
                    <div style="background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); border: 2px solid #ff9800; padding: 24px; margin: 24px 0; border-radius: 8px; text-align: center;">
                      <p style="margin: 0; color: #e65100; font-size: 18px; line-height: 1.5; font-weight: 600;">
                        🏆 Выход в ТОП — это не удача<br>и не "везение" карточки
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 24px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Это результат управления четырьмя ключевыми метриками:
                    </p>
                    
                    <div style="background-color: #f8f9fa; padding: 24px; margin: 24px 0; border-radius: 8px; border: 1px solid #e9ecef;">
                      <ul style="margin: 0; padding-left: 20px; color: #495057; font-size: 15px; line-height: 1.8;">
                        <li><strong>Динамика продаж</strong></li>
                        <li><strong>Частота безопасных выкупов</strong></li>
                        <li><strong>Рост отзывов</strong></li>
                        <li><strong>Качество магазина</strong> (рейтинг, показатели по доставке, возвратам, упаковке)</li>
                      </ul>
                    </div>
                    
                    <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 20px; margin: 30px 0; border-radius: 4px;">
                      <p style="margin: 0; color: #2e7d32; font-size: 16px; line-height: 1.6;">
                        ✅ <strong>Harmex</strong> помогает воздействовать на каждый из этих факторов одновременно.
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Когда вы регулярно двигаете карточку, алгоритм видит стабильный спрос и начинает поднимать товар в выдаче естественным способом.
                    </p>
                    
                    <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border: 2px solid #2196f3; padding: 24px; margin: 30px 0; border-radius: 8px; text-align: center;">
                      <p style="margin: 0; color: #1565c0; font-size: 17px; line-height: 1.5; font-weight: 600;">
                        🎯 Важна не разовая активность, а ритм —<br>тот самый темп, который создаёт устойчивый рост
                      </p>
                    </div>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #FF5E34; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(255, 94, 52, 0.35);">
                            Войти в личный кабинет
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
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #1565c0; text-decoration: underline;">здесь</a>.
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
                  <td style="background-color: #FF5E34; padding: 20px 40px; text-align: center;">
                    <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 30px 40px 0; text-align: center;">
                    <h1 style="margin: 0; color: #1a1a1a; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; line-height: 1.3;">
                      Почему 50% клиентов выходят<br>на повторные пополнения
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Здравствуйте!
                    </p>
                    
                    <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border: 2px solid #4caf50; padding: 24px; margin: 24px 0; border-radius: 8px; text-align: center;">
                      <p style="margin: 0 0 8px; color: #2e7d32; font-size: 42px; line-height: 1; font-weight: 700;">
                        50%
                      </p>
                      <p style="margin: 0; color: #388e3c; font-size: 17px; line-height: 1.4; font-weight: 600;">
                        Каждый второй пользователь регулярно<br>возвращается к новым задачам
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 24px; color: #333333; font-size: 17px; line-height: 1.6; font-weight: 600; text-align: center;">
                      Причина проста: Harmex даёт предсказуемый результат
                    </p>
                    
                    <div style="background-color: #f8f9fa; padding: 24px; margin: 24px 0; border-radius: 8px; border: 1px solid #e9ecef;">
                      <p style="margin: 0 0 16px; color: #333333; font-size: 16px; line-height: 1.4; font-weight: 600;">
                        ✅ Вы видите:
                      </p>
                      <ul style="margin: 0; padding-left: 20px; color: #495057; font-size: 15px; line-height: 1.8;">
                        <li>Отчёты по каждому действию</li>
                        <li>Как распределяются задачи</li>
                        <li>Движение карточки</li>
                        <li>Фиксированный эффект от регулярного темпа</li>
                      </ul>
                    </div>
                    
                    <div style="background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; margin: 30px 0; border-radius: 4px;">
                      <p style="margin: 0 0 12px; color: #1565c0; font-size: 16px; line-height: 1.6;">
                        <strong>Не нужно вручную:</strong>
                      </p>
                      <ul style="margin: 0; padding-left: 20px; color: #1976d2; font-size: 15px; line-height: 1.8;">
                        <li>Координировать исполнителей</li>
                        <li>Искать трафик</li>
                        <li>Решать проблемы со скоростью</li>
                      </ul>
                      <p style="margin: 16px 0 0; color: #1565c0; font-size: 16px; line-height: 1.6; font-weight: 600;">
                        Всё автоматизировано
                      </p>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%); border: 2px solid #5e35b1; padding: 24px; margin: 30px 0; border-radius: 8px; text-align: center;">
                      <p style="margin: 0; color: #4527a0; font-size: 17px; line-height: 1.5; font-weight: 600;">
                        🔐 Когда система даёт порядок и прозрачность,<br>появляется ощущение опоры.<br><br>Поэтому клиенты возвращаются.
                      </p>
                    </div>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #FF5E34; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(255, 94, 52, 0.35);">
                            Войти в личный кабинет
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
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #1565c0; text-decoration: underline;">здесь</a>.
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
    subject: "Как масштабировать магазин",
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
                  <td style="background-color: #FF5E34; padding: 20px 40px; text-align: center;">
                    <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
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
                      Здравствуйте!
                    </p>
                    
                    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 24px 0; border-radius: 4px;">
                      <p style="margin: 0; color: #856404; font-size: 16px; line-height: 1.6;">
                        ⚠️ Когда карточка закрепилась в ТОП-позициях, продавцы часто делают <strong>ошибку — прекращают работать с продвижением</strong>. Но именно здесь начинается момент масштабирования.
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 24px; color: #333333; font-size: 17px; line-height: 1.6; font-weight: 600;">
                      📈 Вы можете:
                    </p>
                    
                    <div style="background-color: #f8f9fa; padding: 24px; margin: 24px 0; border-radius: 8px; border: 1px solid #e9ecef;">
                      <ul style="margin: 0; padding-left: 20px; color: #495057; font-size: 15px; line-height: 1.8;">
                        <li>Заходить в новые ниши</li>
                        <li>Запускать дополнительные артикулы</li>
                        <li>Усиливать линейку</li>
                        <li>Создавать вариации товаров</li>
                        <li>Открывать новые магазины</li>
                      </ul>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border: 2px solid #4caf50; padding: 24px; margin: 30px 0; border-radius: 8px; text-align: center;">
                      <p style="margin: 0; color: #2e7d32; font-size: 17px; line-height: 1.5; font-weight: 600;">
                        🚀 Harmex поддерживает любое направление:<br>вы можете вести <strong>1 магазин или 20</strong> —<br>система адаптируется под масштаб
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 30px; color: #333333; font-size: 17px; line-height: 1.6; text-align: center; background-color: #e3f2fd; padding: 20px; border-radius: 8px; font-weight: 600;">
                      💡 Рост — это стратегия, а не случайность.<br>И у вас уже есть инструмент, который этот рост поддерживает.
                    </p>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #FF5E34; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(255, 94, 52, 0.35);">
                            Войти в личный кабинет
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
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #1565c0; text-decoration: underline;">здесь</a>.
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
                  <td style="background-color: #FF5E34; padding: 20px 40px; text-align: center;">
                    <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
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
                    <p style="margin: 0 0 24px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Здравствуйте!
                    </p>
                    
                    <p style="margin: 0 0 24px; color: #333333; font-size: 17px; line-height: 1.6; font-weight: 600;">
                      💪 Сильные продавцы всегда держат под контролем правильные показатели.
                    </p>
                    
                    <div style="background-color: #f8f9fa; padding: 24px; margin: 24px 0; border-radius: 8px; border-left: 4px solid #FF5E34;">
                      <p style="margin: 0 0 16px; color: #333333; font-size: 16px; line-height: 1.4; font-weight: 600;">
                        📊 В Harmex вы можете отслеживать:
                      </p>
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
                      Эти метрики — <strong>основа грамотной стратегии</strong>.
                    </p>
                    
                    <div style="background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; margin: 30px 0; border-radius: 4px;">
                      <p style="margin: 0 0 12px; color: #1565c0; font-size: 16px; line-height: 1.6; font-weight: 600;">
                        ✅ Они помогают избежать:
                      </p>
                      <ul style="margin: 0; padding-left: 20px; color: #1976d2; font-size: 15px; line-height: 1.8;">
                        <li>Слепых зон</li>
                        <li>Перерасхода бюджета</li>
                        <li>Неправильных гипотез</li>
                        <li>Бессистемных действий</li>
                      </ul>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border: 2px solid #4caf50; padding: 24px; margin: 30px 0; border-radius: 8px; text-align: center;">
                      <p style="margin: 0; color: #2e7d32; font-size: 17px; line-height: 1.5; font-weight: 600;">
                        📈 Когда продавец ориентируется на цифры,<br>а не на эмоции — результат становится<br>стабильным и прогнозируемым
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 30px; color: #333333; font-size: 17px; line-height: 1.6; text-align: center; font-weight: 600;">
                      Формируйте свой подход как у профессионалов.
                    </p>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #FF5E34; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(255, 94, 52, 0.35);">
                            Войти в личный кабинет
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
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #1565c0; text-decoration: underline;">здесь</a>.
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
                  <td style="background-color: #FF5E34; padding: 20px 40px; text-align: center;">
                    <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
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
                      Здравствуйте!
                    </p>
                    
                    <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                      Чтобы закрепиться в выдаче и создать прогнозируемый рост, придерживайтесь следующего плана:
                    </p>
                    
                    <!-- Step 1 -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                      <tr>
                        <td style="width: 40px; vertical-align: top; padding-top: 2px;">
                          <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); border-radius: 50%; color: #ffffff; font-weight: 700; font-size: 18px; text-align: center; line-height: 36px;">
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
                          <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); border-radius: 50%; color: #ffffff; font-weight: 700; font-size: 18px; text-align: center; line-height: 36px;">
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
                          <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); border-radius: 50%; color: #ffffff; font-weight: 700; font-size: 18px; text-align: center; line-height: 36px;">
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
                          <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%); border-radius: 50%; color: #ffffff; font-weight: 700; font-size: 18px; text-align: center; line-height: 36px;">
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
                          <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); border-radius: 50%; color: #ffffff; font-weight: 700; font-size: 18px; text-align: center; line-height: 36px;">
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
                    
                    <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border: 2px solid #4caf50; padding: 24px; margin: 30px 0; border-radius: 8px; text-align: center;">
                      <p style="margin: 0; color: #2e7d32; font-size: 17px; line-height: 1.5; font-weight: 600;">
                        ✅ Этот план — фундамент, который используют<br>все сильные продавцы.<br><br>Он подходит и новичку, и магазину с объёмом в миллионы.
                      </p>
                    </div>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #FF5E34; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(255, 94, 52, 0.35);">
                            Войти в личный кабинет
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
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #1565c0; text-decoration: underline;">здесь</a>.
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
                  <td style="background-color: #FF5E34; padding: 20px 40px; text-align: center;">
                    <span style="font-size: 24px; font-weight: 900; color: #1a1a1a; letter-spacing: 4px; font-family: Arial, Helvetica, sans-serif;">HARMEX</span>
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
                    
                    <div style="background: linear-gradient(135deg, #fff9c4 0%, #fff59d 100%); border: 3px solid #fbc02d; padding: 28px; margin: 24px 0; border-radius: 12px; text-align: center;">
                      <p style="margin: 0 0 12px; color: #f57f17; font-size: 28px; line-height: 1.2; font-weight: 700;">
                        🎉 Поздравляем!
                      </p>
                      <p style="margin: 0; color: #f57f17; font-size: 17px; line-height: 1.5; font-weight: 600;">
                        Вы прошли всю цепочку, разобрались в механиках<br>работы Harmex и теперь управляете продвижением<br>как профессионал
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 24px; color: #333333; font-size: 17px; line-height: 1.6; font-weight: 600;">
                      Если вы хотите <strong>ускориться, масштабироваться</strong> или получить стратегию под ваш товар — наш менеджер готов подключиться.
                    </p>
                    
                    <div style="background-color: #e8f5e9; padding: 24px; margin: 24px 0; border-radius: 8px; border-left: 4px solid #4caf50;">
                      <p style="margin: 0 0 16px; color: #2e7d32; font-size: 16px; line-height: 1.4; font-weight: 600;">
                        🎯 Мы можем помочь вам:
                      </p>
                      <ul style="margin: 0; padding-left: 20px; color: #388e3c; font-size: 15px; line-height: 1.8;">
                        <li>Создать <strong>индивидуальный план</strong></li>
                        <li>Подсказать <strong>оптимальный темп задач</strong></li>
                        <li>Рассчитать <strong>бюджеты</strong></li>
                        <li>Подготовить <strong>стратегию выхода в ТОП</strong></li>
                      </ul>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border: 2px solid #2196f3; padding: 28px; margin: 30px 0; border-radius: 8px; text-align: center;">
                      <p style="margin: 0; color: #1565c0; font-size: 19px; line-height: 1.5; font-weight: 700;">
                        🚀 Ваш рост — это наша зона ответственности.<br><br>Давайте усилим его вместе!
                      </p>
                    </div>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="https://app.harmex.ru/api/emailsSent?username={{username}}&numberOfEmail={{emailNumber}}" style="display: inline-block; background-color: #FF5E34; color: #ffffff; text-decoration: none; padding: 18px 48px; border-radius: 8px; font-size: 17px; font-weight: 700; box-shadow: 0 6px 16px rgba(255, 94, 52, 0.4);">
                            🎯 Войти в личный кабинет
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 30px 0 0; color: #666666; font-size: 15px; line-height: 1.6; text-align: center; font-style: italic;">
                      Спасибо, что выбрали Harmex для роста вашего бизнеса! 💙
                    </p>
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
                            Если Вы хотите отказаться от получения, нажмите <a href="https://app.harmex.ru/api/unsubscribeEmail?username={{username}}" target="_blank" style="color: #1565c0; text-decoration: underline;">здесь</a>.
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
