import fs from 'node:fs'
import { getCityByGeo } from '~/server/utils/geo'

export default function () {
  const cached = fs.readFileSync('points.json', 'utf8')
  const parsed = JSON.parse(cached)
  return {
    points: parsed.points,
  }
}
