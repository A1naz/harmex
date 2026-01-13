import { Delivery } from "~~/server/lib/models/wildberries/Delivery";
import { Buyout } from "~~/server/lib/models/wildberries/Buyout";
import { getAdminEntity } from "~/server/utils/getAdmin";

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event);
  if (!user) return sendRedirect(event, "/auth", 302);

  const { status, limit, skip, string, dateRange } = getQuery(event);

  // const all = await Delivery.find({ user })
  let deliveries;
  let searchOption = {};
  console.log(string)
  
  // Обработка dateRange
  let dateFilter = {};
  if (dateRange) {
    try {
      const parsedDateRange = JSON.parse(dateRange as string);
      if (Array.isArray(parsedDateRange) && parsedDateRange.length === 2) {
        const startDate = new Date(parsedDateRange[0]);
        const endDate = new Date(parsedDateRange[1]);
        dateFilter = {
          updatedAt: {
            $gte: startDate,
            $lte: endDate
          }
        };
      }
    } catch (e) {
      console.error("Error parsing dateRange:", e);
    }
  }
  
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
        $match: { user: user._id, ...searchOption, ...dateFilter }
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
                      { $eq: ["$lastStatus", "Готов к выдаче"] },
                      { $eq: ["$lastStatus", "Готов к получению"] },
                      { 
                        $eq: [
                          { $substrCP: ["$lastStatus", 0, 17] },
                          "Готов к получению"
                        ]
                      },
                      { 
                        $eq: [
                          { $substrCP: ["$lastStatus", 0, 15] },
                          "Готов к выдаче"
                        ]
                      },
                      { 
                        $eq: [
                          { $substrCP: ["$lastStatus", 0, 11] },
                          "Заберите до"
                        ]
                      },
                      { 
                        $eq: [
                          { $substrCP: ["$lastStatus", 0, 11] },
                          "Получите до"
                        ]
                      }
                    ]
                  }
                ]
              },
              then: 1, // Готовые к выдаче
              else: {
                $cond: {
                  if: { $in: ["$status", ["active", "work"]] },
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
    deliveries = await Delivery.find({
      user,
      status: { $in: ["active", "work"] },
      ...searchOption,
      ...dateFilter,
    })
      .sort({
        _id: -1,
      })
      .skip(skip as number)
      .limit(limit as number);
  } else if (status === "completed") {
    console.log(searchOption)
    deliveries = await Delivery.find({
      user,
      status: "completed",
      ...searchOption,
      ...dateFilter,
    })
      .sort({
        _id: -1,
      })
      .skip(skip as number)
      .limit(limit as number);
  } else if (status === "canceled") {
    deliveries = await Delivery.find({
      user,
      status: "canceled",
      ...searchOption,
      ...dateFilter,
    })
      .sort({
        _id: -1,
      })
      .skip(skip as number)
      .limit(limit as number);
  } else if (status === "onTheWay") {
    const response = await Delivery.find({
      user,
      status: "active",
      ...searchOption,
      ...dateFilter,
    }).sort({
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
    deliveries = await Delivery.find({
      user,
      ...searchOption,
      ...dateFilter,
      statusdelivery: {
        $elemMatch: {
          $or: [
            { status: "Готов к выдаче" },
            { status: "Готов к получению" },
            { status: "^Заберите до.*" },
            { status: "^Получите до.*" },
            { status: { $regex: "^Готов к получению.*" } },
            { status: { $regex: "^Готов к выдаче.*" } },
            { status: { $regex: "^Заберите до.*" } },
            { status: { $regex: "^Получите до.*" } },
          ],
        },
      },
      status: { $ne: "completed" },
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
      user,
      ...searchOption,
      ...dateFilter,
      statusdelivery: {
        $elemMatch: {
          $or: [
            { status: "Готов к выдаче" },
            { status: "Готов к получению" },
            { status: "^Заберите до.*" },
            { status: "^Получите до.*" },
            { status: { $regex: "^Готов к получению.*" } },
            { status: { $regex: "^Готов к выдаче.*" } },
            { status: { $regex: "^Заберите до.*" } },
            { status: { $regex: "^Получите до.*" } },
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

      const phone: string = delivery.recipientphone || "";
      const replaced: string = `+${phone[0]} (***) *** ${phone.slice(7)}`;
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
        gender: buyout.gender,
      };
    })
  );
  const filtered = format.filter(Boolean);
  return filtered;
});
