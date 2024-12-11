import { model, Schema } from 'mongoose'
import { BankConnection } from '~/server/connections/bank'

const bankInfoSchema = new Schema({
        nameBank: { type: String },
        nameOrganization: { type: String },
        portal: { type: Boolean },
        bankDetails: { type: Object },
        balance: { type: Number },
})

export const BankInfo = BankConnection.model('User', bankInfoSchema, 'User')
