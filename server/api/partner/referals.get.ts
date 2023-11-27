import { Referral } from '~/server/lib/models/Referral'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import { ObjectId } from 'mongodb'
import { PartnerPaymentHistory } from '~/server/lib/models/PartnerPaymentHistory'
import { IResTable } from '~/data/types'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

    const params = getQuery(event)
    const filtertObj = params.filter ? JSON.parse(params.filter.toString()) : {}
    const limit = params.limit ? parseInt(params.limit?.toString(), 10) : 50
    const skip = params.skip ? parseInt(params.skip?.toString(), 10) : 0
    const sortObj = params.sort ? JSON.parse(params.sort.toString()) : undefined

    const reffers = await Referral.aggregate([
            { $match: {
                    user: user._id
                }
            },
            { $project: {
                    referrals: 1
                }
            }, 
            { $lookup: {
                    from: 'users', 
                    localField: 'referrals.user', 
                    foreignField: '_id', 
                    as: 'refInfo'
            }}, 
            { $project: {
                    referrals: 0, 
                    refInfo: {
                        wbApiKeys: 0, 
                        password: 0, 
                        uuid: 0, 
                        roles: 0, 
                        balance: 0, 
                        emailConfirmed: 0, 
                        tg2fa: 0, 
                        __v: 0, 
                        tabs: 0, 
                        isBanned: 0, 
                        tariff: 0,
                        partner: {
                            balance: 0, 
                            rewardPercent: 0
                        }
                    }
                }
            },
            { $addFields: {
                    count: { $size: "$refInfo"}
                }
            },
            { $limit: limit},
            { $skip: skip},
    ])

  if (!reffers[0]) return []

    const data: IResTable = { 
        list: [] as any,
        count: 0
    }

    for(const refer of reffers[0].refInfo){
        if(filtertObj.dateRange) {
            const regDate = new Date(refer.registrationDate).toISOString()
            if(regDate <= filtertObj.dateRange.from
                || regDate >= filtertObj.dateRange.to  
                ) { break }
        }
        const deals = await paymenthistory.aggregate([
            { $match: {
                user: new ObjectId(refer._id), 
                typeoperations: "Расход"
            }}, 
            { $group: {
                _id: null, 
                counts: { $sum: 1 }, 
                summ: { $sum: "$summ" }
            } }
        ])
        const comissions = await PartnerPaymentHistory.aggregate([
            { $match: { referral: refer._id} },
            { $group: {
                _id: null,
                summ: { $sum: "$amount" }
            }}
        ])
        data.count +=1
        data.list.push({
                email: refer.email,
                username: refer.username,
                registrationDate: refer.registrationDate,
                refCount: refer.partner.refCount ? refer.partner.refCount : 0,
                deals: deals.length > 0 ? deals[0].counts : 0,
                summ: deals.length > 0 ? deals[0].summ : 0,
                comission: comissions.length > 0 ? comissions[0].summ : 0
            })
    }

    if (sortObj && Object.keys(sortObj).length > 0) {
        const key = Object.keys(sortObj)[0]
        const value = sortObj[key]
        if (key && value){
            data.list.sort( (a, b)=> value==1 ? a[key]-b[key] : b[key]-a[key] )
        }
    }

    return data
})
