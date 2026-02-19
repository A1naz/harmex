import { ReturnCallConfirm } from "~~/server/lib/models/ReturnCallConfirm";
import { ConfirmPhone } from "~~/server/lib/models/ConfirmPhone";
const config = useRuntimeConfig();

export default eventHandler(async (event) => {
  const { phone } = await readBody(event);

  // Если пользователь авторизован — проверяем, что номер совпадает с его профилем
  const session = await getUserSession(event);
  if (session?.user?.uuid && session.user.phoneNumber !== phone) {
    throw createError({
      statusCode: 400,
      message: 'Номер телефона не совпадает с номером в вашем профиле',
    });
  }

  const publicKey = config.RETURN_CALL_PUBLIC_KEY;
  const campaignId = config.RETURN_CALL_CAMPAIGN_ID;
  const formData = new FormData();
  formData.append("public_key", publicKey);
  formData.append("phone", phone);
  formData.append("campaign_id", campaignId);

  try {
    //@ts-ignore
    const data: any = await $fetch(
      "https://zvonok.com/manager/cabapi_external/api/v1/phones/confirm/",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!data || !data.data?.call_id || data.status !== "ok") {
      // Сервис вернул ошибку — сохраняем fallback-код в ConfirmPhone
      const fallbackCode = Math.floor(1000 + Math.random() * 9000).toString();
      const existing = await ConfirmPhone.findOne({ phone });
      if (existing) {
        existing.code = fallbackCode;
        existing.date = new Date();
        existing.errorCount = (existing.errorCount || 0) + 1;
        await existing.save();
      } else {
        await new ConfirmPhone({
          phone,
          code: fallbackCode,
          date: new Date(),
          errorCount: 1,
        }).save();
      }

      return { status: "ok", requiresSupport: true };
    }

    const returnCallConfirm = new ReturnCallConfirm({
      phone,
      callId: data.data.call_id,
      dialStatus: "pending",
    });
    await returnCallConfirm.save();

    return {
      status: "ok",
      callId: data.data.call_id,
    };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);

    // Исключение — сохраняем fallback-код в ConfirmPhone
    const fallbackCode = Math.floor(1000 + Math.random() * 9000).toString();
    const existing = await ConfirmPhone.findOne({ phone });
    if (existing) {
      existing.code = fallbackCode;
      existing.date = new Date();
      existing.errorCount = (existing.errorCount || 0) + 1;
      await existing.save();
    } else {
      await new ConfirmPhone({
        phone,
        code: fallbackCode,
        date: new Date(),
        errorCount: 1,
      }).save();
    }

    return { status: "ok", requiresSupport: true };
  }
});
