import mongoose, { mongo } from 'mongoose'
const config = useRuntimeConfig()

export const BankConnection = mongoose.createConnection(config.BANK_DB_URI)