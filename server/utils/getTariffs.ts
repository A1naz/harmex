import { User } from '@/server/lib/models/User'
import { DefaultPrices } from '../lib/models/defaultPrices'
import fs from 'fs'

export default async function getTariffs(userTariffs: any) {
  let defaultPrices = fs.readFileSync(
    'server/lib/files/defaultPrices.json',
    'utf8'
  )
  if (!defaultPrices) {
    const newPrices: any = await DefaultPrices.findOne({})

    fs.writeFileSync(
      'server/lib/files/defaultPrices.json',
      JSON.stringify({
        updatedAt: new Date(),
        values: newPrices.values,
      })
    )

    defaultPrices = fs.readFileSync(
      'server/lib/files/defaultPrices.json',
      'utf8'
    )
  }

  const parsed = JSON.parse(defaultPrices)

  const now = new Date()
  const diff = now.getTime() - new Date(parsed.updatedAt).getTime()

  if (diff > 1000 * 60 * 60) {
    const newPrices: any = await DefaultPrices.findOne({})

    fs.writeFileSync(
      'server/lib/files/defaultPrices.json',
      JSON.stringify({
        updatedAt: new Date(),
        values: newPrices.values,
      })
    )
  }

  const defaultTariffs = parsed.values
  try {
    if (userTariffs.length) {
      defaultTariffs.forEach((tariff: any) => {
        userTariffs.forEach((userTariff: any) => {
          if (userTariff.mp === tariff.mp) {
            for (let key of Object.keys(tariff.prices)) {
              if (userTariff.prices[key]) {
                tariff.prices[key].value = userTariff.prices[key].value
                if (userTariff.prices[key].type) {
                  tariff.prices[key].type = userTariff.prices[key].type
                }
                if (userTariff.prices[key].minPrice) {
                  tariff.prices[key].minPrice = userTariff.prices[key].minPrice
                }
              }
            }
          }
        })
      })

      return defaultTariffs
    } else {
      return defaultTariffs
    }
  } catch (error) {
    return defaultTariffs
  }
}
