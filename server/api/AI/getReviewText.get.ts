export default eventHandler(async (event) => {
  const user = await getAdminEntity(event);
  if (!user) return sendRedirect(event, "/auth", 302);
  console.log("getReviewText");

  const format = [
    {
      id: 1,
      name: "ИИ",
      text: "ИИ текст",
      positive: "ИИ плюсы",
      negative: "ИИ минусы",
    },
    {
      id: 2,
      name: "Grok",
      text: "Grok текст",
      positive: "Grok плюсы",
      negative: "Grok минусы",
    },
    {
      id: 3,
      name: "Gemini",
      text: "Gemini текст",
      positive: "Gemini плюсы",
      negative: "Gemini минусы",
    },
  ];

  return format;
});
