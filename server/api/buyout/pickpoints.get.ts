import fs from 'node:fs'
import { getServerSession } from '#auth'
import { PVZ } from '@/server/lib/models/PVZ'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)
  if (fs.existsSync('points.json')) {
    const cached = fs.readFileSync('points.json', 'utf8')
    const parsed = JSON.parse(cached)
 
    const now = new Date()
    const diff = now.getTime() - new Date(parsed.updated).getTime()
    if (diff < 1000 * 60 * 60) {
      return sendStream(event, fs.createReadStream('points.json'))
    }
  }

  // if (fs.existsSync('points.json')) {
  //   const data: any = await PVZ.find()

  //   const cached = fs.readFileSync('points.json', 'utf8')
  //   const parsed = JSON.parse(cached)

  //   parsed.forEach((obj: any) => {
  //     if (obj.deleteMark && obj.deleteMark >= 5) {
  //       const index = parsed.points.findIndex((el: any) => el.id === obj.id)
  //       if (index !== -1) {
  //         parsed.points.splice(index, 1)
  //       } else {
  //         parsed.points[index].deleteMark = 0
  //       }
  //     }
  //   })

  //   //Добавление новых пвз, только прилетевших из вб
  //   data[0].items.forEach((obj: any) => {
  //     if (obj.id) {
  //       const index = parsed.points.findIndex(
  //         (el: any) => el.id === obj.id
  //       )
  //       if (index === -1 && obj.id) {
  //         parsed.points.push({
  //           id: obj.id,
  //           lt: obj.coordinates.lat,
  //           lg: obj.coordinates.lon,
  //           deleteMark: 0,
  //         })
  //       }
  //     }
  //   })

  //   //Обновление deleteMark
  //   parsed.points.forEach((obj: any) => {
  //     if (!obj.deleteMark) {
  //       obj.deleteMark = 0
  //     }
  //     //Увеличиваем deleteMark, для points(ПВЗ), которые не прилетели из вб
  //     if (!data[0].items.some((el: any) => el.id === obj.id)) {
  //       obj.deleteMark++
  //     } else {
  //       obj.deleteMark = 0
  //     }
  //   })

  //   const cache = {
  //     updated: new Date(),
  //     points: parsed.points,
  //   }
  //   fs.writeFileSync('points.json', JSON.stringify(cache))
  //   return sendStream(event, fs.createReadStream('points.json'))
  // }
   
    const points: any = await PVZ.find()

    const collection = points.map((point: any) => {
      return {
        id: point.id,
        lt: point.coordinates.lat,
        lg: point.coordinates.lon,
      }
    })

    const cache = {
      updated: new Date(),
      points: collection,
    }
    fs.writeFileSync('points.json', JSON.stringify(cache))
    return sendStream(event, fs.createReadStream('points.json'))
  
})
