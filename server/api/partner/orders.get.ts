import { PartnerPaymentHistory } from '~/server/lib/models/PartnerPaymentHistory'
import { ObjectId } from 'mongodb';
import { IResTable } from '~/data/types';
import { Referral } from '~/server/lib/models/Referral';

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

    const params = getQuery(event)
    const filtertObj = params.filter ? JSON.parse(params.filter.toString()) : {}
    const sortObj: {[x: string]: number} = params.sort ? JSON.parse(params.sort.toString()) : {}
    const limit = params.limit ? parseInt(params.limit?.toString(), 10) : undefined
    const skip = params.skip ? parseInt(params.skip?.toString(), 10) : undefined

    const listPl: any[] = [
        {  $match: {
            user: new ObjectId(user._id)
        }},
        { $project: { 
            user: 1,
            paymenthistory: 1,
            referral: 1,
            refLevel: 1,
            serviceType: 1,
            date: 1,
            amount: 1
        }},
        { $lookup: {
                from: 'paymenthistories',
                localField: 'paymenthistory',
                foreignField: '_id',
                as: 'histInfo'
        }},
        { $unwind: { path: '$histInfo' } },
        { $lookup: {
                from: 'users',
                localField: 'referral',
                foreignField: '_id',
                as: 'refInfo'
        }},
        { $unwind: { path: '$refInfo' } },
        { $addFields: {
            serviceSum: '$histInfo.summ',
            refRewarded: '$histInfo.refRewarded',
            refEmail: '$refInfo.email',
            refUsername: '$refInfo.username'
        }},
    ]

    if(filtertObj.dateRange) listPl.splice(1, 0, {
        $match: { 
            date: { 
                $gte: new Date(filtertObj.dateRange.from),
                $lte: new Date(filtertObj.dateRange.to)
            }
        }
    })

    const reffers = await PartnerPaymentHistory.aggregate(listPl)

    let format: any[] = []

    for(const ref of reffers){
        let inviter = user.username
        if(ref.refLevel === 2){
            const refHost = await Referral.aggregate([
                    { $match:
                        { "referrals.user": new ObjectId(ref.referral),
                    }},
                    { $lookup:
                        { from: "users",
                            localField: "user",
                            foreignField: "_id",
                            as: "inviter",
                    }},
                    { $unwind:
                        { path: "$inviter",
                    }},
                    { $project:
                        { "inviter.username": 1,
                    }}
            ])
            if(refHost[0]) {
                inviter = "2-ой уровень " + refHost[0].inviter.username
            }
        }
        format.push({
            refUsername: ref.refUsername,
            refEmail: ref.refEmail,
            refLevel: inviter,
            serviceType: ref.serviceType,
            date: ref.date,
            serviceSum: ref.serviceSum,
            amount: ref.amount,
            refRewarded: ref.refRewarded ? "Выплачено" : "Не завершено",
        })
    }

    const count = format.length

    if (Object.keys(sortObj).length > 0 ) {
        const key: string = Object.keys(sortObj)[0]
        const value: number = Object.values(sortObj)[0]
        format.sort( (a: any, b: any) => {
            if (typeof a[key] == 'number'){
                return a[key] * value - b[key] * value
            } else {
                return a[key] < b[key] ? -1 * value : 1 * value
            }
        })
    }
    if (typeof skip == 'number' && typeof limit  == 'number') {
        format = format.slice(skip, skip+limit)
    }

    return {
        status: 'ok',
        data: {
            list: format,
            count: count
        }
    }
})
