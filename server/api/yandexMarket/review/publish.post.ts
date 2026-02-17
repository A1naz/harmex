import { log } from "node:console";
import { Buyout } from "@/server/lib/models/yandexMarket/Buyout";
import { Delivery } from "@/server/lib/models/yandexMarket/Delivery";
import { Review } from "@/server/lib/models/yandexMarket/Review";
import { v4 as uuid } from "uuid";
import { DocuemntEnum } from "~/data/enums";

const config = useRuntimeConfig();

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event);
  if (!user) return sendRedirect(event, "/auth", 302);

  const {
    buyoutuuid,
    deliveryid,
    rating,
    text,
    positive,
    negative,
    photos,
    date,
    videoKey,
    video,
    pvz,
    whatLikedInDelivery,
    whatLikedInPVZ,
    whatLikedInProduct,
  } = await readBody(event);


  if (text.length < 5 || text.length > 1000) {
    throw createError({
      statusCode: 400,
      message:
        "Текст отзыва должен быть длиннее 5 символов и не больше 1000",
    });
  }

  if (rating < 4) {
    throw createError({
      statusCode: 400,
      message:
        "В настоящее время нет возможности публикации отзыва с рейтингом менее 4 звезд",
    });
  }

  const balanceIsExist = await checkBalance(
    user,
    { buyoutuuid, video, mp: "wildberries" },
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

  // Проверяем, нет ли уже активного отзыва для этой доставки
  const existingReview = await Review.findOne({
    delivery: deliveryid,
  });

  if (existingReview) {
    throw createError({
      statusCode: 400,
      message: "Отзыв для этой доставки уже существует",
    });
  }

  const deliveryQuery: any = {
    _id: deliveryid,
    idbuyout: buyout._id,
  }

  const deliveryUpdate: any = {}

  if (pvz === true) {
    deliveryQuery.reviewedPVZ = { $ne: true }
    deliveryUpdate.$set = { reviewedPVZ: true }
  } else {
    deliveryQuery.reviewed = { $ne: true }
    deliveryUpdate.$set = { reviewed: true }
  }

  const delivery = await Delivery.findOneAndUpdate(
    deliveryQuery,
    deliveryUpdate,
    {
      new: false // возвращаем документ ДО обновления
    }
  );

  if (!delivery) {
    throw createError({
      statusCode: 400,
      message: "Доставка не найдена или уже была использована для отзыва",
    });
  }

  let isPhotoEnabled = false;
  if (photos && photos.length > 0) {
    photos.forEach((photo: any) => {
      if (photo.url && photo.url !== "") {
        isPhotoEnabled = true;
      }
    });
  }

  const allowedExtensions = ['.png', '.gif', '.jfif', '.pjpeg', '.jpeg', '.pjp', '.jpg']
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
    isPhotoEnabled,
    rating,
    text,
    positive,
    negative,
    date,
    publishDate: date,
    user,
    delivery,
    images: photos.map((photo: any) => photo.url),
    status: "waiting",
    recipientphone: delivery.recipientphone,
    videoKey: videoKey !== "reviewVideos/." ? videoKey : "",
    originalVideoName: video,
    isVideoEnabled: video !== "",
    createdAt: Date.now(),
    uuid: uuid(),
    point: buyout.point,
    pvz,
    whatLikedInDelivery,
    whatLikedInPVZ,
    whatLikedInProduct,
  });
  const res = await review.save();
  // reviewed уже установлен в true через findOneAndUpdate выше

  await userLog(event, {
    documentType: DocuemntEnum.Review,
    documentId: res._id,
  });

  return {
    message: "Отзыв успешно добавлен",
  };
});
