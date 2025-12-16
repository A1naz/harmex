router.post("/:provider", requireApiKey, async (req, res) => {
    try {
   
      let { provider } = req.params;
     
      const { message, systemPrompt, chatId, imageUrl } = req.body; // Добавляем imageUrl
  
  
      
      if (!message) {
        return res.status(400).json({
          error: "Bad Request",
          message: "message обязателен",
        });
      }
      
      const userId = req.headers["x-user-id"];
      
      if (!userId) {
        return res.status(400).json({
          error: "Bad Request",
          message: "x-user-id заголовок обязателен",
        });
      }
      console.log("🔍 provider", provider);
      
      if (!chatId) {
        console.log("🔍 chatId", chatId);
        return res.status(400).json({
          error: "Bad Request",
          message: "chatId обязателен",
        });
      }
      
      const defaultChatTitle = `Чат ${new Date().toLocaleDateString("ru-RU")}`; // Placeholder title, will only be used if chat is new
  
      // Добавляем сообщение в историю чата
      const chatHistory = await ChatHistory.getOrCreate(
        userId,
        provider,
        chatId,
        defaultChatTitle
      );
      // Добавляем сообщение пользователя: сохраняем текст и ссылку на изображение в content через тег
      const contentToSave = imageUrl
        ? `${message} <IMAGE_URL:${imageUrl}>`
        : message;
      console.log("🔍 contentToSave", contentToSave);
      console.log("🔍 imageUrl", imageUrl);
      await chatHistory.addMessage("user", contentToSave, imageUrl); // Передаем imageUrl
  
      // 🔍 ЗАГРУЖАЕМ КОНТЕКСТ ИЗ ИСТОРИИ ЧАТА
      const contextLimit = 10; // Лимит контекста для мультичата
      const chatContext = chatHistory.getContext(contextLimit);
  
      // Интеграция с реальными AI провайдерами
      let aiResponse = "";
      let success = true;
  
      try {
        // Определяем URL сервиса провайдера
        const providerUrls = {
          openai: process.env.OPENAI_SERVICE_URL,
          gemini: process.env.GEMINI_SERVICE_URL,
          anthropic: process.env.ANTHROPIC_SERVICE_URL,
          xai: process.env.XAI_SERVICE_URL,
          yandexgpt: process.env.YANDEXGPT_SERVICE_URL,
          gigachat: process.env.GIGACHAT_SERVICE_URL,
          deepseek: process.env.DEEPSEEK_SERVICE_URL,
        };
  
        const providerUrl = providerUrls["openai"];
  
    
  
        if (!providerUrl) {
          aiResponse = `Провайдер ${provider} не настроен. Отсутствует переменная окружения ${provider.toUpperCase()}_SERVICE_URL`;
          success = false;
        } else {
          const aiSettings = await AISettings.findByUserId(userId);
  
          let selectedModel = aiSettings?.selectedModels
            ? aiSettings.selectedModels[provider]
            : provider;
  
            let generationType = "image";
  
            if (provider === "soraVideo") {
              provider = "sora";
              generationType = "video";
            }
            if (provider === "soraImage") {
              provider = "sora";
              generationType = "image";
            }
  
            console.log("🔍 generationType", generationType);
            console.log("🔍 provider", provider);
  
          // Отправляем запрос к AI провайдеру
          const aiResponseData = await axios.post(
            `${providerUrl}/api/ai/${provider}`,
            {
              message: message,
              systemPrompt:
                typeof systemPrompt === "object"
                  ? systemPrompt.prompt
                  : systemPrompt ||
                    "Ты полезный ассистент. Отвечай на вопросы пользователя кратко и по делу.",
              provider: provider,
              model: selectedModel,
              context: chatContext, // 🔍 ПЕРЕДАЕМ КОНТЕКСТ В AI ПРОВАЙДЕР
              userId: userId,
              generationType: generationType,
              ...(imageUrl &&
                (provider === "veo3" ||
                  provider === "imagen" ||
                  provider === "sora" ||
                  provider === "dalle") && { imageUrl }), // Добавляем imageUrl для veo3 и imagen
              numberOfImages: 1,
            },
            {
              timeout: 200000,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
  
          if (aiResponseData.data?.success) {
            console.log("🔍 aiResponseData", aiResponseData.data);
            let contentToSend;
            if (
              aiResponseData.data.provider === "imagen" ||
              (aiResponseData.data.provider === "dalle" &&
                Array.isArray(aiResponseData.data.images) &&
                aiResponseData.data.images.length > 0)
            ) {
              contentToSend = aiResponseData.data.images.join("\n");
            } else if (
              aiResponseData.data.provider === "veo3" &&
              aiResponseData.data.videoUrl
            ) {
              contentToSend = Array.isArray(aiResponseData.data.videoUrl)
                ? aiResponseData.data.videoUrl.join("\n")
                : aiResponseData.data.videoUrl;
            } else if (
              aiResponseData.data.provider === "sora" &&
              aiResponseData.data.videoUrl &&
              Array.isArray(aiResponseData.data.videoUrl) &&
              aiResponseData.data.videoUrl.length > 0
            ) {
              contentToSend = aiResponseData.data.videoUrl.join("\n");
            } else {
              contentToSend =
                aiResponseData.data.content ||
                aiResponseData.data.response ||
                aiResponseData.data?.message ||
                "Неизвестная ошибка";
            }
            aiResponse = contentToSend;
          } else {
            aiResponse = `Ошибка от провайдера ${provider}: ${
              aiResponseData.data?.message || "Неизвестная ошибка"
            }`;
            success = false;
          }
        }
      } catch (aiError) {
        console.log("🔍 aiError", aiError);
        aiResponse = `Ошибка связи с провайдером ${provider}: ${aiError.message}`;
        success = false;
      }
  
      // Добавляем ответ AI в историю
      await chatHistory.addMessage("assistant", aiResponse);
  
      res.json({
        success: success,
        status: success ? "success" : "error",
        content: aiResponse,
        error: success ? null : aiResponse,
        context: chatContext, // 🔍 ВОЗВРАЩАЕМ КОНТЕКСТ В ОТВЕТЕ
        contextInfo: {
          totalMessages: chatHistory.messages.length,
          contextUsed: chatContext.length,
          contextLimit: contextLimit,
        },
      });
    } catch (error) {
      console.log("🔍 error", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Ошибка отправки сообщения провайдеру",
      });
    }
  });