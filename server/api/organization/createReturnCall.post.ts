import { ReturnCallConfirm } from "~~/server/lib/models/ReturnCallConfirm";
import { ConfirmPhone } from "~~/server/lib/models/ConfirmPhone";
import { User } from "~~/server/lib/models/User";

const config = useRuntimeConfig();

const POLL_INTERVAL_MS = 5_000;       // опрашиваем zvonok каждые 5 сек
const POLL_TIMEOUT_MS  = 5 * 60_000; // ждём максимум 5 минут

// Статусы dial_status, после которых звонок уже не сможет подтвердиться
const TERMINAL_FAIL_STATUSES = [1, 2, 3, 4, 7, 10, 30, 31];

async function saveFallbackCode(phone: string) {
  const fallbackCode = Math.floor(1000 + Math.random() * 9000).toString();
  const existing = await ConfirmPhone.findOne({ phone });
  if (existing) {
    existing.code = fallbackCode;
    existing.date = new Date();
    existing.errorCount = (existing.errorCount || 0) + 1;
    await existing.save();
  } else {
    await new ConfirmPhone({ phone, code: fallbackCode, date: new Date(), errorCount: 1 }).save();
  }
}

export default eventHandler(async (event) => {
  const { phone } = await readBody(event);

  const session = await getUserSession(event);
  if (session?.user?.uuid && session.user.phoneNumber !== phone) {
    throw createError({
      statusCode: 400,
      message: "Номер телефона не совпадает с номером в вашем профиле",
    });
  }

  const publicKey  = config.RETURN_CALL_PUBLIC_KEY;
  const campaignId = config.RETURN_CALL_CAMPAIGN_ID;

  // 1. Создаём звонок в zvonok.com
  const formData = new FormData();
  formData.append("public_key",  publicKey);
  formData.append("phone",       phone);
  formData.append("campaign_id", campaignId);

  let callId: string;

  try {
    // @ts-ignore
    const data: any = await ($fetch as any)(
      "https://zvonok.com/manager/cabapi_external/api/v1/phones/confirm/",
      { method: "POST", body: formData }
    );

    // eslint-disable-next-line no-console
    console.log("[createReturnCall] zvonok ответ:", JSON.stringify(data));

    if (!data || !data.data?.call_id || data.status !== "ok") {
      await saveFallbackCode(phone);
      return { status: "ok", requiresSupport: true };
    }

    callId = data.data.call_id;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log("[createReturnCall] Ошибка при создании звонка:", e);
    await saveFallbackCode(phone);
    return { status: "ok", requiresSupport: true };
  }

  // Сохраняем запись в БД
  await ReturnCallConfirm.create({ phone, callId, dialStatus: "pending" });

  // 2. Long-poll: держим соединение открытым и ждём подтверждения (до 5 минут)
  const deadline = Date.now() + POLL_TIMEOUT_MS;

  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

    try {
      //@ts-ignore
      const statusData: any = await $fetch(
        `https://zvonok.com/manager/cabapi_external/api/v1/phones/call_by_id/?public_key=${publicKey}&call_id=${callId}`,
        { method: "GET" }
      );

      const entry = statusData?.[0];
      if (!entry) continue;

      const dialStatus  = entry.dial_status;
      const callStatus  = entry.call_status;

      // eslint-disable-next-line no-console
      console.log(`[createReturnCall] poll callId=${callId} dial_status=${dialStatus} call_status=${callStatus}`);

      // Подтверждение
      if (dialStatus === 5 || callStatus === "pincode_ok" || callStatus === "compl_finished") {
        await ReturnCallConfirm.findOneAndUpdate({ callId }, { dialStatus: "confirmed" });
        await User.findOneAndUpdate({ phoneNumber: phone }, { phoneConfirmed: true });
        // eslint-disable-next-line no-console
        console.log(`[createReturnCall] Подтверждено: phone=${phone} callId=${callId}`);
        return { status: "confirmed", callId };
      }

      // Неудачный финальный статус — нет смысла ждать дальше
      if (TERMINAL_FAIL_STATUSES.includes(dialStatus)) {
        // eslint-disable-next-line no-console
        console.log(`[createReturnCall] Терминальный статус ${dialStatus} для phone=${phone}`);
        break;
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log("[createReturnCall] Ошибка при опросе zvonok:", e);
    }
  }

  return { status: "timeout", callId };
});
