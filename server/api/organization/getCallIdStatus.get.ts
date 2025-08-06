import { ReturnCallConfirm } from "~~/server/lib/models/ReturnCallConfirm";
const config = useRuntimeConfig();

export default eventHandler(async (event) => {
  const { callId } = getQuery(event);

  const publicKey = config.RETURN_CALL_PUBLIC_KEY;

  const found = await ReturnCallConfirm.findOne({ callId }).sort({
    createdAt: -1,
  });

  if (!found) {
    throw createError({
      statusCode: 404,
      statusMessage: "Запрос не найден",
    });
  }

  //@ts-ignore
  const data: any = await $fetch(
    `https://zvonok.com/manager/cabapi_external/api/v1/phones/call_by_id/?public_key=${publicKey}&call_id=${found.callId}`,
    {
      method: "GET",
    }
  );

  if (data && data[0] && data[0].dial_status && data[0].dial_status === 5) {
    found.dialStatus = "confirmed";
    await found.save();
    return {
      status: "confirmed",
    };
  }

  return {
    status: "pending",
  };
});
