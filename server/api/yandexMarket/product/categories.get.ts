import { Categories } from "~/server/lib/models/Categories";

export default defineEventHandler(async (event) => {
    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)
    
  const found =  await Categories.findOne({ marketplace: "YM" });

  if (!found) {
    throw createError({
      statusCode: 404,
      message: 'not found',
    })
  }

  return found.categories
});
