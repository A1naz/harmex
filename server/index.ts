import type { Nitro } from 'nitropack'
import mongoose from 'mongoose'
import { setupTariffForAllUsers, standartPlan } from '~/data/migrations/tariff'

export default async (_nitroApp: Nitro) => {
  const config = useRuntimeConfig()
  try {
    await mongoose.connect(config.MONGODB_URI)
    // eslint-disable-next-line no-console
    console.log('Connected to MongoDB')

    // await standartPlan()
    // console.log('standartPlan done')

    // await setupTariffForAllUsers()
    // console.log('setupTariffForAllUsers done')

  }
  catch (error) {
    console.error(error)
  }
}
