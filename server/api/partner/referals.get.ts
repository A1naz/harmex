import { Referral } from '~/server/lib/models/Referral'
import { Buyout } from '~/server/lib/models/Buyout'

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
                        partner: {
                            balance: 0, 
                            rewardPercent: 0
                        }
                    }
                }
            }
        ]
    )

  if (!reffers[0]) return {}

    const result = await Promise.all(
        reffers[0].refInfo.map(async (refer: any) => {
            let deals = 0
            deals += await Buyout.find({user: refer._id}).count()
            deals += await Buyout.find({user: refer._id}).count()
            return {
                email: refer.email,
                username: refer.username,
                registrationDate: refer.registrationDate,
                deals: deals
            }
        })
    ) 

  return result
})
