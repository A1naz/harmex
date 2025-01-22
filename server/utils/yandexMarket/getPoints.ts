import fs from 'node:fs'
import { createYandexMarketPickpointsFile } from '~/server/utils/pickpoints'

export default async function () {
  if (!fs.existsSync('pvz/yandexMarketPoints.json')) {
    await createYandexMarketPickpointsFile()
  }

  const cached = fs.readFileSync('pvz/yandexMarketPoints.json', 'utf8')
  const parsed = JSON.parse(cached)
  return {
    points: parsed.points,
  }
}
