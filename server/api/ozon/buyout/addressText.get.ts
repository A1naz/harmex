const config = useRuntimeConfig();
import axios from "axios";

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event);
  if (!user) return sendRedirect(event, "/auth", 302);

  const { lt, lg } = getQuery(event);
  const url =
    "http://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address";
  const token = `Token ${config.DADATA_TOKEN}`;
  const secret = config.DADATA_SECRET;

  const data: any = await $fetch(url, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({
      lat: lt,
      lon: lg,
    }),
  });

  return data.suggestions[0].value || "Не удалось определить адрес";
});
