import { Buyout } from "@/server/lib/models/ozon/Buyout";
import { paymenthistory } from "@/server/lib/models/Paymenthistory";

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event);
  if (!user) return sendRedirect(event, "/auth", 302);

  const { string, type } = getQuery(event);

  // const all = await Buyout.find({ user })
  // let buyouts
  // if (type === 'article') {
  //   buyouts = await Buyout.find({ user, article: string })
  //     .sort({ createdAt: -1 })
  // }
  // else
  // if (type === 'uuid') {
  //   const uuid = string?.toString().replaceAll('#', '')
  //   buyouts = await Buyout.find({ user, uuid })
  //     .sort({ createdAt: -1 })
  // }
  // else if (type === 'name') {
  //   buyouts = await Buyout.find({ user, $text: { $search: string } })
  //     .sort({ createdAt: -1 })
  // }
  // else {
  //   buyouts = await Buyout.find({ user })
  //     .sort({ createdAt: -1 })
  //     .skip(0)
  //     .limit(50)
  // }

  const found = await Buyout.find({
    user: user._id,
    $or: [
      { uuid: string },
      { article: Number.isNaN(Number(string)) ? 0 : Number(string) },
      { "product.name": { $regex: string, $options: "i" } },
    ],
  }).limit(200);

  const buyoutUuids = found.map((buyout) => "Выкуп #" + buyout.uuid);
  const history = await paymenthistory.find({
    basisoperation: { $in: buyoutUuids },
    type: "buyouts service",
  });

  const format = found.map((buyout, index) => {
    const historyItem = history.find(
      (item) => item.basisoperation === "Выкуп #" + buyout.uuid
    );

    return {
      place: buyout.place,
      uuid: buyout.uuid,
      article: buyout.article,
      searchQuery: buyout.searchQuery,
      point: buyout.point,
      dateStart: buyout.dateStart,
      dateEnd: buyout.dateEnd,
      sizeparam: buyout.sizeparam,
      quantity: buyout.quantity,
      gender: buyout.gender,
      status: buyout.status,
      completed: buyout.completed,
      rules: buyout.rules,
      createdAt: buyout.createdAt,
      product: buyout.product,
      discount: buyout.discount,
      discountPrice: buyout.discountPrice,
      discountRequestPrice: buyout.discountRequestPrice,
      purchaseSoon: buyout.purchaseSoon,
      key: buyout.key,
      FIO: buyout.FIO,
      discountRequestTime: buyout.discountRequestTime,
      promocode: buyout.promocode,
      executionTime: historyItem ? historyItem.dataoperation : null,
      financePrice: historyItem ? historyItem.summ : null,
    };
  });
  return format;
});
