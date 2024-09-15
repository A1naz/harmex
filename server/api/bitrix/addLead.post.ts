import MailService from '~~/server/lib/mailService.js'

export default eventHandler(async (event) => {
  const body = await readBody(event)
  //   const parsed = JSON.parse(body)

  const parsed = JSON.parse(body)

  if (!parsed.fields.NAME || (!parsed.fields.EMAIL[0].VALUE && !parsed.fields.PHONE[0].VALUE)) {

    return { status: 'error', error: 'Не указано имя' }
  }

  try {
    await $fetch(
      'https://marketmonstr.bitrix24.ru/rest/917/rr5uw4nvug90xsxc/crm.lead.add.json',
      {
        method: 'POST',
        body: parsed,
      }
    )
  } catch (error) {

    return { status: 'error', error: 'Ошибка отправки письма.' }
  }

  return { status: 'ok' }
})
