import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import MenuBuilder from '~/server/utils/menuBuilder'
import { Client } from '~/data/types'
import { UserRoles } from '~/data/enums'

export default eventHandler(async (event) => {
  const { referral }: any = getQuery(event)

  let inviter = await User.findOne({ uuid: referral })

  if (!inviter) {
    inviter = await User.findOne({ username: referral })
    if (!inviter) {
      return
    }
  }

  if (!inviter.partner.followCount) {
    inviter.partner.followCount = 1
  } else {
    inviter.partner.followCount += 1
  }
  const count = inviter.partner.followCount
  await inviter.save()

  return {
    status: 'ok',
    count,
  }
})
