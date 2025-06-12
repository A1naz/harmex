import { Delivery } from "@/server/lib/models/goldApple/Delivery";
import { Buyout } from "@/server/lib/models/goldApple/Buyout";
import { Review } from "@/server/lib/models/goldApple/Review";
import { DocuemntEnum } from "~/data/enums";
import { v4 as uuid } from "uuid";
const config = useRuntimeConfig();

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event);
  if (!user) return sendRedirect(event, "/auth", 302);

  const {
    buyoutuuid,
    deliveryid,
    rating,
    text,
    date,
  } = await readBody(event);

  if (text) {
    if (text.length < 10 || text.length > 1000) {
      throw createError({
        statusCode: 400,
        message:
          "Публичный отзыв должен быть длиннее 10 символов и не больше 1000",
      });
    }
  }

  const balanceIsExist = await checkBalance(
    user,
    { buyoutuuid, video: false, mp: "zy" },
    "reviews"
  );

  if (!balanceIsExist) {
    throw createError({
      statusCode: 400,
      message: `Недостаточно средств для совершения отзыва`,
    });
  }

  const buyout = await Buyout.findOne({ uuid: buyoutuuid });
  if (!buyout) {
    return createError({
      statusCode: 400,
      message: "Выкуп не найден",
    });
  }
  const delivery = await Delivery.findOne({
    _id: deliveryid,
    idbuyout: buyout._id,
    reviewed: { $ne: true },
  });
  if (!delivery) {
    return createError({
      statusCode: 400,
      message: "Доставка не найдена",
    });
  }


  const review = new Review({
    article: buyout.article,
    name: buyout.product.name,
    date,
    publishDate: date,
    user,
    text,
    rating,
    delivery,
    idDelivery: delivery.idDelivery,
    status: "waiting",
    recipientphone: delivery.recipientphone,
    uuid: uuid(),
  });
  const res = await review.save();
  delivery.reviewed = true;
  await delivery.save();

  await userLog(event, {
    documentType: DocuemntEnum.Review,
    documentId: res._id,
  });

  return {
    message: "Отзыв успешно добавлен",
  };
});
