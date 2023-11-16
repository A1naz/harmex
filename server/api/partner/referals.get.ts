import { Referral } from '~/server/lib/models/Referral'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import { ObjectId } from 'mongodb'

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
            const deals = await paymenthistory.aggregate(
                [
                    {
                      $match: {
                        user: new ObjectId(refer._id), 
                        typeoperations: "Расход"
                      }
                    }, 
                    {
                      $group: {
                        _id: null, 
                        counts: { $sum: 1 }, 
                        summ: { $sum: "$summ" }
                      }
                    }
                  ]
                )
console.log('deals: ', deals)
            return {
                email: refer.email,
                username: refer.username,
                registrationDate: refer.registrationDate,
                deals: deals.length > 0 ? deals[0].counts : 0,
                summ: deals.length > 0 ? deals[0].summ : 0
            }
        })
    ) 
console.log('result: ', result)
  return result
})
