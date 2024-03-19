﻿import { Delivery } from '~/server/lib/models/Delivery'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import { PartnerPaymentHistory } from '~/server/lib/models/PartnerPaymentHistory'

export default eventHandler(async (event) => {
  
  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const { period } = getQuery(event)

  const currentDate = new Date() // Текущая дата
  let filter: any = {} // Начинаем с пустого фильтраD

  switch (period) {
    case 'today':
      filter.dataoperation = {
        $gte: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate()
        ).setHours(3, 0, 0, 0),
        $lt: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() + 1
        ).setHours(23, 59, 59, 999),
      }
      break
    case 'yesterday':
      filter.dataoperation = {
        $gte: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() - 1
        ).setHours(3, 0, 0, 0),
        $lt: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate()
        ).setHours(3, 0, 0, 0),
      }
      break
    case 'week':
      const oneWeekAgo = new Date(currentDate)
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      oneWeekAgo.setHours(3, 0, 0, 0)
      filter.dataoperation = {
        $gte: oneWeekAgo,
        $lt: currentDate,
      }
      break
    case 'month':
      filter.dataoperation = {
        $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
        $lt: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
      }
      break
    case 'lastMonth':
      filter.dataoperation = {
        $gte: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          1
        ),
        $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      }
      break
    default:
      // Обработка неверного значения параметра period, если необходимо
      break
    }

    const history = await paymenthistory.find({
      user,
      dataoperation: filter.dataoperation,
    });

    const payments = history.filter((item:any)=> item.typeoperations === 'Приход')

    const expense = history.filter((item:any)=> item.typeoperations === 'Расход')

    console.log('expense', expense)

    
    const totalSumm = payments.reduce((acc:any, payment:any) => {
      return acc + parseInt(payment.summ);
    }, 0);
    const totalExpense = expense.reduce((acc:any, payment:any) => {
      return acc + parseInt(payment.summ);
    }, 0);

    
  //   const dealsCount = await paymenthistory.aggregate([
  //     {  
  //       $match: { 
  //         user: user._id,
  //         dataoperation: filter.dataoperation 
  //       }  
  //     },
  //     {
  //       $group: {
  //         _id: '$user',
  //         count: { $sum: 1 },
  //       },
  //     },
  //   ])
  // const totalDeals = dealsCount.reduce((total, deal) => total + deal.count, 0);
  //   console.log('totalDeals', totalDeals)
  const comissions = await PartnerPaymentHistory.aggregate([
    { $match: {
      user: user._id,
      date: filter.dataoperation,
    } },
    {
      $group: {
        _id: '$referral',
        summ: { $sum: '$amount' },
        date: { $first: '$date' },
      },
    },
  ])
  const totalCommissions = comissions.reduce((count, comission) => count + comission.summ, 0);

  const totalDeals = expense.length
  // console.log('totalSumm:', totalSumm, 'totalExpense:', totalExpense, 'totalDeals:', totalDeals, 'comissions:', totalCommissions)

  return { totalSumm: totalSumm, totalExpense: totalExpense, totalDeals: totalDeals, comissions: totalCommissions }
})
