import axios from "axios";
import { findImage } from "~~/server/lib/helpers";
import { getWbCookies, refreshWbCookies } from "~~/server/utils/wbCookies";

export interface WBProductInfo {
  image: string;
  article: number;
  name: string;
  sizes: string[];
  price: number;
  priceText: string;
}

/**
 * Получает информацию о товаре с Wildberries по артикулу
 * @param article - артикул товара
 * @returns информация о товаре
 */
export async function getWBProductInfo(article: string | number): Promise<WBProductInfo> {
  const articleStr = String(article);
  
  // Получаем актуальные cookies
  const cookies = await getWbCookies();
  
  // Используем новый API v4 с cookies
  const url = `https://www.wildberries.ru/__internal/card/cards/v4/detail?appType=1&curr=rub&dest=-8312850&spp=30&hide_vflags=4294967296&hide_dtype=9%3B11&ab_testing=false&lang=ru&nm=${articleStr}`;

  let data: any;
  try {
    const response = await axios.get(url, {
      headers: {
        "Host": "www.wildberries.ru",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept-Encoding": "gzip, deflate, br",
        "Referer": "https://www.wildberries.ru/",
        "Origin": "https://www.wildberries.ru",
        "Cookie": cookies,
        "sec-ch-ua": '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
      },
      timeout: 15000,
      validateStatus: (status) => status < 500,
    });
    

    if (response.status === 498 || response.status === 403) {
      await refreshWbCookies();
      throw createError({
        statusCode: 503,
        message: "API Wildberries временно недоступен. Попробуйте позже.",
      });
    }
    
    if (response.status === 404) {
      throw createError({
        statusCode: 404,
        message: "Товар с таким артикулом не найден.",
      });
    }
    
    data = response.data;
  } catch (e: any) {
    if (e.statusCode) throw e;
    
    throw createError({
      statusCode: 503,
      message: "Не удалось получить данные о товаре.",
    });
  }
  
  // API v4 возвращает products напрямую, не внутри data
  const productInfo = data?.products?.[0];
  
  if (!productInfo) {
    throw createError({
      statusCode: 404,
      message: "Товар не найден или API вернул некорректные данные",
    });
  }

  let sizes = [];

  if (productInfo.sizes) {
    sizes = productInfo.sizes
      .filter((item: any) => item.stocks.length)
      .map((item: any) => item.origName);
  }

  if (!sizes || sizes.length === 0) {
    throw createError({
      statusCode: 400,
      message:
        "Не удалось получить информацию по товару. Пожалуйста, проверьте правильность введенного артикула.",
    });
  }

  let instock = false;
  productInfo.sizes.forEach((size: any) => {
    if (size.stocks.length > 0) instock = true;
  });
  
  if (!instock) {
    throw createError({
      statusCode: 400,
      message: "Товара нет в наличии",
    });
  }

  let price = 0;
  for (let i = 0; i < productInfo.sizes.length; i++) {
    if (productInfo.sizes[i].stocks.length > 0) {
      price = productInfo.sizes[i].price.product / 100;
    }
  }

  if (!price) {
    throw createError({
      statusCode: 400,
      message: "Не удалось получить информацию о цене товара.",
    });
  }

  const currency = new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  const priceText = currency.format(price);
  const image = findImage(articleStr);

  return {
    image,
    article: (productInfo.id as number) || (Number(articleStr) as number),
    name: `${productInfo.brand} / ${productInfo.name}` || "",
    sizes: (sizes as string[]) || [],
    price: (price as number) || 0,
    priceText: (priceText as string) || "",
  };
}

