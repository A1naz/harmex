﻿import { Delivery } from '~/server/lib/models/Delivery'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'

export default eventHandler(async (event) => {
  
  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const { type, period } = getQuery(event)

  const currentDate = new Date() // Текущая дата
  let filter: any = {} // Начинаем с пустого фильтраD

  const types = [
    'buyouts service',
    'likes',
    'deliveries',
    'reviews',
    'questions',
    'productlikes',
    'carts',
  ]

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

  if (type == 'all') {
    filter.type = {
      $in: types,
    }
  } else {
    filter.type = type
  }

  let history: any
  if (type == 'deliveries') {
    history = await Delivery.aggregate([
        { $match: {
            user: user._id,
            status: 'completed'
        }},
        { $project: { 
            updatedAt: 1,
        }},
        { $addFields: {
            dataoperation: '$updatedAt'
        }},

    ])
  } else {
    history = await paymenthistory.find({
        user,
        ...filter,
      })
  }
  
  const format: any = []

  if (period == 'week' || period == 'today' || period == 'yesterday') {
    const sumByDayArray = new Array(7).fill(0)
    const currentDate: any = new Date()
    currentDate.setDate(currentDate.getDate() + 1)
    
    const oneWeekAgo = new Date(currentDate)
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    oneWeekAgo.setHours(3, 0, 0, 0)

    const daysArray = []
    const date = new Date(oneWeekAgo)
    while (daysArray.length < 7) {
      let curDate: any = date.getDate().toString()
      let month: any = (date.getMonth() + 1).toString()
      curDate = curDate.toString().length == 1 ? '0' + curDate : +curDate
      month = month.toString().length == 1 ? '0' + month : month
      daysArray.push(`${curDate}.${month}`)
      date.setDate(date.getDate() + 1)
    }

    let newHistory: any
    if (type == 'deliveries') {
        newHistory = await Delivery.aggregate([
            { $match: {
                user: user._id,
                status: 'completed',
                updatedAt: {
                    $gte: oneWeekAgo,
                    $lt: currentDate
                }
            }},
            { $project: { 
                updatedAt: 1,
            }},
            { $addFields: {
                dataoperation: '$updatedAt'
            }}
        ])
      } else {
        newHistory = await paymenthistory.find({
            user,
            type: filter.type,
            dataoperation: {
                $gte: oneWeekAgo,
                $lt: currentDate,
            },
        })
      }
    const trueCurDate: any = new Date()
    trueCurDate.setDate(trueCurDate.getDate() + 1)
    trueCurDate.setHours(3, 0, 0, 0)

    for (const payment of newHistory) {
      const recordDate: any = new Date(payment.dataoperation)

      if (recordDate >= oneWeekAgo && recordDate <= trueCurDate) {
        const daysAgo = Math.floor(
          (trueCurDate - recordDate) / (24 * 60 * 60 * 1000)
        )

        if (daysAgo >= 0 && daysAgo < 7) {
            if (type == 'deliveries') {
                sumByDayArray[6 - daysAgo] += 1
            } else {
                sumByDayArray[6 - daysAgo] += parseFloat(payment.summ)
            }
        }
      }
    }
    format.data = sumByDayArray
    format.labels = daysArray
  } else if (period == 'month' || period == 'lastMonth') {
    const currentMonth: any = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1
    )
    const oneMonthAgo = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    )
    if (period == 'lastMonth') {
      currentMonth.setMonth(currentMonth.getMonth() - 1)
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    }

    oneMonthAgo.setHours(3, 0, 0, 0)

    const year = currentDate.getFullYear()
    let month = new Date().getMonth()
    if (period == 'lastMonth') {
      month -= 1
    }
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const numberOfDaysInMonth = lastDayOfMonth.getDate()
    const daysArray = []
    while (daysArray.length < numberOfDaysInMonth) {
      daysArray.push(
        `${
          (oneMonthAgo.getDate() + daysArray.length).toString().length === 1
            ? `0${oneMonthAgo.getDate() + daysArray.length}`
            : oneMonthAgo.getDate() + daysArray.length
        }.${
          (oneMonthAgo.getMonth() + 1).toString().length === 1
            ? `0${oneMonthAgo.getMonth() + 1}`
            : oneMonthAgo.getMonth() + 1
        }`
      )
    }

    const sumByDayArray = new Array(numberOfDaysInMonth).fill(0)
    currentMonth.setHours(3)

    for (const payment of history) {
      const recordDate: any = new Date(payment.dataoperation)

      const daysAgo = Math.floor(
        (currentMonth - recordDate) / (24 * 60 * 60 * 1000)
      )

      if (daysAgo >= 0 && daysAgo < numberOfDaysInMonth) {
        if(type == 'deliveries') {
            sumByDayArray[numberOfDaysInMonth - 1 - daysAgo] += 1
        } else {
            sumByDayArray[numberOfDaysInMonth - 1 - daysAgo] += parseFloat(payment.summ)
        }
      }
    }
    format.data = sumByDayArray

    format.labels = daysArray
  }

  let paymentsForSumm: any = await paymenthistory.find({
    user,
    dataoperation: filter.dataoperation,
    type: {
      $in: types.filter( a=> a !== 'deliveries'),
    },
  })
    const paymentsForDeliverySumm = await Delivery.aggregate([
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
    if(paymentsForDeliverySumm.length > 0){
        paymentsForSumm = [...paymentsForSumm, ...paymentsForDeliverySumm]
    }

  const typeSumMap = new Map()
  typeSumMap.set('all', 0)
  typeSumMap.set('all quantity', 0)
  types.forEach((type) => {
    typeSumMap.set(type, 0)
    typeSumMap.set(type + ' quantity', 0)
  })

  paymentsForSumm.forEach((payment: any) => {
    if(payment.type !== 'deliveries') {
        if (typeSumMap.has(payment.type)) {
        typeSumMap.set(
            payment.type,
            Number(typeSumMap.get(payment.type)) + Number(payment.summ)
        )
        } else {
            typeSumMap.set(payment.type, Number(payment.summ))
        }
    }
    typeSumMap.set(
      payment.type + ' quantity',
      Number(typeSumMap.get(payment.type + ' quantity')) + 1
    )
  })

  const services = [
    {
      value: 'all',
      title: 'Все',
      expenses: 0,
      quantity: 0,
    },
    {
      value: 'buyouts service',
      title: 'Выкупы',
      expenses: 0,
      quantity: 0,
    },
    {
      value: 'deliveries',
      title: 'Доставки',
      expenses: 0,
      quantity: 0,
    },
    {
      value: 'reviews',
      title: 'Отзывы',
      expenses: 0,
      quantity: 0,
    },
    // {
    //   value: 'likes',
    //   title: 'Лайки на отзывы',
    //   expenses: 0,
    //   quantity: 0,
    // },
    // {
    //   value: 'productlikes',
    //   title: 'Лайки на товар/бренд',
    //   expenses: 0,
    //   quantity: 0,
    // },
    {
      value: 'questions',
      title: 'Вопросы',
      expenses: 0,
      quantity: 0,
    },
    {
      value: 'carts',
      title: 'Корзина',
      expenses: 0,
      quantity: 0,
    },
  ]

  const likesItem = {
    value: 'likes',
    title: 'Лайки',
    expenses: 0,
    quantity: 0,
  };

  

  typeSumMap.forEach((value, key) => {
    if (key === 'likes' || key === 'productlikes') {
      likesItem.expenses += value;
      likesItem.quantity += typeSumMap.get(key + ' quantity');
    } else {
      services.forEach((item) => {
        if (item.value === key) {
          item.expenses = value;
          item.quantity = typeSumMap.get(key + ' quantity');
          services[0].quantity += item.quantity;
          services[0].expenses += item.expenses;
        }
      });
    }
  })

  const penalty = {
    value: 'panalty',
    title: 'Штрафы',
    expenses: 0,
    quantity: 0,
  };

  const penaltyDeliveriesPayments = await paymenthistory.find({
    user,
    dataoperation: filter.dataoperation,
    typeoperations: 'Расход',
    type: 'deliveries',
    comment: { $regex: 'Штраф', $options: 'i' },
  })

  penaltyDeliveriesPayments.forEach((item) => {
    penalty.expenses += +item.summ
    penalty.quantity += 1
    // console.log('penalty: ', item)
  })
  services.splice(4, 0, likesItem);
  services.push(penalty);



  return { data: format.data, labels: format.labels, services, }
})
