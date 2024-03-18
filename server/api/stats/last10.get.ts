import { Delivery } from '~/server/lib/models/Delivery'

export default eventHandler(async (event) => {

  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const buyouts = await Delivery.find({ user }).sort({ createdAt: -1 }).limit(10)
  // console.log('buyouts', buyouts)
  
  
  const lastElements: any[] = []
  buyouts.forEach((item: any) => {
    const sentToAssembly = item.statusdelivery.find((item: any) => item.status === 'Отправлен на сборку');
    const receiptDate = item.statusdelivery.find((item: any) => item.status === 'Готов к выдаче');
    const receiveDate = item.statusdelivery.find((item: any) => item.status === 'Получено');
    lastElements.push({
      article: item.article,
      pvz: item.point,
      status: item.statusdelivery?.length
      ? item.statusdelivery[item.statusdelivery.length - 1].status
      : 'Неизвестно',
      purchaseDate: sentToAssembly?.date || '',
      id: item.uuidbuyout,
      receiptDate: receiptDate?.date || '',
      receiveDate: receiveDate?.date || '',
    })
  })

  return lastElements
})
