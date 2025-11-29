import { Buyout } from "~/server/lib/models/ozon/Buyout";

import { Delivery } from "~/server/lib/models/ozon/Delivery";
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
          lastStatus: {
            $arrayElemAt: ["$statusdelivery.status", -1]
          }
        }
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
                    $or: [
                      { 
                        $eq: [
                          { $substrCP: ["$lastStatus", 0, 17] },
                          "Ожидает получения"
                        ]
                      },
                      { 
                        $eq: [
                          { $substrCP: ["$lastStatus", 0, 15] },
                          "Можно забирать"
                        ]
                      }
                    ]
                  }
                ]
              },
              then: 1, // Готовые к выдаче
              else: {
                $cond: {
                  if: { $eq: ["$status", "work"] },
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
    deliveries = await Delivery.find({ user, status: "work", ...searchOption })
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
    deliveries = await Delivery.find({
      ...searchOption,
      user,
      $expr: {
        $eq: [{ $arrayElemAt: ["$statusdelivery.status", -1] }, "Отменён"],
      },
    })
      .sort({
        _id: -1,
      })
      .skip(skip as number)
      .limit(limit as number);
  } else if (status === "onTheWay") {
    deliveries = await Delivery.find({
      ...searchOption,
      user,
      $expr: {
        $or: [
          { $eq: [{ $arrayElemAt: ["$statusdelivery.status", -1] }, "В пути"] },
          {
            $eq: [
              { $arrayElemAt: ["$statusdelivery.status", -1] },
              "Передаётся в доставку",
            ],
          },
        ],
      },
    })
      .sort({
        _id: -1,
      })
      .skip(skip as number)
      .limit(limit as number);
  } else if (status === "pickupReady") {
    deliveries = await Delivery.find({
      ...searchOption,
      user,
      status: { $ne: "completed" },
      statusdelivery: {
        $elemMatch: {
          $or: [
          { status: '^Ожидает получения.*' },
          { status: '^Можно забирать.*' },
          { status: { $regex: '^Ожидает получения.*' } },
          { status: { $regex: '^Можно забирать.*' } },
          ],
        },
      },
    })
      .sort({
        _id: -1,
      })
      .skip(skip as number)
      .limit(limit as number);
  } else if (status === "sanctions") {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const allDeliveries = await Delivery.find({
      ...searchOption,
      user,
      statusdelivery: {
        $elemMatch: {
          $or: [
         { status: '^Ожидает получения.*' },
          { status: '^Можно забирать.*' },
          { status: { $regex: '^Ожидает получения.*' } },
          { status: { $regex: '^Можно забирать.*' } },
          ],
        },
      },
      status: { $ne: "completed" },
    });

    deliveries = allDeliveries.filter((delivery) => {
      const lastStatus =
        delivery.statusdelivery[delivery.statusdelivery.length - 1];
      const lastStatusDate = new Date(lastStatus.date);
      return lastStatusDate < sevenDaysAgo;
    });
  } else {
    return {
      error: "Неизвестный статус",
    };
  }

  const buyouts = await Buyout.find({
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
        article: delivery.article,
        pricebuy: delivery.pricebuy,
        size: buyout.sizeparam,
        point: delivery.point,
        statusdelivery: delivery.statusdelivery,
        currentstatus,
        statusupdated,
        productname: buyout.product.name,
        productimage: buyout.product.image,
        receiptcode: delivery.receiptcode ? delivery.receiptcode : undefined,
        receiptcodeqr: delivery.receiptcodeqr ? delivery.receiptcodeqr : "null",
        recipient: delivery.recipient,
        recipientphone: replaced,
        updatedAt: delivery.updatedAt,
        discountPrice: buyout.discountPrice,
      };
    })
  );
  const filtered = format.filter(Boolean);
  return filtered;
});
