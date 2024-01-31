import fs from 'node:fs'
import { getServerSession } from '#auth'
import getPoints from '~/server/lib/getPoints'

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

  if (fs.existsSync('points.json')) {
    const data: any = await $fetch(
      'https://static-basket-01.wb.ru/vol0/data/all-poo-fr-v9.json',
      {
        method: 'GET',
        headers: {
          'x-requested-with': 'XMLHttpRequest',
        },
      }
    )

    const cached = fs.readFileSync('points.json', 'utf8')
    const parsed = JSON.parse(cached)

    // Удаление объектов с deleteMark >= 10
    parsed.points.forEach((obj: any) => {
      if (obj.deleteMark && obj.deleteMark >= 5) {
        const index = parsed.points.findIndex((el: any) => el.id === obj.id)
        if (index !== -1) {
          parsed.points.splice(index, 1)
        } else {
          parsed.points[index].deleteMark = 0
        }
      }
    })

    //Добавление новых пвз, только прилетевших из вб
    data[0].items.forEach((obj: any) => {
      if (obj.id) {
        const index = parsed.points.findIndex(
          (el: any) => el.id === obj.id || el.a === obj.address
        )
        if (index === -1 && obj.id) {
          parsed.points.push({
            id: obj.id,
            lt: obj.coordinates[0],
            lg: obj.coordinates[1],
            w: obj.workTime,
            a: obj.address,
            deleteMark: 0,
          })
        }
      }
    })

    //Обновление deleteMark
    parsed.points.forEach((obj: any) => {
      if (!obj.deleteMark) {
        obj.deleteMark = 0
      }
      //Увеличиваем deleteMark, для points(ПВЗ), которые не прилетели из вб
      if (!data[0].items.some((el: any) => el.id === obj.id)) {
        obj.deleteMark++
      } else {
        obj.deleteMark = 0
      }
    })

    // const points = data.value.pickups
    // const collection = points.map((point: any) => {
    //   return {
    //     id: point.id,
    //     lt: point.coordinates[0],
    //     lg: point.coordinates[1],
    //     w: point.workTime,
    //     a: point.address,
    //   }
    // })

    const cache = {
      updated: new Date(),
      points: parsed.points,
    }
    fs.writeFileSync('points.json', JSON.stringify(cache))
    return sendStream(event, fs.createReadStream('points.json'))
  } else {
    const data: any = await $fetch(
      'https://static-basket-01.wb.ru/vol0/data/all-poo-fr-v9.json',
      {
        method: 'GET',
        headers: {
          'x-requested-with': 'XMLHttpRequest',
        },
      }
    )

    const points = data[0].items
    const collection = points.map((point: any) => {
      return {
        id: point.id,
        lt: point.coordinates[0],
        lg: point.coordinates[1],
        w: point.workTime,
        a: point.address,
      }
    })

    const cache = {
      updated: new Date(),
      points: collection,
    }
    fs.writeFileSync('points.json', JSON.stringify(cache))
    return sendStream(event, fs.createReadStream('points.json'))
  }
})
