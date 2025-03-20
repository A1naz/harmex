import fs from 'node:fs'
import { PVZ } from '~/server/lib/models/yandexMarket/PVZ'

export default eventHandler(async (event) => {
  const session = (await getAdminEntity(event)) as any

  if (!session)
    return sendRedirect(event, '/auth', 302)
  if (fs.existsSync('pvz/yandexMarketPoints.json')) {
    const cached = fs.readFileSync('pvz/yandexMarketPoints.json', 'utf8')
    const parsed = JSON.parse(cached)

    const now = new Date()
    const diff = now.getTime() - new Date(parsed.updated).getTime()
    if (diff < 1000 * 60 * 60) {
      return sendStream(event, fs.createReadStream('pvz/yandexMarketPoints.json'))
    }
  }

  const points: any = await PVZ.find()

  const collection = points.map((point: any) => {
    return {
      id: point.pointId,
      lt: point.coordinates.lat,
      lg: point.coordinates.lon,
    }
  })

  console.log(collection)
  const cache = {
    updated: new Date(),
    points: collection,
  }
  fs.writeFileSync('pvz/yandexMarketPoints.json', JSON.stringify(cache))
  return sendStream(event, fs.createReadStream('pvz/yandexMarketPoints.json'))
})
