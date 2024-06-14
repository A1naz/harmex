import MailService from '~~/server/lib/mailService.js'

export default eventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = JSON.parse(body)

  try {
    await MailService.sendConsultation(parsed.name, parsed.email, parsed.phone)
  } catch (error) {
    return { status: 'error', error: 'Ошибка отправки письма.' }
  }

  return { status: 'ok' }
})
