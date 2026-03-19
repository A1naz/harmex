import { User } from "../lib/models/User";
import { UnsubscribeReason } from "../lib/models/UnsubscribeReason";

export default eventHandler(async (event) => {
  const { reason, customText } = await readBody(event);

  const user: any = await getAdminEntity(event)

  if (!user)
    return sendRedirect(event, '/auth', 302)

  if (!reason) {
    throw createError({ statusCode: 400, message: "Укажите причину отписки" });
  }

  await User.updateOne({ uuid: user.uuid }, { $set: { disableEmailAutoSender: true } });

  await UnsubscribeReason.create({
    userUuid: user.uuid,
    userEmail: user.email,
    reason,
    customText: reason === "other" ? (customText || null) : null,
  });

  console.log(
    `[UnsubscribeEmail] ${user.email} (${user.uuid}) отписался. Причина: ${reason}${customText ? ` — ${customText}` : ""}`
  );

  return { ok: true };
});
