import axios from "axios";

interface CookieCache {
  cookies: string;
  timestamp: number;
}

// Храним cookies в памяти
let cookieCache: CookieCache | null = null;

// Ручные cookies (приоритет над автоматическими)
let manualCookies: string | null = null;

// Время жизни cookies - 24 часа
const COOKIE_LIFETIME = 24 * 60 * 60 * 1000;

/**
 * Получает свежие cookies от Wildberries
 */
async function fetchFreshCookies(): Promise<string> {
  try {
    console.log("[WB Cookies] Fetching fresh cookies from WB...");
    
    const response = await axios.get("https://www.wildberries.ru/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "ru-RU,ru;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Cache-Control": "max-age=0",
        "sec-ch-ua": '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
      },
      maxRedirects: 5,
      validateStatus: (status) => status < 500,
    });

    console.log("[WB Cookies] Response status:", response.status);
    console.log("[WB Cookies] Response headers set-cookie:", response.headers["set-cookie"]);
    
    // Собираем все cookies из set-cookie заголовков
    const setCookieHeaders = response.headers["set-cookie"] || [];
    const cookies = setCookieHeaders
      .map((cookie) => cookie.split(";")[0]) // Берем только name=value часть
      .join("; ");

    if (!cookies) {
      console.warn("[WB Cookies] No cookies received from WB");
      return "";
    }

    console.log("[WB Cookies] Successfully fetched cookies:", cookies.substring(0, 100) + "...");
    return cookies;
  } catch (error: any) {
    console.error("[WB Cookies] Failed to fetch cookies:", error.message);
    return "";
  }
}

/**
 * Получает актуальные cookies (из кеша или запрашивает новые)
 */
export async function getWbCookies(): Promise<string> {
  // Приоритет 1: Ручные cookies из runtime памяти
  if (manualCookies) {
    console.log("[WB Cookies] Using manual cookies from runtime");
    return manualCookies;
  }
  
  // Приоритет 2: Cookies из ENV
  const config = useRuntimeConfig();
  if (config.WB_COOKIES) {
    console.log("[WB Cookies] Using manual cookies from ENV");
    return config.WB_COOKIES as string;
  }
  
  // Приоритет 3: Автоматические cookies (не работают из-за антибота)
  const now = Date.now();
  if (cookieCache && now - cookieCache.timestamp < COOKIE_LIFETIME) {
    console.log("[WB Cookies] Using cached cookies");
    return cookieCache.cookies;
  }

  // Запрашиваем новые cookies (скорее всего вернет пусто из-за антибота)
  const freshCookies = await fetchFreshCookies();
  
  if (freshCookies) {
    cookieCache = {
      cookies: freshCookies,
      timestamp: now,
    };
  }

  return freshCookies;
}

/**
 * Устанавливает ручные cookies
 */
export function setManualCookies(cookies: string): void {
  console.log("[WB Cookies] Setting manual cookies");
  manualCookies = cookies;
}

/**
 * Принудительно обновляет cookies
 */
export async function refreshWbCookies(): Promise<void> {
  console.log("[WB Cookies] Force refresh cookies");
  cookieCache = null;
  await getWbCookies();
}

