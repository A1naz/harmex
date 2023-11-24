import { PartnerPaymentHistory } from '~/server/lib/models/PartnerPaymentHistory'
import { ObjectId } from 'mongodb';
import { IResTable } from '~/data/types';

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

    const params = getQuery(event)
    const filtertObj = params.filter ? JSON.parse(params.filter.toString()) : {}
    const sortObj = params.sort ? JSON.parse(params.sort.toString()) : {}
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
        { $unset: [
            'user',
            '_id',
            'paymenthistory',
            'referral',
            'histInfo',
            'refInfo'
        ]}
    ]

    if (Object.keys(filtertObj).length > 0 ) listPl.push( {$match: {...filtertObj }} )

    const countPl: any[] = [...listPl]

    if (Object.keys(sortObj).length > 0 ) listPl.push( {$sort: sortObj} )
    if (skip) listPl.push( {$skip: skip} )
    if (limit) listPl.push( {$limit: limit} )

    const pipline: any[] = [
        { $facet: {
            list: listPl,
            count: [...countPl, { $count: 'count'}]
        }}
    ]

    const reffers = await PartnerPaymentHistory.aggregate(pipline)

    const data: IResTable = {
        list: reffers[0].list,
        count: reffers[0].count[0].count
    }

    return data
})
