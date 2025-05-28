import { User } from '@/server/lib/models/User'
import { Buyout } from '@/server/lib/models/avito/Buyout'
import { DocuemntEnum } from '~/data/enums'
import * as fs from 'fs'

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const body = await readBody(event)

  const found = await Buyout.findOne({ uuid: body.uuid })
  if (!found) {
    throw createError({
      statusCode: 400,
      message: 'Выкуп не найден',
    })
  }

    const balanceIsExist = await checkBalance(
    user,
    [{ ...found, price: parseFloat(found.product.price) }],
    "buyouts",
    "avito"
  );
  if (!balanceIsExist) {
    throw createError({
      statusCode: 400,
      message: "Недостаточно средств",
    });
  }

  const cached = fs.readFileSync('pvz/avitoPoints.json', 'utf8')
  const parsed = JSON.parse(cached)
  

  const isPVZExist = parsed.points.findIndex((el: any) => el.id == found.pointId)

  if (isPVZExist == -1) {
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
