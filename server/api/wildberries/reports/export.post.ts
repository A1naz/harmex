import ExcelJS from 'exceljs'
import { paymenthistory } from '~~/server/lib/models/Paymenthistory'
import { Report } from '~~/server/lib/models/wildberries/Report'
import { Buyout } from '~~/server/lib/models/wildberries/Buyout'
import { DocuemntEnum } from '~/data/enums'
import axios from 'axios';

export default eventHandler(async (event) => {
    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

    const { exportDates } = await readBody(event)

    const format = []
    const startDate = new Date(exportDates[0])
    const endDate = new Date(exportDates[1])
    const history = await Report.find({
        user,
        date: {
            $gt: startDate,
            $lt: endDate,
        },
    }).sort({ _id: -1 })

    // Создание массива обещаний для запросов на загрузку изображений
    const promises = [];

    // Загрузка данных и изображений
    for await (const [index, item] of history.entries()) {
        const buyout = await Buyout.findOne({ _id: item.buyout })
        if (!buyout) continue

        const logoImage = []
        const productImageResponse = await axios.get(buyout.product.image, { responseType: 'arraybuffer' })
        .catch(error => {
            // console.error('Failed to fetch product image:', error);
        });
        if (productImageResponse) {
            const base64ProductImage = `data:${productImageResponse.headers['content-type']};base64,` + Buffer.from(productImageResponse.data).toString('base64');
            logoImage.push(base64ProductImage);
        }

        const screenshotsData = []
        for (const screenshotUrl of item.screenshots) {
            const promise = axios.get(screenshotUrl, { responseType: 'arraybuffer' })
                .then(response => {
                    const base64Image = `data:${response.headers['content-type']};base64,` + Buffer.from(response.data).toString('base64');
                    screenshotsData.push(base64Image);
                })
                .catch(error => {
                    // console.error('Failed to fetch screenshot:', error);
                });
            promises.push(promise);
        }

        
        await Promise.all(promises); 

        format.push({
            date: item.date,
            card: item.card,
            screenshots: screenshotsData,
            place: buyout.place,
            uuid: buyout.uuid,
            image: logoImage[0],
            number: index + 1,
            mp: 'Wildberries',
        })
    }

    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('История платежей', {
        headerFooter: { firstHeader: `Всего записей: ${format.length}` },
    })

    sheet.columns = [
        // { header: 'Номер', key: 'number', font: { bold: true } },
        { header: 'Товар', key: '',width: 17, font: { bold: true } },
        { header: 'Номер выкупа', key: 'place',width: 16, font: { bold: true } },
        { header: 'Дата выкупа', key: 'date', width: 16, font: { bold: true } },
        { header: 'Маркетплейс', key: 'mp', width: 16, font: { bold: true } },
        { header: 'ID выкупа', key: 'uuid', width: 32, font: { bold: true } },
        { header: 'Скриншоты', key: '', width: 17, font: { bold: true } },
        { header: '', key: '', width: 17, font: { bold: true } },
        { header: '', key: '', width: 17, font: { bold: true } },
        { header: '', key: '', width: 17, font: { bold: true } },
    ]


    sheet.addRows(format)
    sheet.getColumn('uuid').eachCell((cell) => {
      const width = cell.text.length * 1; // Вы можете настроить коэффициент 1.2 в зависимости от вашего шрифта и стиля
      if (width > sheet.getColumn('uuid').width) {
          sheet.getColumn('uuid').width = width; // Установка ширины столбца
      }
  });

for (const item of format) {
  let currentColumn = 6; 
  for (const base64Image of item.screenshots) {
      const image = workbook.addImage({
          base64: base64Image,
          extension: 'png',
      });
      sheet.addImage(image, {
          tl: { col: currentColumn, row: format.indexOf(item) + 1 }, 
          ext: { width: 112, height: 200 }, 
      });
      currentColumn++; 
  }
  const productImage = workbook.addImage({
      base64: item.image, 
      extension: 'png',
  });
  sheet.addImage(productImage, {
      tl: { col: 1, row: format.indexOf(item) + 1 }, 
      ext: { width: 112, height: 200 }, 
  });


  sheet.getRow(format.indexOf(item) + 2).height = 200; 
}





    const buffer = await workbook.xlsx.writeBuffer()

    await userLog(event, {
        documentType: DocuemntEnum.Report,
        documentId: '',
        comment: 'Экспорт отчетов по выкупам'
    })

    return buffer
})
