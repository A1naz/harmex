import { ReturnCallConfirm } from "~~/server/lib/models/ReturnCallConfirm";
const config = useRuntimeConfig();

export default eventHandler(async (event) => {
  const { phone } = await readBody(event);

  const publicKey = config.RETURN_CALL_PUBLIC_KEY;
  const campaignId = config.RETURN_CALL_CAMPAIGN_ID;
  const formData = new FormData();
  formData.append("public_key", publicKey);
  formData.append("phone", phone);
  formData.append("campaign_id", campaignId);


  //@ts-ignore
  const data: any = await $fetch(
    "https://zvonok.com/manager/cabapi_external/api/v1/phones/confirm/",
    {
      method: "POST",
      body: formData,
    }
  );
  console.log(data);

  if (data && data.status && data.status === "ok") {
    const returnCallConfirm = new ReturnCallConfirm({
      phone,
      callId: data.data.call_id,
      dialStatus: "pending",
    });
    await returnCallConfirm.save();
  }

  return {
    status: "ok",
    callId: data.data.call_id,
  };
});
