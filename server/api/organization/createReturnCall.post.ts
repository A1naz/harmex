import { ReturnCallConfirm } from "~~/server/lib/models/ReturnCallConfirm";
import { ConfirmPhone } from "~~/server/lib/models/ConfirmPhone";
import { User } from "~~/server/lib/models/User";

const config = useRuntimeConfig();

const POLL_INTERVAL_MS = 5_000;        // опрашиваем zvonok каждые 5 сек
const POLL_TIMEOUT_MS  = 5 * 60_000;  // ждём максимум 5 минут
const COOLDOWN_MS      = 2.5 * 60_000; // минимум между новыми вызовами для одного номера

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

/**
 * Опрашивает zvonok.com до истечения timeoutMs.
 * Возвращает { status: "confirmed" | "timeout", callId }.
 */
async function pollCallStatus(
  phone: string,
  callId: string,
  publicKey: string,
  timeoutMs: number,
): Promise<{ status: string; callId: string }> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

    try {
      // @ts-ignore
      const statusData: any = await $fetch(
        `https://zvonok.com/manager/cabapi_external/api/v1/phones/call_by_id/?public_key=${publicKey}&call_id=${callId}`,
        { method: "GET" as const },
      );

      const entry = statusData?.[0];
      if (!entry) continue;

      const dialStatus = entry.dial_status;
      const callStatus = entry.call_status;

      // eslint-disable-next-line no-console

      if (dialStatus === 5 || callStatus === "pincode_ok" || callStatus === "compl_finished") {
        await ReturnCallConfirm.findOneAndUpdate({ callId }, { dialStatus: "confirmed" });
        await User.findOneAndUpdate({ phoneNumber: phone }, { phoneConfirmed: true });
        // eslint-disable-next-line no-console
        return { status: "confirmed", callId };
      }

      if (TERMINAL_FAIL_STATUSES.includes(dialStatus)) {
        // eslint-disable-next-line no-console
        break;
      }
    } catch (e) {
      // eslint-disable-next-line no-console
    }
  }

  return { status: "timeout", callId };
}

export default eventHandler(async (event) => {
  const { phone: phoneFromBody }: any = await readBody(event);
  const session = await getUserSession(event);

  const phone = session && session.user ? session.user.phoneNumber : phoneFromBody.replace(/[\(\)\-\s]/g, '');
  const publicKey  = config.RETURN_CALL_PUBLIC_KEY;
  const campaignId = config.RETURN_CALL_CAMPAIGN_ID;

  // Если для этого номера уже есть свежая запись (< 2.5 мин) — не создаём новый звонок,
  // а опрашиваем существующий callId, пока не истечёт кулдаун.
  // Юзер не замечает разницы — просто видит спиннер.
  const lastRecord = await ReturnCallConfirm.findOne({ phone }).sort({ createdAt: -1 });
  if (lastRecord?.createdAt) {
    const elapsed   = Date.now() - new Date(lastRecord.createdAt).getTime();
    const remaining = COOLDOWN_MS - elapsed;
    if (remaining > 0) {
      // eslint-disable-next-line no-console
      const result = await pollCallStatus(phone, lastRecord.callId, publicKey, remaining);
      if (result.status === "confirmed") return result;
      // Кулдаун истёк без подтверждения — идём создавать новый звонок
    }
  }

  // Создаём новый звонок в zvonok.com
  const formData = new FormData();
  formData.append("public_key",  publicKey);
  formData.append("phone",       phone);
  formData.append("campaign_id", campaignId);

  let callId: string;

  try {
    // @ts-ignore
    const data: any = await ($fetch as any)(
      "https://zvonok.com/manager/cabapi_external/api/v1/phones/confirm/",
      { method: "POST", body: formData },
    );

    // eslint-disable-next-line no-console

    if (!data || !data.data?.call_id || data.status !== "ok") {
      await saveFallbackCode(phone);
      return { status: "ok", requiresSupport: true };
    }

    callId = data.data.call_id;
  } catch (e) {
    // eslint-disable-next-line no-console
    await saveFallbackCode(phone);
    return { status: "ok", requiresSupport: true };
  }

  await (ReturnCallConfirm as any).create({ phone, callId, dialStatus: "pending" });

  return await pollCallStatus(phone, callId, publicKey, POLL_TIMEOUT_MS);
});
