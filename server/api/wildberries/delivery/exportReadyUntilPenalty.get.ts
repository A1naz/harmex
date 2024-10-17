import type { Document } from 'mongoose'

import { Buyout } from '~~/server/lib/models/wildberries/Buyout'
import { Buyoutlog } from '~~/server/lib/models/wildberries/Buyoutlog'
import { Delivery } from '~~/server/lib/models/wildberries/Delivery'
import ExcelJS from 'exceljs'
import { DocuemntEnum } from '~/data/enums'

const keys = Object.keys as <T>(
  obj: T
) => (keyof T extends infer U
  ? U extends string
    ? U
    : U extends number
      ? `${U}`
      : never
  : never)[]

async function getReady(user: Document) {
  const deliveries = await Delivery.find({ user }).sort({ _id: -1 }).limit(5000)
  const filtered = deliveries.filter((item) => {
    const currentstatus = item.statusdelivery?.length
      ? item.statusdelivery[item.statusdelivery.length - 1].status
      : 'Неизвестно'

    const curDate = new Date()

    const penaltyDate = item.statusdelivery[item.statusdelivery.length - 1].date
      ? new Date(
        new Date(
          item.statusdelivery[item.statusdelivery.length - 1].date,
        )?.getTime()
        + 1000 * 60 * 60 * 24 * 3,
      )
      : false

    if (!penaltyDate) {
      return false
    }

    return (
      (curDate > penaltyDate && currentstatus === 'Готов к выдаче')
      || (curDate > penaltyDate && currentstatus === 'Готов к получению')
    )
  })
  const buyoutsId = filtered.map(item => item.idbuyout)
  const buyouts = await Buyout.find({ _id: { $in: buyoutsId } })
  const logs = await Buyoutlog.find({ _id: { $in: buyoutsId } })

  const format = await Promise.all(
    filtered
      .map(async (delivery, index) => {
        const buyout = buyouts.find(
          buyout => buyout._id.valueOf() === delivery.idbuyout.valueOf(),
        )

        if (!buyout)
          return undefined
        const foundLog = logs.find(
          item =>
            item.buyout.valueOf() === buyout._id.valueOf()
            && item.text.includes('Выкуп выполнен'),
        )
        const finishDate = new Date(foundLog ? foundLog.date : buyout.createdAt)
        const place = index + 1
        const finishDateHours = finishDate.getHours()
        const finishDateMinutes = finishDate.getMinutes()
        const finishTime = `${finishDateHours
          .toString()
          .padStart(2, '0')}:${finishDateMinutes.toString().padStart(2, '0')}`

        const phone: any = delivery.recipientphone
        const replaced = `+${phone[0]} (***) *** ${phone.slice(7)}`
        const currentstatus = delivery.statusdelivery?.length
          ? delivery.statusdelivery[delivery.statusdelivery.length - 1].status
          : 'Неизвестно'
        const statusupdated = delivery.statusdelivery?.length
          ? new Date(
            delivery.statusdelivery[delivery.statusdelivery.length - 1].date,
          )
          : new Date()
        const deliveryDate = delivery.statusdelivery?.length
          ? new Date(
            delivery.statusdelivery?.find(
              item =>
                item.status === 'Готов к выдаче'
                || item.status === 'Готов к получению',
            )?.date,
          )
          : new Date()
        const expireDate = new Date(
          deliveryDate.getTime() + 1000 * 60 * 60 * 24 * 14,
        )
        return {
          index,
          place,
          uuid: buyout.uuid,
          article: delivery.article,
          pricebuy: delivery.pricebuy,
          size: buyout.sizeparam,
          point: delivery.point,
          deliveryDate,
          expireDate,
          statusdelivery: delivery.statusdelivery,
          currentstatus,
          statusupdated,
          productname: buyout.product.name,
          productimage: buyout.product.image,
          receiptcode: delivery.receiptcode ? delivery.receiptcode : undefined,
          receiptcodeqr: delivery.receiptcodeqr
            ? delivery.receiptcodeqr
            : undefined,
          recipient: delivery.recipient,
          createdAt: new Date(buyout.createdAt),
          recipientphone: replaced,
          finishDate,
          finishTime,
          updatedAt: new Date(delivery.updatedAt),
          key: buyout.ff ? 'Выкуп под ключ' : 'Выкуп',
        }
      })
      .filter(item => item !== undefined),
  )

  return format
}

