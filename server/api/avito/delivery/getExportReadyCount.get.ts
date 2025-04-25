import { Delivery } from "~/server/lib/models/avito/Delivery";

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event);
  if (!user) return sendRedirect(event, "/auth", 302);

  const deliveries = await Delivery.find({ user, status: "active" }).sort({
    _id: -1,
  });

  const sorted = deliveries.filter((delivery, index) =>
    delivery.statusdelivery[delivery.statusdelivery.length - 1].status.includes(
      "заказ доставлен"
    )
  );

  return sorted.length;
});
