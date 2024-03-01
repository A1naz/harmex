import fs from 'node:fs'
import { ProxySearchQuery } from '~/server/lib/models/ProxySearchQuery'
import { HttpsProxyAgent } from 'https-proxy-agent'

async function getRandomProxy(): Promise<string> {
  const allProxies: any = await ProxySearchQuery.find()
  const proxies: string[] = allProxies[0].proxies
  const randomNumber = Math.floor(Math.random() * proxies.length - 1)

  return `https://${proxies[randomNumber]}`
}

export async function removeExtraPickpoints() {
  const cached = fs.readFileSync('pvz/wildberriesPoints.json', 'utf8')
  const parsed = JSON.parse(cached)

  //Обновление даты, чтобы не было зацикливаний
  const cache = {
    updated: new Date(),
    points: parsed.points,
  }
  fs.writeFileSync('pvz/wildberriesPoints.json', JSON.stringify(cache))

  const proxyString = await getRandomProxy()

  const data: any = await $fetch(
    'https://static-basket-01.wb.ru/vol0/data/all-poo-fr-v9.json',
    {
      method: 'GET',
      agent: new HttpsProxyAgent(proxyString),
      headers: {
        'x-requested-with': 'XMLHttpRequest',
      },
    }
  )

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

  const newCache = {
    updated: new Date(),
    points: parsed.points,
  }
  fs.writeFileSync('pvz/wildberriesPoints.json', JSON.stringify(newCache))
}

export async function createPickpointsFile() {
  const proxyString = await getRandomProxy()

  const data: any = await $fetch(
    'https://static-basket-01.wb.ru/vol0/data/all-poo-fr-v9.json',
    {
      method: 'GET',
      agent: new HttpsProxyAgent(proxyString),
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
  fs.writeFileSync('pvz/wildberriesPoints.json', JSON.stringify(cache))
}
