import { WbCookies } from "~~/server/lib/models/wildberries/Cookies";

// Время жизни cookies - 2 часа
const COOKIE_LIFETIME = 2 * 60 * 60 * 1000;


/**
 * Получает актуальные cookies из БД
 */
export async function getWbCookies(): Promise<string> {
  try {
    // Получаем cookies из БД
    const cookieDoc = await WbCookies.findById("wbCookies");
    
    if (!cookieDoc) {
      console.warn("[WB Cookies] No cookies found in DB");
      
      // Пробуем получить из ENV как fallback
      const config = useRuntimeConfig();
      if (config.WB_COOKIES) {
        return config.WB_COOKIES as string;
      }
      
      return "";
    }
    
    const now = Date.now();
    const lastUpdate = new Date(cookieDoc.updatedAt).getTime();
    const age = now - lastUpdate;
    
    // Проверяем, не устарели ли cookies (больше 2 часов)
    if (age > COOKIE_LIFETIME) {

    } else {

    }
    
    return cookieDoc.cookieString;
  } catch (error: any) {
  
    
    // Fallback на ENV
    const config = useRuntimeConfig();
    if (config.WB_COOKIES) {

      return config.WB_COOKIES as string;
    }
    
    return "";
  }
}

/**
 * Принудительно обновляет cookies (перечитывает из БД)
 */
export async function refreshWbCookies(): Promise<void> {

  await getWbCookies();
}

