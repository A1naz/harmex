import { Buyout as ozonBuyout } from '../lib/models/ozon/Buyout'
import { User } from '../lib/models/User'
import { Buyout as wildberriesBuyout } from '../lib/models/wildberries/Buyout'

export async function checkBalance(user: any, buyouts: any) {
  try {
    // const userFound = await User.findOne({ user })
    if (!user)
      return false

    // const ozon = await ozonBuyout.find({ user: user._id, status: { $in: ['work', 'active'] } }).select('uuid product')
    const wildberries = await wildberriesBuyout.find({ user: user._id, status: { $in: ['work', 'active'] } }).select('uuid product')

    const all = [
      // ...ozon.map((item: any) => ({ ...item.toObject(), mp: 'ozon' })),
      ...wildberries.map((item: any) => ({ ...item.toObject(), mp: 'wildberries' })),
    ]

    const balanceActiveBuyouts = all.reduce((acc: number, item: any) => {
      return acc + (Number.parseFloat(item.product.price) || 0)
    }, 0)

    const currentBuyoutsSumm = buyouts.reduce((acc: number, item: any) => {
      return acc + (item.price ? Number.parseFloat(item.price) : Number.parseFloat(item.product.price)) || 0
    }, 0)

    const totalPrice = balanceActiveBuyouts + currentBuyoutsSumm

    // console.log('Total', totalPrice, 'balance', user.balance)
    return user.balance >= totalPrice
  }
  catch (e: any) {
    console.error(e)
    return false
  }
}
