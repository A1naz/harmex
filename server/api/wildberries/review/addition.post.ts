import { Review } from '~/server/lib/models/wildberries/Review';

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event);
  if (!user) {
    return sendRedirect(event, '/auth', 302);
  }

  const { id, text } = await readBody(event);

  if (!id || !text) {
    throw createError({
      statusCode: 400,
      message: 'ID отзыва и текст дополнения обязательны',
    });
  }

  console.log(id, text);
  const review = await Review.findOne({ _id: id });

  if (!review) {
    throw createError({
      statusCode: 404,
      message: 'Отзыв не найден',
    });
  }

  if (review.user.toString() !== user._id?.toString()) {
    throw createError({
      statusCode: 403,
      message: 'У вас нет прав на изменение этого отзыва',
    });
  }

  review.status = 'addition';
  review.additionText = text;

  await review.save();

  return {
    message: 'Отзыв успешно дополнен',
  };
});
