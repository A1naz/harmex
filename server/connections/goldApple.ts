import mongoose, { mongo } from 'mongoose'
const config = useRuntimeConfig()

export const goldAppleConnection = mongoose.createConnection(config.GOLD_APPLE_DB_URI)