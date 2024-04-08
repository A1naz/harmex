import type { Nitro } from 'nitropack'
import mongoose from 'mongoose'
import { serverPingCycle } from './utils/serverPingCycle'
import { createAllPickpoints } from '~/server/utils/pickpoints'

export default async (_nitroApp: Nitro) => {
  const config = useRuntimeConfig()
  try {
    if (config.env !== 'developer') {

      createAllPickpoints()
    }

    await mongoose.connect(config.MONGODB_URI)
    // eslint-disable-next-line no-console
    console.log('Connected to MongoDB')
    serverPingCycle()
  } catch (error) {
    console.error(error)
  }
}
