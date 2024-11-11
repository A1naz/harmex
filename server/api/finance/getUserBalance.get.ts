import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import { PartnerPaymentHistory } from '~/server/lib/models/PartnerPaymentHistory'
import { HarmexReferrals as Referral } from '~/server/lib/models/HarmexReferrals'

export default defineEventHandler(async (event) => {
    const user = await getAdminEntity(event)
    if (!user)
        return sendRedirect(event, '/', 302)

    const userRefAcc = await Referral.findOne({ user }) || { referrals: [] }
  
    const comissions = await PartnerPaymentHistory.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: '$referral',
          summ: { $sum: '$amount' },
        },
      },
    ])
  
  
    const referralUsers = userRefAcc.referrals.map((referral) =>
      referral.user.toString()
    )
    const refIds = userRefAcc?.referrals.map((el: any) => el.user)

  
    const firstLevelComissions = comissions.reduce(
      (sum:any, comission:any) => {
        if (referralUsers.includes(comission._id.toString())) {
          sum += comission.summ
        }
        return sum
      },
      0
    )
    return {balance: user.balance, commissions: firstLevelComissions, firstLevelReferralsCount: refIds.length}
})
