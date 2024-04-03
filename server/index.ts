import type { Nitro } from 'nitropack'
import mongoose from 'mongoose'
import { serverPingCycle } from './utils/serverPingCycle'
import { createPickpointsFile, createOzonPickpointsFile } from '~/server/utils/pickpoints'

export default async (_nitroApp: Nitro) => {
  const config = useRuntimeConfig()
  try {
    createPickpointsFile()
    createOzonPickpointsFile()

    await mongoose.connect(config.MONGODB_URI)
    // eslint-disable-next-line no-console
    console.log('Connected to MongoDB')
    serverPingCycle()
  } catch (error) {
    console.error(error)
  }
}
