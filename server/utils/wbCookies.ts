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
        console.log("[WB Cookies] Using fallback cookies from ENV");
        return config.WB_COOKIES as string;
      }
      
      return "";
    }
    
    const now = Date.now();
    const lastUpdate = new Date(cookieDoc.updatedAt).getTime();
    const age = now - lastUpdate;
    
    // Проверяем, не устарели ли cookies (больше 2 часов)
    if (age > COOKIE_LIFETIME) {
      console.warn(`[WB Cookies] Cookies are outdated (${Math.round(age / 1000 / 60)} minutes old)`);
    } else {
      console.log(`[WB Cookies] Using DB cookies (age: ${Math.round(age / 1000 / 60)} minutes)`);
    }
    
    return cookieDoc.cookieString;
  } catch (error: any) {
    console.error("[WB Cookies] Failed to get cookies from DB:", error.message);
    
    // Fallback на ENV
    const config = useRuntimeConfig();
    if (config.WB_COOKIES) {
      console.log("[WB Cookies] Using fallback cookies from ENV");
      return config.WB_COOKIES as string;
    }
    
    return "";
  }
}

/**
 * Принудительно обновляет cookies (перечитывает из БД)
 */
export async function refreshWbCookies(): Promise<void> {
  console.log("[WB Cookies] Force refresh - getting fresh cookies from DB");
  await getWbCookies();
}

