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

  const { tableType, page, itemsPerPage, skip }: any = getQuery(event)

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
    case 'genealogy':
      {
        const data: any[] = await genealogyData(user, itemsPerPage, page, skip)
        return data
      }

    default: return []
  }

})
