import mailService from '~/server/lib/mailService'
import { emailTemplates, generateEmailHtml } from '~/server/lib/emailTemplates'

export default eventHandler(async (event) => {
  const { n } = getQuery(event)
  const index = parseInt(String(n)) - 1

  if (isNaN(index) || index < 0 || index >= emailTemplates.length) {
    throw createError({
      statusCode: 400,
      message: `Укажите параметр n от 1 до ${emailTemplates.length}`,
    })
  }

  const template = emailTemplates[index]
  const html = generateEmailHtml(template, 'test-user', index + 1)

  await mailService.sendAutoEmail('mr_flane@mail.ru', template.subject, html)

  return { ok: true, message: `Письмо #${index + 1} «${template.subject}» отправлено на mr_flane@mail.ru` }
})
