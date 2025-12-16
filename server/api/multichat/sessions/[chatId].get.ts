import { ChatHistory } from "~/server/lib/models/multiChat/ChatHistory";
import mongoose from "mongoose";

export default defineEventHandler(async (event) => {
  try {
    // Получаем пользователя
    const user = await getAdminEntity(event);
    if (!user || !user._id) return sendRedirect(event, "/auth", 302);
    
    const userId = user._id; // Используем ObjectId напрямую
    const chatId = getRouterParam(event, "chatId");

    if (!chatId) {
      throw createError({
        statusCode: 400,
        message: "chatId обязателен",
      });
    }

    // Получаем все истории чатов для данной сессии
    const histories = await ChatHistory.find({
      userId,
      chatId,
    }).sort({ lastActivity: -1 });

    // Группируем сообщения по провайдерам
    const messagesByProvider: Record<string, any[]> = {};

    histories.forEach((history) => {
      if (!messagesByProvider[history.provider]) {
        messagesByProvider[history.provider] = [];
      }
      messagesByProvider[history.provider] = history.messages;
    });

    return {
      success: true,
      chatId,
      messagesByProvider,
    };
  } catch (error: any) {
    console.error("Error fetching chat session:", error);
    throw createError({
      statusCode: 500,
      message: error.message || "Ошибка получения истории чата",
    });
  }
});

