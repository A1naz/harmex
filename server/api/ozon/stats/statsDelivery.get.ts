import { Delivery } from '~/server/lib/models/ozon/Delivery'

export default eventHandler(async (event) => {

  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const { period, type, skip, limit, searchQuery } = getQuery(event)

  const search = searchQuery?.toString()

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


    const lastElements: any[] = []

    if(limit && skip){
      let deliveries = []
    if(type=='all'){
      deliveries = await Delivery.find({ 
        user, 
        updatedAt: filter.dataoperation,
        $or: [
            { article: { $regex: search, $options: 'i' } },
            { point: { $regex: search, $options: 'i' } },
            { uuidbuyout: { $regex: search, $options: 'i' } }
        ],
      })
      .limit(limit as number)
      .skip(skip as number);
      }else{
        deliveries = await Delivery.find({ 
          user, 
          updatedAt: filter.dataoperation,
          $or: [
              { article: { $regex: search, $options: 'i' } },
              { point: { $regex: search, $options: 'i' } },
              { uuidbuyout: { $regex: search, $options: 'i' } }
          ],
          $expr: {
              $eq: [
                  { $arrayElemAt: ["$statusdelivery.status", -1] }, 
                  type
              ]
          }
      })    
      
      
      }

      deliveries.forEach((item: any) => {
        const sentToAssembly = item.statusdelivery[0];
        const receiptDate = item.statusdelivery.find((item: any) => item.status === 'Готов к выдаче');
        const receiveDate = item.statusdelivery.find((item: any) => item.status === 'Получено');
        const status = item.statusdelivery?.length ? item.statusdelivery[item.statusdelivery.length - 1].status : 'Неизвестно';
    
        
            lastElements.push({
              article: item.article,
              pvz: item.point,
              status: status,
              purchaseDate: sentToAssembly?.date || '',
              id: item.uuidbuyout,
              receiptDate: receiptDate?.date || '',
              receiveDate: receiveDate?.date || '',
              mp:'ozon',
            })
          
      })
      return { lastElements}
    }

  const deliveries = await Delivery.find({ user, updatedAt: filter.dataoperation, })
  
  const purchase = deliveries.length
  
  
  let inTransit = 0;
  let ready = 0;
  let received = 0;
  let cancelled = 0;
  let reviews = 0

  deliveries.forEach((item: any) => {
    const status = item.statusdelivery?.length ? item.statusdelivery[item.statusdelivery.length - 1].status : 'Неизвестно';

    if (status === 'В пути') {
      inTransit++;
      
    } else if (status === 'Готов к выдаче') {
        ready++;
        
    } else if (status === 'Получено') {
        received++;
        if(item.reviewed === false) reviews++;
        
    } else if (item.status === 'canceled') {
        cancelled++;
        
    } 
  
    
  })

  return {lastElements, purchase , inTransit, ready, received, cancelled , reviews}
})
