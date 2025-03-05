import ExcelJS from "exceljs";
import { DocuemntEnum } from "~/data/enums";
import { Review } from "~/server/lib/models/ozon/Review";
import { Delivery } from "~/server/lib/models/ozon/Delivery";

const getStatus = (status: string) => {
  switch (status) {
    case "created":
      return "Создан";
    case "working":
      return "В работе";
    case "waiting":
      return "Ожидание";
    case "work":
      return "В работе";
    case "published":
      return "Опубликован";
    case "canceled":
      return "Отменен";
    case "nofunds":
      return "Недостаточно средств";
    case "deleting":
      return "Удаление";
    case "deleted":
      return "Удален";
    case "available":
      return "Доступен";
    default:
      return status;
  }
};

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event);
  if (!user) return sendRedirect(event, "/auth", 302);

  const { exportDates } = await readBody(event);

  const startDate = new Date(exportDates[0]);
  const endDate = new Date(exportDates[1]);

  const reviews = await Review.find({
    user,
    date: {
      $gt: startDate,
      $lt: endDate,
    },
  }).sort({ _id: -1 });

  const availableReviews = await Delivery.find({
    user,
    reviewed: { $ne: true },
    "statusdelivery.status": { $regex: "Получен" },
    status: "completed",
  }).sort({ _id: -1 });

  const format: any = reviews.map((review: any) => {
    return {
      _id: review._id,
      date: review.date,
      article: review.article,
      name: review.name,
      status: getStatus(review.status),
      text: review.text
    };
  });

  for (const delivery of availableReviews) {
    format.push({
      _id: delivery._id,
      date: "",
      status: "Доступен",
      text: "",
    });
  }

  const workbook = new ExcelJS.Workbook();

  const sheet = workbook.addWorksheet("Отзывы", {
    headerFooter: { firstHeader: `Всего записей: ${reviews.length}` },
  });

  sheet.columns = [
    { header: "ID отзыва", key: "_id", font: { bold: true }, width: 25 },
    { header: "Артикул", key: "article", font: { bold: true }, width: 16 },
    { header: "Название", key: "name", font: { bold: true }, width: 54 },
    { header: "Статус", key: "status", font: { bold: true }, width: 16 },
    { header: "Дата публикации", key: "date", font: { bold: true }, width: 16 },
    { header: "Текст", key: "text", font: { bold: true }, width: 44 }
  ];

  sheet.addRows(format);
  const buffer = await workbook.xlsx.writeBuffer();

  await userLog(event, {
    documentType: DocuemntEnum.Review,
    documentId: "",
    comment: "Экспорт отзывов",
  });

  return buffer;
});
