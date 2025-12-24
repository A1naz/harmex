import { Review } from "@/server/lib/models/yandexMarket/Review";
import { DocuemntEnum } from "~/data/enums";

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event);
  if (!user) return sendRedirect(event, "/auth", 302);

  const { uuid, rating, text, positive, negative, photos, date, videoKey, video } = await readBody(
    event
  );

  if (!uuid) {
    throw createError({
      statusCode: 400,
      message: "UUID отзыва не указан",
    });
  }

  // Находим существующий отзыв
  const review = await Review.findOne({ uuid, user: user._id });
  if (!review) {
    throw createError({
      statusCode: 404,
      message: "Отзыв не найден",
    });
  }

  // Проверяем, что отзыв опубликован
  if (review.status !== "published") {
    throw createError({
      statusCode: 400,
      message: "Можно редактировать только опубликованные отзывы",
    });
  }

  if (text) {
    if (text.length < 10 || text.length > 1000) {
      throw createError({
        statusCode: 400,
        message:
          "Текст отзыва должен быть длиннее 10 символов и не больше 1000",
      });
    }
  }

  if (rating < 4) {
    throw createError({
      statusCode: 400,
      message:
        "В настоящее время нет возможности публикации отзыва с рейтингом менее 4 звезд",
    });
  }

  // Проверяем баланс пользователя - стоимость редактирования 100 рублей
  const editPrice = 100;
  if (user.balance < editPrice) {
    throw createError({
      statusCode: 400,
      message: "Недостаточно средств для редактирования отзыва (100₽)",
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

  const allowedExtensions = [
    ".png",
    ".gif",
    ".jfif",
    ".pjpeg",
    ".jpeg",
    ".pjp",
    ".jpg",
  ];
  for (const photo of photos) {
    if (!photo.url) {
      continue;
    }
    const extension = photo.url
      .substring(photo.url.lastIndexOf("."))
      .toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      throw createError({
        statusCode: 400,
        message: "Неверный формат файла",
      });
    }
  }

  // Обновляем отзыв - сохраняем изменения в поля *Edited, не трогая оригинальные данные
  review.textEdited = text;
  review.positiveEdited = positive;
  review.negativeEdited = negative;
  review.ratingEdited = rating;
  review.imagesEdited = photos.map((photo: any) => photo.url);
  review.videoKeyEdited = videoKey !== "reviewVideos/." ? videoKey : "";
  review.originalVideoNameEdited = video;
  review.isPhotoEnabledEdited = isPhotoEnabled;
  review.isVideoEnabledEdited = video !== "";
  review.publishDateEdited = date;
  review.editedAt = new Date();
  review.status = "editing";

  await review.save();

  await userLog(event, {
    documentType: DocuemntEnum.Review,
    documentId: review._id,
  });

  return {
    message: "Отзыв успешно изменен",
  };
});

