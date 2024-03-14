import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { Buyout } from '@/server/lib/models/wildberries/Buyout'
import { DocuemntEnum } from '~/data/enums'
import * as fs from 'fs'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user) return sendRedirect(event, '/auth', 302)

  const body = await readBody(event)

  const found = await Buyout.findOne({ uuid: body.uuid })
  if (!found) {
    throw createError({
      statusCode: 400,
      message: 'Выкуп не найден',
    })
  }
  found.status = 'active'
  await found.save()

  const cached = fs.readFileSync('pvz/wildberriesPoints.json', 'utf8')
  const parsed = JSON.parse(cached)

  const isPVZExist = parsed.points.findIndex((el: any) => el.a == found.point)

  if (isPVZExist == -1) {
    throw createError({
      statusCode: 400,
      message: 'ПВЗ недоступно',
    })
  }

  await userLog(event, {
    documentType: DocuemntEnum.Buyout,
    documentId: found.uuid,
    comment: 'убран из архива',
  })

  return {
    status: 'ok',
  }
})
