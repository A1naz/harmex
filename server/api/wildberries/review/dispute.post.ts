import { Review } from "~/server/lib/models/wildberries/Review";
import { User } from "~/server/lib/models/User";
import { TaskLog } from "~/server/lib/models/wildberries/TaskLog";

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event);
  if (!user) {
    return sendRedirect(event, "/auth", 302);
  }

  const { uuid } = await readBody(event);

  const allLogs = await TaskLog.find({
    $or: [{ uuid }, { buyoutuuid: uuid }],
  }).sort({ _id: -1 });

  let isViolation = false;
  if (allLogs && allLogs.length) {
    for (const log of allLogs) {
      if (log.text && log.text.includes("нарушает правила")) {
        isViolation = true
      }
    }
  }

  if (!isViolation) {
    throw createError({
      statusCode: 400,
      message: "Отзыв не подходит для оспорения",
    });
  }

  const review = await Review.findOne({ uuid });
  if (!review) {
    return sendRedirect(event, "/auth", 302);
  }

  if (review.disputed) {
    throw createError({
      statusCode: 400,
      message: "Отзыв уже был оспорен",
    });
  }
  review.disputed = true;
  review.status = "disputing";

  await review.save();
  return {
    message: "Отзыв успешно оспорен",
    status: "ok",
  };
});
