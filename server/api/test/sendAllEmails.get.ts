import mailService from '~/server/lib/mailService'
import { emailTemplates } from '~/server/lib/emailTemplates'

const DELAY_MS = 4000 // 4 секунды между письмами
const TO = 'mr_flane@mail.ru'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export default eventHandler(async (event) => {
  const results: { index: number; subject: string; status: string; error?: string }[] = []

  for (let i = 0; i < emailTemplates.length; i++) {
    const template = emailTemplates[i]
    try {
      await mailService.sendAutoEmail(TO, template.subject, template.html)
      results.push({ index: i + 1, subject: template.subject, status: 'sent' })
      console.log(`[sendAllEmails] ${i + 1}/${emailTemplates.length} — "${template.subject}" ✓`)
    } catch (err: any) {
      results.push({ index: i + 1, subject: template.subject, status: 'error', error: err?.message })
      console.error(`[sendAllEmails] ${i + 1}/${emailTemplates.length} — "${template.subject}" ✗`, err?.message)
    }

    if (i < emailTemplates.length - 1) {
      await sleep(DELAY_MS)
    }
  }

  const sent = results.filter(r => r.status === 'sent').length
  const failed = results.filter(r => r.status === 'error').length

  return {
    ok: true,
    total: emailTemplates.length,
    sent,
    failed,
    results,
  }
})
