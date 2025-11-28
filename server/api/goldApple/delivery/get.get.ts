import { Delivery } from "~~/server/lib/models/goldApple/Delivery";
import { Buyout } from "~~/server/lib/models/goldApple/Buyout";
import { getAdminEntity } from "~/server/utils/getAdmin";

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event);
  if (!user) return sendRedirect(event, "/auth", 302);

  const { status, limit, skip,string } = getQuery(event);

  // const all = await Delivery.find({ user })
  let deliveries;
  let searchOption = {};
  if (string) {
    const uuid = string?.toString().replaceAll("#", "");
    searchOption = {
      $or: [
        { uuidbuyout: uuid },
        { point: { $regex: string, $options: "i" } },
        { article: Number(string) },
        { article: string },
      ],
    };
  }
  if (status === "all") {
    // Используем агрегацию для приоритетной сортировки
    deliveries = await Delivery.aggregate([
      {
        $match: { user: user._id, ...searchOption }
      },
      {
        $addFields: {
          // Определяем приоритет сортировки
          sortPriority: {
            $cond: {
              if: {
                $and: [
                  { $ne: ["$status", "completed"] },
                  {
                    $eq: [
                      { $arrayElemAt: ["$statusdelivery.status", -1] },
                      "готов к выдаче"
                    ]
                  }
                ]
              },
              then: 1, // Готовые к выдаче
              else: {
                $cond: {
                  if: { $eq: ["$status", "active"] },
                  then: 2, // Активные
                  else: 3  // Все остальные
                }
              }
            }
          }
        }
      },
      {
        $sort: { sortPriority: 1, _id: -1 }
      },
      {
        $skip: Number(skip) || 0
      },
      {
        $limit: Number(limit) || 50
      }
    ]);
  } else if (status === "active") {
    deliveries = await Delivery.find({ user, status: "active", ...searchOption })
      .sort({
        _id: -1,
      })
      .skip(skip as number)
      .limit(limit as number);
  } else if (status === "completed") {
    deliveries = await Delivery.find({ user, status: "completed", ...searchOption })
      .sort({
        _id: -1,
      })
      .skip(skip as number)
      .limit(limit as number);
  } else if (status === "canceled") {
    deliveries = await Delivery.find({ user, status: "canceled", ...searchOption })
      .sort({
        _id: -1,
      })
      .skip(skip as number)
      .limit(limit as number);
  } else if (status === "onTheWay") {
    const response = await Delivery.find({ user, status: "active", ...searchOption }).sort({
      _id: -1,
    });
    const substrings = ["Ожидается", "пути", "задерживается"];
    deliveries = response
      .filter((delivery) => {
        return delivery.statusdelivery[
          delivery.statusdelivery.length - 1
        ].status
          .split(" ")
          .some((word: string) => substrings.includes(word));
      })
      .splice((skip as number) ? (skip as number) : 0, limit as number);
  } else if (status === "pickupReady") {
    const response = await Delivery.find({ user, status: "completed", ...searchOption }).sort({
      _id: -1,
    });

    deliveries = response
      .filter(
        (delivery, index) =>
          delivery.statusdelivery[delivery.statusdelivery.length - 1].status ==
          "готов к выдаче"
      )
      .splice(skip as number, limit as number);
  } else {
    return {
      error: "Неизвестный статус",
    };
  }
  
  const buyouts = await Buyout.find({
    user: user._id,
    _id: { $in: deliveries.map((item) => item.idbuyout) },
  });
  const format = await Promise.all(
    deliveries.map(async (delivery) => {
      const buyout = buyouts.find(
        (item) => item._id.valueOf() === delivery.idbuyout.valueOf()
      );
      if (!buyout) return null;

      // const place = all.findIndex(
      //   item => item._id.toString() === delivery._id.toString(),
      // )

      const phone = delivery.recipientphone;
      const replaced = `+${phone[0]} (***) *** ${phone.slice(7)}`;
      const currentstatus = delivery.statusdelivery?.length
        ? delivery.statusdelivery[delivery.statusdelivery.length - 1].status
        : "Неизвестно";
      const statusupdated = delivery.statusdelivery?.length
        ? delivery.statusdelivery[delivery.statusdelivery.length - 1].date
        : new Date();
      return {
        // place: place + 1,
        uuid: buyout.uuid,
        article: buyout.url,
        pricebuy: delivery.pricebuy,
        size: buyout.sizeparam,
        point: delivery.point,
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
        recipientphone: replaced,
        updatedAt: delivery.updatedAt,
        appartmentNumber: buyout.appartmentNumber,
      };
    })
  );

  const filtered = format;
  console.log("filtered" + filtered.length);
  return filtered;
});
