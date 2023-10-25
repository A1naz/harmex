import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  const { type, period } = getQuery(event)
  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await User.findOne({ uuid: session.uuid })
  if (!user) return sendRedirect(event, '/auth', 302)

  const currentDate = new Date() // Текущая дата
  let filter: any = {} // Начинаем с пустого фильтраD

  const types = [
    'buyouts service',
    'likes',
    'reviews',
    'questions',
    'productlikes',
    'carts',
    'autoanswers',
  ]

  switch (period) {
    case 'today':
      filter.dataoperation = {
        $gte: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate()
        ),
        $lt: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() + 1
        ),
      }
      break
    case 'yesterday':
      filter.dataoperation = {
        $gte: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() - 1
        ),
        $lt: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate()
        ),
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

  const history: any = await paymenthistory.find({
    user,
    ...filter,
  })

  // const count = history.length
  // let summ = 0
  // history.forEach((item: any) => {
  //   summ += item.summ
  // })
  const format: any = []

  if (period == 'week' || period == 'today' || period == 'yesterday') {
    const sumByDayArray = new Array(7).fill(0)
    const currentDate: any = new Date()
    const oneWeekAgo = new Date(currentDate)
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    oneWeekAgo.setHours(3, 0, 0, 0)

    const daysArray = []
    const date = new Date(oneWeekAgo)
    while (daysArray.length < 7) {
      let curDate = date.getDate().toString()
      let month = (date.getMonth() + 1).toString()
      curDate = curDate.toString().length == 1 ? '0' + curDate : curDate
      month = month.toString().length == 1 ? '0' + month : month
      daysArray.push(`${curDate}.${month}`)
      date.setDate(date.getDate() + 1)
    }

    const newHistory: any = await paymenthistory.find({
      user,
      type: filter.type,
      dataoperation: {
        $gte: oneWeekAgo,
        $lt: currentDate,
      },
    })

    for (const payment of newHistory) {
      const recordDate: any = new Date(payment.dataoperation)
      recordDate.setHours(3, 0, 0, 0)

      if (recordDate >= oneWeekAgo && recordDate <= currentDate) {
        const daysAgo = Math.floor(
          (currentDate - recordDate) / (24 * 60 * 60 * 1000)
        )
        if (daysAgo >= 0 && daysAgo < 7) {
          sumByDayArray[7 - daysAgo] += parseFloat(payment.summ)
        }
      }
    }
    format.data = sumByDayArray
    format.labels = daysArray
  } else if (period == 'month' || period == 'lastMonth') {
    const date = new Date()
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

    for (const payment of history) {
      const recordDate: any = new Date(payment.dataoperation)
      recordDate.setHours(3, 0, 0, 0)

      const daysAgo = Math.floor(
        (currentMonth - recordDate) / (24 * 60 * 60 * 1000)
      )

      if (daysAgo >= 0 && daysAgo < numberOfDaysInMonth) {
        sumByDayArray[numberOfDaysInMonth - 1 - daysAgo] += parseFloat(
          payment.summ
        )
      }
    }
    format.data = sumByDayArray

    format.labels = daysArray
  }

  const paymentsForSumm: any = await paymenthistory.find({
    user,
    dataoperation: filter.dataoperation,
    type: {
      $in: types,
    },
  })

  const typeSumMap = new Map()
  typeSumMap.set('all', 0)
  typeSumMap.set('all quantity', 0)
  types.forEach((type) => {
    typeSumMap.set(type, 0)
    typeSumMap.set(type + ' quantity', 0)
  })

  paymentsForSumm.forEach((payment: any) => {
    if (typeSumMap.has(payment.type)) {
      typeSumMap.set(
        payment.type,
        Number(typeSumMap.get(payment.type)) + Number(payment.summ)
      )
    } else {
      typeSumMap.set(payment.type, Number(payment.summ))
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
      value: 'reviews',
      title: 'Отзывы',
      expenses: 0,
      quantity: 0,
    },
    {
      value: 'likes',
      title: 'Лайки на отзывы',
      expenses: 0,
      quantity: 0,
    },
    {
      value: 'productlikes',
      title: 'Лайки на товар/бренд',
      expenses: 0,
      quantity: 0,
    },
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
    {
      value: 'autoanswer',
      title: 'Автоответчик',
      expenses: 0,
      quantity: 0,
    },
  ]

  typeSumMap.forEach((value, key) => {
    services.forEach((item) => {
      if (item.value == key) {
        item.expenses = value

        item.quantity = typeSumMap.get(key + ' quantity')
        services[0].quantity += item.quantity
        services[0].expenses = services[0].expenses + item.expenses
      }
    })
  })

  return { data: format.data, labels: format.labels, services }
})
