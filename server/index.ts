import type { Nitro } from 'nitropack'
import mongoose from 'mongoose'
import { createAllPickpoints } from '~/server/utils/pickpoints'
import { startEmailAutoSender } from '~/server/utils/emailAutoSender'

export default async (_nitroApp: Nitro) => {
  const config = useRuntimeConfig()

  try { 
    if (config.env !== 'developer') {
      createAllPickpoints()
      // Запускаем автоматическую рассылку писем
      startEmailAutoSender()
    }

    await mongoose.connect(config.MONGODB_URI)
    // eslint-disable-next-line no-console
    console.log('Connected to MongoDB')

  }
  catch (error) {
    console.error(error)
  }
}
