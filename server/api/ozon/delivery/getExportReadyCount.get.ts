import { Delivery } from "~/server/lib/models/ozon/Delivery";

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event);
  if (!user) return sendRedirect(event, "/auth", 302);

  const count = await Delivery.count({
    user,
    status: { $ne: "completed" },
    statusdelivery: {
      $elemMatch: {
        $or: [
          { status: "^Ожидает получения.*" },
          { status: { $regex: "^Ожидает получения.*" } },
        ],
      },
    },
  })

  return count;
});
