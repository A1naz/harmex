import expensesData from './expensesData'
import generalData from './generalData'
import partnerData from './partnerData'
import replenishmentData from './replenishmentData'
import genealogyData from './genealogyData'

function formatNumber(value: number): string {
  return value.toLocaleString('ru-RU')
}

export default defineEventHandler(async (event) => {

  const user = await getAdminEntity(event)
  if (!user)
    return sendRedirect(event, '/', 302)

  const { tableType, page, itemsPerPage, skip, searchInput, dateRange }: any = getQuery(event)


  let trueDateRange = {
  }
  if (dateRange) {
    const date1 = new Date(JSON.parse(dateRange[0]))
    date1.setHours(0, 0, 0, 0)
    const date2 = new Date(JSON.parse(dateRange[1]))
    date2.setHours(23, 59, 0, 0)


    trueDateRange = {
      dataoperation: {
        $lte: date2,
        $gte: date1,
      },
    }
  } else {
    trueDateRange = {
      dataoperation: {
        $lte: new Date(),
        $gte: new Date(new Date('2020-01-01')),
      },
    }
  }

  switch (tableType) {
    case 'general':
      {
        const data: any[] = await generalData(user, itemsPerPage, page, skip, trueDateRange, searchInput)
        return data
      }
    case 'replenishment':
      {
        const data: any[] = await replenishmentData(user, itemsPerPage, page, skip, trueDateRange, searchInput)
        return data
      }
    case 'expenses':
      {
        const data: any[] = await expensesData(user, itemsPerPage, page, skip, trueDateRange, searchInput)
        return data
      }
    case 'partner':
      {
        const data: any[] = await partnerData(user, itemsPerPage, page, skip)
        return data
      }
    case 'genealogy':
      {
        const data: any[] = await genealogyData(user, itemsPerPage, page, skip)
        return data
      }

    default: return []
  }

})
