import { Delivery } from "@/server/lib/models/goldApple/Delivery";
import { Buyout } from "@/server/lib/models/goldApple/Buyout";
import { Review } from "@/server/lib/models/goldApple/Review";
import { DocuemntEnum } from "~/data/enums";
import { v4 as uuid } from "uuid";
const config = useRuntimeConfig();

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event);
  if (!user) return sendRedirect(event, "/auth", 302);

  const { buyoutuuid, deliveryid, rating, text, positive, negative, date, photos } =
    await readBody(event);

  if (!text && !positive && !negative) {
    throw createError({
      statusCode: 400,
      message: "Заполните хотя бы одно текстовое поле: отзыв, достоинства или недостатки",
    });
  }

  const fields = { text, positive, negative };
  for (const [, value] of Object.entries(fields)) {
    if (value && (value.length < 5 || value.length > 700)) {
      throw createError({
        statusCode: 400,
        message: "Каждое текстовое поле должно содержать от 5 до 700 символов",
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
  const allowedExtensions = ['.png', '.gif', '.pjpeg', '.jpeg','.jpg']
  for (const photo of photos) {
    if (!photo.url) {
      continue
    }
    const extension = photo.url.substring(photo.url.lastIndexOf('.')).toLowerCase()
    if (!allowedExtensions.includes(extension)) {
      throw createError({
        statusCode: 400,
        message: 'Неверный формат файла',
      })
    }
  }

  const review = new Review({
    article: buyout.article,
    name: buyout.product.name,
    uuidbuyout: buyout.uuid,
    images: photos.map((photo: any) => photo.url),
    date,
    publishDate: date,
    user,
    positive,
    negative,
    text,
    rating,
    delivery,
    idDelivery: delivery.idDelivery,
    status: "waiting",
    recipientphone: delivery.recipientphone,
    uuid: uuid(),
  });
  

  const isReviewExist = await Review.findOne({ uuidbuyout: buyout.uuid})
  if (isReviewExist) {
    return createError({
      statusCode: 400,
      message: `Отзыв на эту доставку уже был оставлен`,
    })
  }

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
