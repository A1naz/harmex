import mongoose, { mongo } from 'mongoose'
const config = useRuntimeConfig()

export const WBConnection = mongoose.createConnection(config.WB_DB_URI)