import fs from 'node:fs'
import { PVZ } from '~/server/lib/models/wildberries/PVZ'

export default eventHandler(async (event) => {
  const session = (await getAdminEntity(event)) as any

  if (!session)
    return sendRedirect(event, '/auth', 302)
  if (fs.existsSync('pvz/wildberriesPoints.json')) {

    const cached = fs.readFileSync('pvz/wildberriesPoints.json', 'utf8')
    const parsed = JSON.parse(cached)

    const now = new Date()
    const diff = now.getTime() - new Date(parsed.updated).getTime()
    if (diff < 1000 * 60 * 60) {
      return sendStream(event, fs.createReadStream('pvz/wildberriesPoints.json'))
    }
  }

  const points: any = await PVZ.find()

  const cache = {
    updated: new Date(),
    points: points,
  }

  fs.writeFileSync('pvz/wildberriesPoints.json', JSON.stringify(cache))
  return sendStream(event, fs.createReadStream('pvz/wildberriesPoints.json'))
})
