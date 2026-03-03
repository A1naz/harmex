import { Delivery } from "~~/server/lib/models/goldApple/Delivery";
import { Buyout } from "~~/server/lib/models/goldApple/Buyout";
import { getAdminEntity } from "~/server/utils/getAdmin";

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event);
  if (!user) return sendRedirect(event, "/auth", 302);

  const { status, limit, skip, string, dateRange } = getQuery(event);



  // const all = await Delivery.find({ user })
  let deliveries;
  let searchOption = {};

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
    const numericValue = Number(string);
    const isNumeric = !isNaN(numericValue) && string.toString().trim() !== "";
    searchOption = {
      $or: [
        { uuidbuyout: uuid },
        { point: { $regex: string, $options: "i" } },
        ...(isNumeric ? [{ article: numericValue }] : []),
      ],
    };
  }
  if (status === "all") {
    const isFirstPage = !skip || Number(skip) === 0;

    if (isFirstPage) {
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)

      const readyDeliveries = await Delivery.find({
        user, ...searchOption, ...dateFilter,
        statusdelivery: {
          $elemMatch: {
            $or: [
              { status: "готов к выдаче" },
              { status: "Готов к выдаче" },
              { status: "^готов к выдаче.*" },
              { status: "^Готов к выдаче.*" },
              { status: { $regex: "^Готов к выдаче.*" } },
              { status: { $regex: "^готов к выдаче.*" } },
            ],
          },
        },
        status: { $ne: "completed" },
        updatedAt: { $gte: todayStart },
      }).sort({
        _id: -1,
      });

      const trueReadyDeliveries = readyDeliveries
        .filter(
          (delivery, index) =>
            delivery.statusdelivery[delivery.statusdelivery.length - 1].status.includes("готов к выдаче")
        )

      const restDeliveries = await Delivery.find({ user, ...searchOption, ...dateFilter })
        .sort({ _id: -1 })
        .limit(Number(limit) || 50);

      const trueRestDeliveries = restDeliveries.filter(
        (delivery, index) =>
          !delivery.statusdelivery[delivery.statusdelivery.length - 1].status.includes("готов к выдаче")
      )

      deliveries = [...trueReadyDeliveries, ...trueRestDeliveries]


    } else {
      // Не первая страница — просто все доставки с пагинацией
      deliveries = await Delivery.find({ user, ...searchOption, ...dateFilter })
        .sort({ _id: -1 })
        .skip(Number(skip))
        .limit(Number(limit) || 50);
    }
  } else if (status === "active") {
    deliveries = await Delivery.find({ user, status: "work", ...searchOption, ...dateFilter })
      .sort({
        _id: -1,
      })
      .skip(skip as number)
      .limit(limit as number);
  } else if (status === "completed") {
    deliveries = await Delivery.find({ user, status: "completed", ...searchOption, ...dateFilter })
      .sort({
        _id: -1,
      })
      .skip(skip as number)
      .limit(limit as number);
  } else if (status === "canceled") {
    deliveries = await Delivery.find({ user, status: "canceled", ...searchOption, ...dateFilter })
      .sort({
        _id: -1,
      })
      .skip(skip as number)
      .limit(limit as number);
  } else if (status === "onTheWay") {
    const response = await Delivery.find({ user, status: "active", ...searchOption, ...dateFilter }).sort({
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
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const response = await Delivery.find({
      user, ...searchOption, ...dateFilter,
      statusdelivery: {
        $elemMatch: {
          $or: [
            { status: "готов к выдаче" },
            { status: "Готов к выдаче" },
            { status: "^готов к выдаче.*" },
            { status: "^Готов к выдаче.*" },
            { status: { $regex: "^Готов к выдаче.*" } },
            { status: { $regex: "^готов к выдаче.*" } },
          ],
        },
      },
      status: { $ne: "completed" },
      updatedAt: { $gte: todayStart },
    }).sort({
      _id: -1,
    });

    deliveries = response
      .filter(
        (delivery, index) =>
          delivery.statusdelivery[delivery.statusdelivery.length - 1].status.includes("готов к выдаче")
      )

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
          ? delivery.receiptcodeqr.includes('data:image/png;base64,') ? delivery.receiptcodeqr :
            'data:image/png;base64,' + delivery.receiptcodeqr
          : undefined,
        recipient: delivery.recipient,
        recipientphone: replaced,
        updatedAt: delivery.updatedAt,
        appartmentNumber: buyout.appartmentNumber,
      };
    })
  );

  const filtered = format;

  return filtered;
});
