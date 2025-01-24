
import { HarmexReferrals as Referral } from '~/server/lib/models/HarmexReferrals'

export default defineEventHandler(async (event) => {
    const user = await getAdminEntity(event)
    if (!user)
        return sendRedirect(event, '/', 302)

    const userRefAcc = await Referral.findOne({ user }) || { referrals: [] }

    const refIds = userRefAcc?.referrals.map((el: any) => el.user)


    return {
        balance: user.balance,
        commissions: user.partner.balance,
        firstLevelReferralsCount: refIds.length,
        rewardSumm: userRefAcc?.partnerRewardType ?
            userRefAcc?.partnerRewardType === 'service' ?
                userRefAcc?.partnerServiceRewardSum + ' ₽'
                : userRefAcc?.rewardPercent + ' % со всех услуг'
            : '500 ₽'
    }
})
