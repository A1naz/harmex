import { ReturnCallConfirm } from "~~/server/lib/models/ReturnCallConfirm";
import { User } from "~~/server/lib/models/User";

/**
 * Вебхук от zvonok.com — срабатывает при нажатии кнопки пользователем во время звонка.
 * Настраивается в ЛК zvonok.com → кампания → IVR → реакция "Webhook"
 * URL: https://app.harmex.ru/api/organization/zvonokWebhook
 *
 * Параметры из zvonok.com (передаются как form-data или query params):
 *   call_id      — ID звонка
 *   phone        — номер телефона
 *   dial_status  — статус последней попытки (5 = ответил)
 *   call_status  — итоговый статус (pincode_ok, compl_finished и т.д.)
 */
export default eventHandler(async (event) => {
  let body: Record<string, any> = {};

  const contentType = getRequestHeader(event, "content-type") || "";

  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    // zvonok.com присылает form-data
    const raw = await readRawBody(event);
    if (raw) {
      const params = new URLSearchParams(raw);
      params.forEach((value, key) => {
        body[key] = value;
      });
    }
  } else {
    body = await readBody(event).catch(() => ({}));
    if (!body || Object.keys(body).length === 0) {
      body = getQuery(event) as Record<string, any>;
    }
  }

  const callId = body.call_id || body.callId;
  const phone = body.phone;
  const dialStatus = body.dial_status ?? body.dialStatus;
  const callStatus = body.call_status ?? body.callStatus;

  // eslint-disable-next-line no-console
  if (!callId && !phone) {
    return { ok: false, message: "Нет данных" };
  }

  // Считаем звонок подтверждённым если:
  // - dial_status = 5 (абонент ответил)
  // - или call_status = pincode_ok / compl_finished
  const isConfirmed =
    String(dialStatus) === "5" ||
    callStatus === "pincode_ok" ||
    callStatus === "compl_finished";

  if (!isConfirmed) {
    return { ok: true, confirmed: false };
  }

  // Обновляем запись в БД
  const record = callId
    ? await ReturnCallConfirm.findOne({ callId })
    : await ReturnCallConfirm.findOne({ phone }).sort({ createdAt: -1 });

  if (record) {
    record.dialStatus = "confirmed";
    await record.save();
  } else {
    // Записи ещё нет — создаём (редкий случай race condition)
    await ReturnCallConfirm.create({
      phone: phone || "",
      callId: callId || "",
      dialStatus: "confirmed",
    });
  }

  // Помечаем телефон пользователя как подтверждённый
  if (phone) {
    await User.findOneAndUpdate(
      { phoneNumber: phone },
      { phoneConfirmed: true }
    );
  }

  return { ok: true, confirmed: true };
});
