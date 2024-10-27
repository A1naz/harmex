import * as fs from 'node:fs'
import { Buyout } from '@/server/lib/models/avito/Buyout'
import { User } from '@/server/lib/models/User'
import { DocuemntEnum } from '~/data/enums'

export default eventHandler(async (event) => {
  const session = (await getAdminEntity(event)) as any
  if (!session)
    return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const body = await readBody(event)

  const found = await Buyout.findOne({ uuid: body.uuid })
  if (!found) {
    throw createError({
      statusCode: 400,
      message: 'Выкуп не найден',
    })
  }

  const cached = fs.readFileSync('pvz/avitoPoints.json', 'utf8')
  const parsed = JSON.parse(cached)

  // eslint-disable-next-line eqeqeq
  const isPVZExist = parsed.points.findIndex((el: any) => el.id == found.pointId)

  if (isPVZExist === -1) {
    throw createError({
      statusCode: 400,
      message: 'ПВЗ недоступно',
    })
  }

  found.status = 'active'
  await found.save()

  await userLog(event, {
    documentType: DocuemntEnum.Buyout,
    documentId: found.uuid,
    comment: 'убран из архива',
  })

  return {
    status: 'ok',
  }
})
