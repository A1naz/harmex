import fs from 'node:fs'

export default function () {
  const cached = fs.readFileSync('pvz/avitoPoints.json', 'utf8')
  const parsed = JSON.parse(cached)
  return {
    points: parsed.points,
  }
}
