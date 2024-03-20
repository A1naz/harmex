import { Delivery } from '~/server/lib/models/Delivery'

export default eventHandler(async (event) => {

  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const { period, type } = getQuery(event)

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

  const deliveries = await Delivery.find({ user, updatedAt: filter.dataoperation, })
  
  const purchase = deliveries.length
  
  const lastElements: any[] = []
  let inTransit = 0;
  let ready = 0;
  let received = 0;
  let cancelled = 0;

  deliveries.forEach((item: any) => {
    const sentToAssembly = item.statusdelivery.find((item: any) => item.status === 'Отправлен на сборку');
    const receiptDate = item.statusdelivery.find((item: any) => item.status === 'Готов к выдаче');
    const receiveDate = item.statusdelivery.find((item: any) => item.status === 'Получено');
    const status = item.statusdelivery?.length ? item.statusdelivery[item.statusdelivery.length - 1].status : 'Неизвестно';

    if (status === 'В пути') {
      inTransit++;
      if(type === 'inTransit'){
        lastElements.push({
          article: item.article,
          pvz: item.point,
          status: status,
          purchaseDate: sentToAssembly?.date || '',
          id: item.uuidbuyout,
          receiptDate: receiptDate?.date || '',
          receiveDate: receiveDate?.date || '',
        })
      }
    } else if (status === 'Готов к выдаче') {
        ready++;
        if(type === 'ready'){
          lastElements.push({
            article: item.article,
            pvz: item.point,
            status: status,
            purchaseDate: sentToAssembly?.date || '',
            id: item.uuidbuyout,
            receiptDate: receiptDate?.date || '',
            receiveDate: receiveDate?.date || '',
          })
        }
    } else if (status === 'Получено') {
        received++;
        if(type === 'picked'){
          lastElements.push({
            article: item.article,
            pvz: item.point,
            status: status,
            purchaseDate: sentToAssembly?.date || '',
            id: item.uuidbuyout,
            receiptDate: receiptDate?.date || '',
            receiveDate: receiveDate?.date || '',
          })
        }
    } else if (item.status === 'canceled') {
        cancelled++;
        if(type === 'canceled'){
          lastElements.push({
            article: item.article,
            pvz: item.point,
            status: status,
            purchaseDate: sentToAssembly?.date || '',
            id: item.uuidbuyout,
            receiptDate: receiptDate?.date || '',
            receiveDate: receiveDate?.date || '',
          })
        }
    } 

    if (type === 'all') {
        lastElements.push({
          article: item.article,
          pvz: item.point,
          status: status,
          purchaseDate: sentToAssembly?.date || '',
          id: item.uuidbuyout,
          receiptDate: receiptDate?.date || '',
          receiveDate: receiveDate?.date || '',
        })
      }
  
    
  })

  return {lastElements, purchase , inTransit, ready, received, cancelled}
})
