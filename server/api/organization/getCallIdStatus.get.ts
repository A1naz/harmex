import { ReturnCallConfirm } from "~~/server/lib/models/ReturnCallConfirm";

export default eventHandler(async (event) => {
  const { callId } = getQuery(event);

  if (!callId) {
    throw createError({ statusCode: 400, statusMessage: "Не передан callId" });
  }

  const found = await ReturnCallConfirm.findOne({ callId }).sort({
    createdAt: -1,
  });

  if (!found) {
    throw createError({
      statusCode: 404,
      statusMessage: "Запрос не найден",
    });
  }

  // Статус обновляется вебхуком /api/organization/zvonokWebhook
  return {
    status: found.dialStatus === "confirmed" ? "confirmed" : "pending",
  };
});
