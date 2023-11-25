import ExcelJS from 'exceljs'
import { ObjectId } from 'mongodb';
import { PartnerPaymentHistory } from '~/server/lib/models/PartnerPaymentHistory';

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

  const { exportDates, columns } = await readBody(event)

  const startDate = new Date(exportDates[0])
  const endDate = new Date(exportDates[1])

  const listPl: any[] = [
    {  $match: {
        user: new ObjectId(user._id)
    }},
    { $project: { 
        user: 1,
        paymenthistory: 1,
        referral: 1,
        serviceType: 1,
        date: 1,
        amount: 1
    }},
    { $lookup: {
            from: 'paymenthistories',
            localField: 'paymenthistory',
            foreignField: '_id',
            as: 'histInfo'
    }},
    { $unwind: { path: '$histInfo' } },
    { $lookup: {
            from: 'users',
            localField: 'referral',
            foreignField: '_id',
            as: 'refInfo'
    }},
    { $unwind: { path: '$refInfo' } },
    { $addFields: {
        serviceSum: '$histInfo.summ',
        refRewarded: '$histInfo.refRewarded',
        refEmail: '$refInfo.email',
        refUsername: '$refInfo.username'
    }},
    { $unset: [
        'user',
        '_id',
        'paymenthistory',
        'referral',
        'histInfo',
        'refInfo'
    ]},
    { $set: {
        "refRewarded": {
            $cond: {
                if: {
                    $eq: [
                      "$refRewarded",
                      "выплачено"
                    ]
                  },
                then: "Активен",
            }
        }
    }}
]
if (startDate && endDate) {
    listPl.push( {$match: {   
            dataoperation: {
                $gt: startDate,
                $lt: endDate,
            }, }} )
    }

const reffers = await PartnerPaymentHistory.aggregate(listPl)

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Заказы партнеров', {
    headerFooter: { firstHeader: `Всего записей: ${reffers.length}` },
  })

  sheet.columns = columns
  sheet.addRows(reffers)
  const buffer = await workbook.xlsx.writeBuffer()
  return buffer
})
