import { Referral } from '~/server/lib/models/Referral'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

    const reffers = await Referral.aggregate(
        [
            {
                $match: {
                    user: user._id
                }
            }, {
                $project: {
                    referrals: 1
                }
            }, {
                $lookup: {
                    from: 'users', 
                    localField: 'referrals.user', 
                    foreignField: '_id', 
                    as: 'refInfo'
                }
            }, {
                $project: {
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
            }
        ]
    )

  if (!reffers[0]) return []

    const result = await Promise.all(
        reffers[0].refInfo.map(async (refer: any) => {

            const deals = await paymenthistory.find({user: refer._id})
            if(!deals) return

            return deals.map( deal => {
                return {
                    username: refer.username,
                    refCount: refer.partner.refCount ? refer.partner.refCount : 0,
                    dataoperation: deal.dataoperation,
                    summ: deal.summ,
                    type: deal.type,
                    article: deal.article
                }
            }) 
        })
    ) 

    const data: any[] = []

    result.forEach( el => el.forEach( (i: any) => data.push(i)))

  return data.sort( (a, b) => b.dataoperation - a.dataoperation)
})
