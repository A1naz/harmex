import { User } from '@/server/lib/models/User'
import { Referral } from '~/server/lib/models/Referral'
import { getServerSession } from '#auth'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await User.findOne({ uuid: session.uuid })
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
  referralsRefAccs.forEach((el: any) => {
    secondLevelReferralsCount += el.referrals.length
  })
  
  return { status: 'ok', secondLevelReferralsCount }
})
