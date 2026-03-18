export default eventHandler(async (event) => {
  const { username } = getQuery(event);

  if (!username) {
    throw createError({ statusCode: 400, message: "Отсутствует параметр username" });
  }

  return sendRedirect(event, `/profile?unsubscribed=true&uuid=${username}`, 302);
});

