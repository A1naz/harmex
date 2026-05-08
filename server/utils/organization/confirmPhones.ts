export async function confirmViaZvonokApi(
  publicKey: string,
  campaignId: string,
  phoneNumber: string,
) {
  try {
    const data: any = await $fetch('https://zvonok.com/manager/cabapi_external/api/v1/phones/tellcode/', {
      method: 'GET',
      query: {
        campaign_id: campaignId,
        phone: phoneNumber,
        public_key: publicKey,
      },
    })

    if (!data || !data.data || !data.data.pincode || data.status === 'error') {
      // eslint-disable-next-line no-console
      console.error(`[confirmViaZvonokApi] Неожиданный ответ от zvonok.com для номера ${phoneNumber}:`, JSON.stringify(data))
      return { status: 'error', message: 'Не удалось отправить код' }
    }

    return {
      status: data.status,
      code: data.data.pincode,
    }
  }
  catch (e: any) {
    // eslint-disable-next-line no-console
    console.error(`[confirmViaZvonokApi] Ошибка запроса к zvonok.com для номера ${phoneNumber}:`, e?.message ?? e)
    return { status: 'error', message: 'Не удалось отправить код' }
  }
}
