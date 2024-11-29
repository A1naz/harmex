import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import { PartnerPaymentHistory } from '~/server/lib/models/PartnerPaymentHistory'
import { HarmexReferrals as Referral } from '~/server/lib/models/HarmexReferrals'

export default defineEventHandler(async (event) => {
    const user = await getAdminEntity(event)
    if (!user)
        return sendRedirect(event, '/', 302)

    const userRefAcc = await Referral.findOne({ user }) || { referrals: [] }
  
  
    const refIds = userRefAcc?.referrals.map((el: any) => el.user)

  
    return {balance: user.balance, commissions: user.partner.balance, firstLevelReferralsCount: refIds.length}
})
