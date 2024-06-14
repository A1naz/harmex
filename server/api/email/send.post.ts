import MailService from '~~/server/lib/mailService.js'

export default eventHandler(async (event) => {
  const body = await readBody(event)

  try {
    await MailService.sendConsultation(body.name, body.email, body.phone)
  } catch (error) {
    return { status: 'error', error: 'Ошибка отправки письма.' }
  }

  return { status: 'ok' }
})
