import mongoose from 'mongoose'

const config = useRuntimeConfig()

export const FlowwowConnection = mongoose.createConnection(config.FLOWWOW_DB_URI)
