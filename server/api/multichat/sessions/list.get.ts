import { ChatHistory } from "~/server/lib/models/multiChat/ChatHistory";
import mongoose from "mongoose";

export default defineEventHandler(async (event) => {
  try {
    // Получаем пользователя
    const user = await getAdminEntity(event);
    if (!user || !user._id) return sendRedirect(event, "/auth", 302);
    
    const userId = new mongoose.Types.ObjectId(user._id);

    // Получаем уникальные сессии чатов
    const sessions = await ChatHistory.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$chatId",
          chatTitle: { $first: "$chatTitle" },
          lastActivity: { $max: "$lastActivity" },
          providers: { $addToSet: "$provider" },
        },
      },
      { $sort: { lastActivity: -1 } },
      { $limit: 50 },
    ]);

    return {
      success: true,
      sessions: sessions.map((s) => ({
        chatId: s._id,
        title: s.chatTitle,
        lastActivity: s.lastActivity,
        providers: s.providers,
      })),
    };
  } catch (error: any) {
    console.error("Error fetching sessions:", error);
    throw createError({
      statusCode: 500,
      message: error.message || "Ошибка получения списка чатов",
    });
  }
});

