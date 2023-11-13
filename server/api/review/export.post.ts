import ExcelJS from 'exceljs'
import { Review } from '~/server/lib/models/Review'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

    const { exportDates } = await readBody(event)

    const startDate = new Date(exportDates[0])
    const endDate = new Date(exportDates[1])

    const reviews = await Review.find({
    user,
    date: {
        $gt: startDate,
        $lt: endDate,
    }
    }).sort({ _id: -1 })

    const workbook = new ExcelJS.Workbook()

    const sheet = workbook.addWorksheet('Отзывы', {
    headerFooter: { firstHeader: `Всего записей: ${reviews.length}` },
    })

    sheet.columns = [
        { header: 'ID отзыва', key: '_id', font: { bold: true } },
        { header: 'Дата публикации', key: 'date', font: { bold: true } },
        { header: 'Статус', key: 'status', font: { bold: true } },
        { header: 'Текст', key: 'text', font: { bold: true } },
        { header: 'Рейтинг', key: 'rating', font: { bold: true } },
        { header: 'Фото', key: 'images', font: { bold: true } },
    ]

    sheet.addRows(reviews)
    const buffer = await workbook.xlsx.writeBuffer()
    return buffer
})
