import { Delivery } from "~/server/lib/models/yandexMarket/Delivery";

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event);
  if (!user) return sendRedirect(event, "/auth", 302);

  const count = await Delivery.count({
    user,
    statusdelivery: {
      $elemMatch: {
        $or: [
          { status: "Готов к выдаче" },
          { status: "Готов к получению" },
          { status: "^Заберите до.*" },
          { status: "^Получите до.*" },
          { status: "^Ждёт в пункте выдачи.*" },
          { status: { $regex: "^Готов к получению.*" } },
          { status: { $regex: "^Готов к выдаче.*" } },
          { status: { $regex: "^Заберите до.*" } },
          { status: { $regex: "^Получите до.*" } },
          { status: { $regex: "^Ждёт в пункте выдачи.*" } },
        ],
      },
    },
    status: { $ne: "completed" },
  });

  return count;
});
