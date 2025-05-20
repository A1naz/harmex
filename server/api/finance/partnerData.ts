import { PartnerPaymentHistory } from "~/server/lib/models/PartnerPaymentHistory";
import { paymenthistory } from "~/server/lib/models/Paymenthistory";

function getRussianServiceNames(role: string) {
  switch (role) {
    case "buyouts":
      return "Выкуп";
    case "buyouts service":
      return "Выкуп";
    case "deliveryStorage":
      return "Штраф";
    case "review":
      return "Отзыв";
    case "likeReview":
      return "Лайк на отзыв";
    case "likeProduct":
      return "Лайк на товар / бренд";
    case "cart":
      return "Добавление в корзину";
    case "questionProduct":
      return "Вопрос";
    case "reviewRemoving":
      return "Удаление отзыва";
    default:
      return "";
  }
}

export default async function (
  user: any,
  itemsPerPage?: number,
  page?: number,
  skip?: number,
  dateRange?: any
) {
  const limit = itemsPerPage ? itemsPerPage : 25;
  const skipValue = skip ? skip : 25;

  const res = await PartnerPaymentHistory.find({ user, ...dateRange })
    .sort({ _id: -1 })
    .skip(page ? (page - 1) * skipValue : 0)
    .limit(page ? limit : 100000);

    const histories = await paymenthistory.find({
      _id: { $in: res.map((el: any) => el.paymenthistory) },
    });

  const format = res.map((el: any) => {
    const foundHistory = histories.find(
      (history: any) => history._id.valueOf() == el.paymenthistory.valueOf()
    )

    return {
      summ: el.amount.toFixed(2).toString(),
      date: el.date,
      source: foundHistory ? foundHistory.mp : "",
      service: foundHistory ? getRussianServiceNames(foundHistory.type || "") : "",
    };
  });

  return format;
}
