import { User } from '../lib/models/User'
import { DefaultPrices } from '@/server/lib/models/defaultPrices'
import { Buyout as wildberriesBuyout } from '../lib/models/wildberries/Buyout'
import { Buyout as ozonBuyout } from '../lib/models/ozon/Buyout'
import { Review as wildberriesReview } from '../lib/models/wildberries/Review'
import { Review as ozonReview } from '../lib/models/ozon/Review'

export const checkBalance = async (user: any, products: any, service: string = 'buyouts') => {
    try {
        // const userFound = await User.findOne({ user })
        if (!user) return false

        let totalPrice = 0
        let wildberries = []
        let ozon = []

        switch (service) {
            case 'reviews':
                const pricesDocument = await DefaultPrices.findOne(
                    { "values.mp": { $in: ["ozon", "wildberries"] } },
                    { "values": 1 }
                );

                if (!pricesDocument || !pricesDocument.values) {
                    console.log("Prices document not found");
                    return false;
                }

                const pricesMap = pricesDocument?.values.reduce((acc: any, item: any) => {
                    acc[item.mp] = item.prices?.review?.value || 0;
                    return acc;
                }, {});

                const ozonPrice = pricesMap["ozon"] || 0;
                const wildberriesPrice = pricesMap["wildberries"] || 0;

                totalPrice = products.mp === "ozon" ? ozonPrice : wildberriesPrice;

                if (products.video !== '') {
                    totalPrice += 25;
                }

                ozon = await ozonReview.find({
                    user: user._id,
                    status: { $in: ['created', 'working', 'waiting', 'work'] },
                }).select('uuid isVideoEnabled');


                wildberries = await wildberriesReview.find({
                    user: user._id,
                    status: { $in: ['created', 'working', 'waiting', 'work'] },
                }).select('uuid isVideoEnabled');


                const balanceActiveReviews = ozon.reduce((acc, item) => acc + (item.isVideoEnabled ? ozonPrice + 25 : ozonPrice), 0) +
                            wildberries.reduce((acc, item) => acc + (item.isVideoEnabled ? wildberriesPrice + 25 : wildberriesPrice), 0);


                totalPrice += balanceActiveReviews;

                console.log('totalPrice', totalPrice)

                return user.balance >= totalPrice;

            default:
                // const ozon = await ozonBuyout.find({ user: user._id, status: { $in: ['work', 'active'] } }).select('uuid product')
                wildberries = await wildberriesBuyout.find({ user: user._id, status: { $in: ['work', 'active'] } }).select('uuid product')

                const all = [
                    // ...ozon.map((item: any) => ({ ...item.toObject(), mp: 'ozon' })),
                    ...wildberries.map((item: any) => ({ ...item.toObject(), mp: 'wildberries' }))
                ]

                const balanceActiveBuyouts = all.reduce((acc: number, item: any) => {
                    return acc + (parseFloat(item.product.price) || 0)
                }, 0)

                const currentBuyoutsSumm = products.reduce((acc: number, item: any) => {
                    return acc + (item.price ? parseFloat(item.price) : parseFloat(item.product.price)) || 0
                }, 0)


                totalPrice = balanceActiveBuyouts + currentBuyoutsSumm
                // console.log('Total', totalPrice, 'balance', user.balance)
                return user.balance >= totalPrice
        }
    } catch (e: any) {
        console.error(e)
        return false
    }
}
