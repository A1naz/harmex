import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  const { type } = getQuery(event)

  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await User.findOne({ uuid: session.uuid })
  if (!user) return sendRedirect(event, '/auth', 302)

  //   let trueType = {}
  //   if (type == 'all') {
  //     trueType = {
  //       $in: [
  //         'buyouts service',
  //         'likes',
  //         'reviews',
  //         'questions',
  //         'productlikes',
  //         'carts',
  //         'autoanswers',
  //       ],
  //     }
  //   } else {
  //     trueType = {
  //       type: type,
  //     }
  //   }

  //   const history = await paymenthistory.find({
  //     user,
  //     ...trueType,
  //   })
  //   const count = history.length
  //   let summ = 0
  //   history.forEach((item: any) => {
  //     summ += item.summ
  //   })
  const format: any = []

  while (format.length < 12) {
    const number = Math.floor(Math.random() * 10)
    format.push(number)
  }


  return format
})
