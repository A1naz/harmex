import ExcelJS from "exceljs";
import { DocuemntEnum } from "~/data/enums";
import { Review } from "~/server/lib/models/sutochno/Review";
import { Delivery } from "~/server/lib/models/sutochno/Delivery";
import { Buyout } from "~/server/lib/models/sutochno/Buyout";

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

  const reviews: any = await Review.find({
    user,
    date: {
      $gt: startDate,
      $lt: endDate,
    },
  }).sort({ _id: -1 });

  const availableReviews = await Delivery.find({
    user,
    reviewed: { $ne: true },
    "statusdelivery.status": { $regex: "Уже у вас" },
    status: "completed",
  }).sort({ _id: -1 });

  const postedDeliveries = await Delivery.find({
    _id: { $in: reviews.map((review: any) => review.delivery) },
    user,
  });

  const buyouts = await Buyout.find({
    user,
    uuid: { $in: availableReviews.map((review: any) => review.uuidbuyout) },
  });

  const format: any = reviews.map((review: any) => {
    const foundDelivery = postedDeliveries.find(
      (delivery: any) => delivery._id.valueOf() == review.delivery.valueOf()
    );

    return {
      _id: foundDelivery ? foundDelivery.uuidbuyout : "",
      date: review.publishDate ? review.publishDate : review.date,
      article: review.article,
      name: review.name,
      status: getStatus(review.status),
      text: review.text,
      positive: review.positive,
      negative: review.negative,
    };
  });

  for (const delivery of availableReviews) {
    const foundBuyout = buyouts.find(
      (buyout: any) => buyout.uuid == delivery.uuidbuyout
    );

    format.push({
      _id: foundBuyout ? foundBuyout.uuid : "",
      date: "",
      status: "Доступен",
      text: "",
      name: foundBuyout ? foundBuyout.product.name : "",
      article: foundBuyout ? foundBuyout.url : "",
    });
  }

  const workbook = new ExcelJS.Workbook();

  const sheet = workbook.addWorksheet("Отзывы", {
    headerFooter: { firstHeader: `Всего записей: ${reviews.length}` },
  });

  sheet.columns = [
    { header: "ID отзыва", key: "_id", font: { bold: true }, width: 48 },
    { header: "Ссылка", key: "article", font: { bold: true }, width: 18 },
    { header: "Название", key: "name", font: { bold: true }, width: 54 },
    { header: "Статус", key: "status", font: { bold: true }, width: 16 },
    { header: "Дата публикации", key: "date", font: { bold: true }, width: 16 },
    { header: "Текст", key: "text", font: { bold: true }, width: 44 },
    { header: "Плюсы", key: "positive", font: { bold: true }, width: 32 },
    { header: "Минусы", key: "negative", font: { bold: true }, width: 32 },
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
