import { PartnerWithdraw } from '~/server/lib/models/PartnerWithdraw'

export default eventHandler(async (event) => {

  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  let withdrawsCount = 0
  const aggregate = await PartnerWithdraw.aggregate([
    {
      $match: {
        status: { $in: ['created', 'work', 'completed'] },
        user: user._id,
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' }, // Вычисляем сумму 'amount' в каждой группе
      },
    },
  ])

  if (aggregate && aggregate.length > 0) {
    withdrawsCount = aggregate[0].totalAmount
  }

  return { withdrawsCount }
})
