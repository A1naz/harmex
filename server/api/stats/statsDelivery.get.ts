import { Delivery } from '~/server/lib/models/Delivery'
import { Delivery as OzonDelivery } from '~/server/lib/models/ozon/Delivery';
import { Delivery as WildberriesDelivery } from '~/server/lib/models/wildberries/Delivery';
import { Delivery as AvitoDelivery } from '~/server/lib/models/avito/Delivery';

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
    let deliveriesOzon = []
    let deliveriesWildberries = []
    let deliveriesAvito = []
  if(type=='all'){
    deliveriesOzon = await OzonDelivery.find({ 
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

    deliveriesWildberries = await WildberriesDelivery.find({ 
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

    deliveriesAvito = await AvitoDelivery.find({ 
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
      if(type=='В пути'){
        console.log(type);
        const type2 = 'Передаётся в доставку'
        deliveriesOzon = await OzonDelivery.find({ 
          user, 
          updatedAt: filter.dataoperation,
          $or: [
              { article: { $regex: search, $options: 'i' } },
              { point: { $regex: search, $options: 'i' } },
              { uuidbuyout: { $regex: search, $options: 'i' } }
          ],
          $expr: {
              $or: [
                  { $eq: [ { $arrayElemAt: ["$statusdelivery.status", -1] }, type ] },
                  { $eq: [ { $arrayElemAt: ["$statusdelivery.status", -1] }, type2 ] }
              ]
          }
      });
      }else if(type=='Готов к выдаче'){
        console.log(type);
        const type2 = 'Ожидает получения до'
        deliveriesOzon = await OzonDelivery.find({ 
          user, 
          updatedAt: filter.dataoperation,
          $or: [
              { article: { $regex: search, $options: 'i' } },
              { point: { $regex: search, $options: 'i' } },
              { uuidbuyout: { $regex: search, $options: 'i' } }
          ],
          $expr: {
              $regexMatch: {
                  input: { $arrayElemAt: ["$statusdelivery.status", -1] },
                  regex: type2,
                  options: "i" 
              }
          }
      });
      }else if(type=='Получено'){
        console.log(type);
        const type2 = 'Получен'
        deliveriesOzon = await OzonDelivery.find({ 
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
                  type2
              ]
          }
        }) 
      }
      else{
        deliveriesOzon = await OzonDelivery.find({ 
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
      deliveriesWildberries = await WildberriesDelivery.find({ 
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
          
      deliveriesAvito = await AvitoDelivery.find({ 
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

    deliveriesOzon.forEach((item: any) => {
      const sentToAssembly = item.statusdelivery[0];
      const receiptDate = item.statusdelivery.find((item: any) => item.status.includes("Ожидает получения до"));
      const receiveDate = item.statusdelivery.find((item: any) => item.status === 'Получен');
      const status = item.statusdelivery?.length ? item.statusdelivery[item.statusdelivery.length - 1].status : 'Неизвестно';
      
      
          lastElements.push({
            article: item.article,
            pvz: item.point,
            status: status === 'Передается в доставку' ? 'В пути' : status,
            purchaseDate: sentToAssembly?.date  || '',
            id: item.uuidbuyout,
            receiptDate: receiptDate?.date || '',
            receiveDate: receiveDate?.date || '',
            mp:'ozon',
          })
    })

    deliveriesWildberries.forEach((item: any) => {
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
            mp:'wildberries',
          })
        
    })

    deliveriesAvito.forEach((item: any) => {
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
            mp:'avito',
          })
        
    })
    return { lastElements}
  }
  // if (!deliveries) return []
  const deliveriesOzon = await OzonDelivery.find({ user, updatedAt: filter.dataoperation })
  const deliveriesWildberries = await WildberriesDelivery.find({ user, updatedAt: filter.dataoperation })
  const deliveriesAvito = await AvitoDelivery.find({ user, updatedAt: filter.dataoperation })
  const purchase = deliveriesOzon.length + deliveriesWildberries.length
  
  
  let inTransit = 0;
  let ready = 0;
  let received = 0;
  let cancelled = 0;
  let reviews = 0

  deliveriesOzon.forEach((item: any) => {
    const status = item.statusdelivery?.length ? item.statusdelivery[item.statusdelivery.length - 1].status : 'Неизвестно';
    if (status === 'В пути' || status === 'Передаётся в доставку') {
      inTransit++;
    } else if (status.includes("Ожидает получения до")) {
        ready++;
        
    } else if (status === 'Получен') {
        received++;
        if(item.reviewed === false) reviews++;
        
    } else if (item.status === 'canceled') {
        cancelled++;
        
    } 
    
  })
  deliveriesWildberries.forEach((item: any) => {
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

  deliveriesAvito.forEach((item: any) => {
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

  return {purchase , inTransit, ready, received, cancelled , reviews}
})
