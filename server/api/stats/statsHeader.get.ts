﻿import { Delivery } from '~/server/lib/models/Delivery'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import { PartnerPaymentHistory } from '~/server/lib/models/PartnerPaymentHistory'
import { Delivery as OzonDelivery } from '~/server/lib/models/ozon/Delivery';
import { Delivery as WildberriesDelivery } from '~/server/lib/models/wildberries/Delivery';
import { Delivery as AvitoDelivery } from '~/server/lib/models/avito/Delivery';

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

  filter.type = {
    $in: [
      'buyouts service',
      'likeReview',
      'deliveries',
      'review',
      'questionProduct',
      'likeProduct',
      'cart',
      'autoanswers',
    ],
  }

  let paymentsForSumm: any = await paymenthistory.find({
    user,
    dataoperation: filter.dataoperation,
    type: filter.type,
  })


  const paymentsForDeliverySummWildberries = await WildberriesDelivery.aggregate([
    { $match: {
        user: user._id,
        status: 'completed',
        updatedAt: filter.dataoperation
    }},
    { $project: { 
        _id: 1,
    }},
    { $addFields: {
        type: 'deliveries',
    }},
])
  const paymentsForDeliverySummOzon = await OzonDelivery.aggregate([
    { $match: {
        user: user._id,
        status: 'completed',
        updatedAt: filter.dataoperation
    }},
    { $project: { 
        _id: 1,
    }},
    { $addFields: {
        type: 'deliveries',
    }},
])
  const paymentsForDeliverySummAvito = await AvitoDelivery.aggregate([
    { $match: {
        user: user._id,
        status: 'completed',
        updatedAt: filter.dataoperation
    }},
    { $project: { 
        _id: 1,
    }},
    { $addFields: {
        type: 'deliveries',
    }},
])
  
  const paymentsForDeliverySumm = [...paymentsForDeliverySummWildberries, ...paymentsForDeliverySummOzon, ...paymentsForDeliverySummAvito]
  if (paymentsForDeliverySumm.length > 0) {
    paymentsForSumm = [...paymentsForSumm, ...paymentsForDeliverySumm]
  }

  let quantity = 0

  paymentsForSumm.forEach((payment: any) => {
    quantity += 1
  })


  const totalDeals = quantity

  return { totalSumm: totalSumm, totalExpense: totalExpense, totalDeals: totalDeals, comissions: totalCommissions }
})