export default eventHandler(async (event) => {
  try {
    const user = await getAdminEntity(event)
    if (!user)
      return sendRedirect(event, '/auth', 302)

    const workbook = new ExcelJS.Workbook()
    const ready = (await getReady(user)).filter(item => item !== undefined)

    const sheet = workbook.addWorksheet('Готовы к выдаче', {
      headerFooter: { firstHeader: `Всего доставок: ${ready.length}` },
    })

    sheet.columns = [
      { header: 'Номер', key: 'place', font: { bold: true } },
      { header: 'QR код', key: 'receiptcode', width: 24, font: { bold: true } },
      {
        header: 'Статус',
        key: 'currentstatus',
        width: 16,
        font: { bold: true },
      },
      { header: 'Товар', key: 'productname', width: 48, font: { bold: true } },
      { header: 'Артикул', key: 'article', width: 16, font: { bold: true } },
      { header: 'Размер', key: 'size', width: 16, font: { bold: true } },
      {
        header: 'Дата создания заказа',
        key: 'finishDate',
        width: 16,
        font: { bold: true },
      },
      {
        header: 'Время создания заказа',
        key: 'finishTime',
        width: 16,
        font: { bold: true },
      },
      {
        header: 'Дата доставки в ПВЗ',
        key: 'deliveryDate',
        width: 16,
        font: { bold: true },
      },
      {
        header: 'Дата окончания срока забора с ПВЗ',
        key: 'expireDate',
        width: 16,
        font: { bold: true },
      },
      {
        header: 'Код ПВЗ',
        key: 'receiptcode',
        width: 16,
        font: { bold: true },
      },
      { header: 'ID Выкупа', key: 'uuid', width: 16, font: { bold: true } },
      { header: 'ПВЗ', key: 'point', width: 64, font: { bold: true } },
      {
        header: 'Получатель',
        key: 'recipient',
        width: 16,
        font: { bold: true },
      },
      {
        header: 'Телефон',
        key: 'recipientphone',
        width: 16,
        font: { bold: true },
      },
      {
        header: 'Дата обновления',
        key: 'updatedAt',
        width: 16,
        font: { bold: true },
      },
      {
        header: 'Тип выкупа',
        key: 'key',
        width: 16,
        font: { bold: true },
      },
    ]

    sheet.addRows(ready)
    // add qr codes to sheet

    for (const item of ready) {
      if (
        !item?.receiptcodeqr
        || item?.receiptcodeqr?.length < 40
        || item?.receiptcodeqr === 'undefined'
      ) {
        continue
      }

      if (
        item.receiptcodeqr.includes(
          'data:image/png;base64,data:image/png;base64,',
        )
      ) {
        item.receiptcodeqr = item.receiptcodeqr.replace(
          'data:image/png;base64,',
          '',
        )
      }

      const image = workbook.addImage({
        base64: item?.receiptcodeqr,
        extension: 'png',
      })
      sheet.addImage(image, {
        tl: { col: 1.5, row: item!.place + 0.8 },
        ext: { width: 100, height: 100 },
      })
      sheet.getRow(item!.place + 1).height = 100
    }
    // export table
    const buffer = await workbook.xlsx.writeBuffer()

    // await userLog(event, {
    //   documentType: DocuemntEnum.Delivery,
    //   documentId: '',
    //   comment: 'Экспорт доставок готовых к выдаче',
    // })

    return buffer
  }
  catch (e) {
    console.log(e)
    throw createError({
      statusCode: 500,
      message: 'Не удалось создать таблицу',
    })
  }
})
