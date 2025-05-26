import mongoose, { mongo } from 'mongoose'
const config = useRuntimeConfig()

export const goldApplePVZConnection = mongoose.createConnection(config.GOLD_APPLE_PVZ_DB_URI)