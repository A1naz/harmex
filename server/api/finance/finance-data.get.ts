// server/api/finance-data.ts
export default defineEventHandler(() => {
    return [
      {
        number: '1',
        date: '10.10.2022',
        source: 'Тарифы',
        direction: 'Telegram',
        status: 'work',
        summ: 25000,
        comment: '',
      },
      {
        number: '2',
        date: '11.10.2022',
        source: 'Перевод',
        direction: 'Rutube',
        status: 'work',
        summ: 18000,
        comment: '',
      },
      {
        number: '3',
        date: '12.10.2022',
        source: 'Услуга',
        direction: 'Instagram',
        status: 'active',
        summ: 5000,
        comment: '',
      },
      // Add more mock data as needed
    ]
  })
  