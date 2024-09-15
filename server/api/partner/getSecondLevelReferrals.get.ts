import { Referral } from '~/server/lib/models/Referral'

export default eventHandler(async (event) => {

  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const userRefAcc = await Referral.findOne({ user })
  if (!userRefAcc) {
    return {
      status: 'Not found',
    }
  }
  const refIds = userRefAcc?.referrals.map((el: any) => el.user)
  const referralsRefAccs = await Referral.find({ user: { $in: refIds } })

  let secondLevelReferralsCount = 0
  let firstLevelReferralsCount = refIds.length
  referralsRefAccs.forEach((el: any) => {
    secondLevelReferralsCount += el.referrals.length
  })
  
  return { status: 'ok', secondLevelReferralsCount, firstLevelReferralsCount }
})
