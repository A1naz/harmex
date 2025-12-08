/**
 * Endpoint для обновления WB cookies
 * POST /api/admin/wb-cookies
 * Body: { cookies: "string" }
 */

import { refreshWbCookies, setManualCookies } from "~~/server/utils/wbCookies";

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event);
  if (!user) {
    return sendRedirect(event, "/auth", 302);
  }

  const body = await readBody(event);
  const { cookies } = body;

  if (!cookies || typeof cookies !== "string") {
    throw createError({
      statusCode: 400,
      message: "Cookies string is required",
    });
  }

  // Сохраняем cookies в runtime памяти
  setManualCookies(cookies);
  await refreshWbCookies();

  return {
    success: true,
    message: "WB Cookies успешно обновлены",
    preview: cookies.substring(0, 100) + "...",
  };
});

