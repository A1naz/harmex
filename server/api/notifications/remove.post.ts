import { Notification } from "~~/server/lib/models/Notification";

export default defineEventHandler(async (event) => {
  const user = await getAdminEntity(event);
  if (!user) return sendRedirect(event, "/auth", 302);

  const { uuids }: any = getQuery(event);

  await Notification.updateMany(
    { uuid: { $in: uuids } },
    {
      isRemoved: true,
      $addToSet: { removedUser: user._id }, // или $push, если дубли разрешены
    }
  );

  return {
    status: "ok",
  };
});
