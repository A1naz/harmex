const config = useRuntimeConfig();
import axios from "axios";

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event);
  if (!user) return sendRedirect(event, "/auth", 302);

  const { lt, lg } = getQuery(event);

  async function fetchWithRetries(url: string, options: any, maxRetries = 3, delay = 500) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response: any = await axios.get(url, options);
        console.log("Тело ответа:", response.data);
        return response.data;
      } catch (error: any) {
        console.error(`Попытка ${attempt} не удалась:`, error.message);
        if (error.response) {
          console.error("Статус ответа:", error.response.status);
          console.error("Заголовки ответа:", error.response.headers);
          console.error("Данные ответа:", error.response.data);
        }
        if (attempt === maxRetries) {
          console.error("Все попытки исчерпаны");
          throw new Error(
            `Не удалось выполнить запрос после ${maxRetries} попыток: ${error.message}`
          );
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  const url =
    `https://clientweb.flowwow.com/apiuser/geocoder/byCoordinate/?lat=${lt}&lng=${lg}&lang=ru&country_id=1`;

  const options = {
    headers: {
      Accept: "application/json",
      "Accept-Language": "ru,en;q=0.9",
      "Canonical-Url": "https://clientweb.flowwow.com",
      "Device-Unique-Id": "9bbff5c9-1366-4a7d-8aa1-6d3514bad15f",
      "Sec-Ch-Ua":
        '"Not A(Brand";v="8", "Chromium";v="132", "YaBrowser";v="25.2", "Yowser";v="2.5"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": '"Windows"',
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-site",
      Referer: "https://flowwow.com/",
      Origin: "https://flowwow.com",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 YaBrowser/25.2.0.0 Safari/537.36",
      Connection: "keep-alive",
      "Accept-Encoding": "gzip, deflate, br",
    },
    gzip: true,
    maxRedirects: 0,
    validateStatus: (status: number) => status >= 200 && status < 300,
  };

 const data = await fetchWithRetries(url, options).catch((error) => {
    console.error("Финальная ошибка:", error.message);
  });

  return data.data.formatted_address.replace("Россия,", "") || "Не удалось определить адрес";
});
