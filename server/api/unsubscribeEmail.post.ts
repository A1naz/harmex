import { User } from "../lib/models/User";
import { UnsubscribeReason } from "../lib/models/UnsubscribeReason";

export default eventHandler(async (event) => {
  const { uuid, reason, customText } = await readBody(event);

  if (!uuid) {
    throw createError({ statusCode: 400, message: "Отсутствует параметр uuid" });
  }
  if (!reason) {
    throw createError({ statusCode: 400, message: "Укажите причину отписки" });
  }

  const user = await User.findOne({ uuid });

  if (!user) {
    throw createError({ statusCode: 404, message: "Пользователь не найден" });
  }

  user.disableEmailAutoSender = true;
  await user.save();

  await UnsubscribeReason.create({
    userUuid: uuid,
    userEmail: user.email,
    reason,
    customText: reason === "other" ? (customText || null) : null,
  });

  console.log(
    `[UnsubscribeEmail] ${user.email} (${uuid}) отписался. Причина: ${reason}${customText ? ` — ${customText}` : ""}`
  );

  return { ok: true };
});
