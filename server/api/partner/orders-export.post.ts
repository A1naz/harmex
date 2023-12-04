import ExcelJS from 'exceljs'
import { ObjectId } from 'mongodb';
import { PartnerPaymentHistory } from '~/server/lib/models/PartnerPaymentHistory';
import { Referral } from '~/server/lib/models/Referral';

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
]
if (startDate && endDate) {
    listPl.push( {$match: {   
            date: {
                $gt: startDate,
                $lt: endDate,
            }, }} )
    }

    const reffers = await PartnerPaymentHistory.aggregate(listPl)

    const format: any[] = []

    for(const ref of reffers){
        let inviter = user.username
        if(ref.refLevel === 2){
            const refHost = await Referral.aggregate([
                    { $match:
                        { "referrals.user": new ObjectId(ref.referral),
                    }},
                    { $lookup:
                        { from: "users",
                            localField: "user",
                            foreignField: "_id",
                            as: "inviter",
                    }},
                    { $unwind:
                        { path: "$inviter",
                    }},
                    { $project:
                        { "inviter.username": 1,
                    }}
            ])
            if(refHost[0]) {
                inviter = "2-ой уровень " + refHost[0].inviter.username
            }
        }
        format.push({
            refUsername: ref.refUsername,
            refEmail: ref.refEmail,
            refLevel: inviter,
            serviceType: ref.serviceType,
            date: ref.date,
            serviceSum: ref.serviceSum,
            amount: ref.amount,
            refRewarded: ref.refRewarded ? "Выплачено" : "Не завершено",
        })
    }

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Заказы партнеров', {
    headerFooter: { firstHeader: `Всего записей: ${format.length}` },
  })

  sheet.columns = columns
  sheet.addRows(format)
  const buffer = await workbook.xlsx.writeBuffer()
  return buffer
})
