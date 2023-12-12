import { Referral } from '~/server/lib/models/Referral'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import { ObjectId } from 'mongodb'
import { PartnerPaymentHistory } from '~/server/lib/models/PartnerPaymentHistory'
import ExcelJS from 'exceljs'

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const { exportDates, columns } = await readBody(event)

  const startDate = new Date(exportDates[0])
  const endDate = new Date(exportDates[1])

  const reffersPL: any[] = [
    {
      $match: {
        user: user._id,
      },
    },
    {
      $project: {
        referrals: 1,
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'referrals.user',
        foreignField: '_id',
        as: 'refInfo',
      },
    },
    {
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
            rewardPercent: 0,
          },
        },
      },
    },
  ]

  const reffers = await Referral.aggregate(reffersPL)

  const data = []

  for (const refer of reffers[0].refInfo) {
    if (
      refer.registrationDate >= startDate &&
      refer.registrationDate <= endDate
    ) {
      const deals = await paymenthistory.aggregate([
        {
          $match: {
            user: new ObjectId(refer._id),
            typeoperations: 'Приход',
          },
        },
        {
          $group: {
            _id: null,
            counts: { $sum: 1 },
            summ: { $sum: '$summ' },
          },
        },
      ])

      const comissions = await PartnerPaymentHistory.aggregate([
        {
          $match: {
            referral: refer._id,
          },
        },
        {
          $group: {
            _id: null,
            summ: { $sum: '$amount' },
          },
        },
      ])

      const dealsCount = await PartnerPaymentHistory.countDocuments({
        referral: refer._id,
      })

      data.push({
        email: refer.email,
        username: refer.username,
        registrationDate: refer.registrationDate,
        refCount: refer.partner.refCount ? refer.partner.refCount : 0,
        deals: dealsCount ? dealsCount : 0,
        summ: deals.length > 0 ? deals[0].summ : 0,
        comission: comissions.length > 0 ? comissions[0].summ : 0,
      })
    }
  }

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Партнеры', {
    headerFooter: { firstHeader: `Всего записей: ${data.length}` },
  })

  sheet.columns = columns
  sheet.addRows(data)
  const buffer = await workbook.xlsx.writeBuffer()
  return buffer
})
