import expensesData from './expensesData'
import generalData from './generalData'
import partnerData from './partnerData'
import replenishmentData from './replenishmentData'

function formatNumber(value: number): string {
  return value.toLocaleString('ru-RU')
}

export default defineEventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user)
    return sendRedirect(event, '/', 302)

  const { tableType, page, itemsPerPage, skip}: any = getQuery(event)

  switch (tableType) {
    case 'general':
    {
      const data: any[] = await generalData(user, itemsPerPage, page, skip)
      return data
    }
    case 'replenishment':
    {
      const data: any[] = await replenishmentData(user, itemsPerPage, page, skip)
      return data
    }
    case 'expenses':
    {
      const data: any[] = await expensesData(user, itemsPerPage, page, skip)
      return data
    }
    case 'partner':
    {
      const data: any[] = await partnerData(user, itemsPerPage, page, skip)
      return data
    }

    default: return [
      {
        summ: formatNumber(25000),
        date: '2022-01-01',
        executionDate: '2022-01-02',
        mp: 'wildberries',
        service: 'Выкуп',
        article: 12345,
        orderId: '12345',
        comment: 'Комментарий',
        history: true,
        source: 'Кошелек',
        username: '+77777777777777',
        commission: formatNumber(2000),
      },
      {
        summ: formatNumber(25000),
        date: '2022-01-01',
        executionDate: '2022-01-02',
        mp: 'wildberries',
        service: 'Выкуп',
        article: 12345,
        orderId: '12345',
        comment: 'Комментарий',
        history: true,
        source: 'Кошелек',
        username: '+77777777777777',
        commission: 2000,
      },
      {
        summ: formatNumber(25000),
        date: '2022-01-01',
        executionDate: '2022-01-02',
        mp: 'wildberries',
        service: 'Выкуп',
        article: 12345,
        orderId: '12345',
        comment: 'Комментарий',
        history: true,
        source: 'Кошелек',
        username: '+77777777777777',
        commission: formatNumber(2000),
      },
      {
        summ: formatNumber(25000),
        date: '2022-01-01',
        executionDate: '2022-01-02',
        mp: 'wildberries',
        service: 'Выкуп',
        article: 12345,
        orderId: '12345',
        comment: 'Комментарий',
        history: true,
        source: 'Кошелек',
        username: '+77777777777777',
        commission: formatNumber(2000),
      },
      {
        summ: formatNumber(25000),
        date: '2022-01-01',
        executionDate: '2022-01-02',
        mp: 'wildberries',
        service: 'Выкуп',
        article: 12345,
        orderId: '12345',
        comment: 'Комментарий',
        history: true,
        source: 'Кошелек',
        username: '+77777777777777',
        commission: formatNumber(2000),
      },
      {
        summ: formatNumber(25000000),
        date: '2022-01-01',
        executionDate: '2022-01-02',
        mp: 'wildberries',
        service: 'Выкуп',
        article: 12345,
        orderId: '12345',
        comment: 'Комментарий',
        history: true,
        source: 'Кошелек',
        username: '+77777777777777',
        commission: formatNumber(2000),
      },
      {
        summ: formatNumber(25000),
        date: '2022-01-01',
        executionDate: '2022-01-02',
        mp: 'wildberries',
        service: 'Выкуп',
        article: 12345,
        orderId: '12345',
        comment: 'Комментарий',
        history: true,
        source: 'Кошелек',
        username: '+77777777777777',
        commission: formatNumber(2000),
      },
    ]
  }

  return [
    {
      summ: formatNumber(25000),
      date: '2022-01-01',
      executionDate: '2022-01-02',
      mp: 'wildberries',
      service: 'Выкуп',
      article: 12345,
      orderId: '12345',
      comment: 'Комментарий',
      history: true,
      source: 'Кошелек',
      username: '+77777777777777',
      commission: formatNumber(2000),
    },
    {
      summ: formatNumber(25000),
      date: '2022-01-01',
      executionDate: '2022-01-02',
      mp: 'wildberries',
      service: 'Выкуп',
      article: 12345,
      orderId: '12345',
      comment: 'Комментарий',
      history: true,
      source: 'Кошелек',
      username: '+77777777777777',
      commission: 2000,
    },
    {
      summ: formatNumber(25000),
      date: '2022-01-01',
      executionDate: '2022-01-02',
      mp: 'wildberries',
      service: 'Выкуп',
      article: 12345,
      orderId: '12345',
      comment: 'Комментарий',
      history: true,
      source: 'Кошелек',
      username: '+77777777777777',
      commission: formatNumber(2000),
    },
    {
      summ: formatNumber(25000),
      date: '2022-01-01',
      executionDate: '2022-01-02',
      mp: 'wildberries',
      service: 'Выкуп',
      article: 12345,
      orderId: '12345',
      comment: 'Комментарий',
      history: true,
      source: 'Кошелек',
      username: '+77777777777777',
      commission: formatNumber(2000),
    },
    {
      summ: formatNumber(25000),
      date: '2022-01-01',
      executionDate: '2022-01-02',
      mp: 'wildberries',
      service: 'Выкуп',
      article: 12345,
      orderId: '12345',
      comment: 'Комментарий',
      history: true,
      source: 'Кошелек',
      username: '+77777777777777',
      commission: formatNumber(2000),
    },
    {
      summ: formatNumber(25000000),
      date: '2022-01-01',
      executionDate: '2022-01-02',
      mp: 'wildberries',
      service: 'Выкуп',
      article: 12345,
      orderId: '12345',
      comment: 'Комментарий',
      history: true,
      source: 'Кошелек',
      username: '+77777777777777',
      commission: formatNumber(2000),
    },
    {
      summ: formatNumber(25000),
      date: '2022-01-01',
      executionDate: '2022-01-02',
      mp: 'wildberries',
      service: 'Выкуп',
      article: 12345,
      orderId: '12345',
      comment: 'Комментарий',
      history: true,
      source: 'Кошелек',
      username: '+77777777777777',
      commission: formatNumber(2000),
    },
    // Add more mock data as needed
  ]
})
