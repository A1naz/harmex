import { Buyout } from "@/server/lib/models/flowwow/Buyout";
import { User } from "@/server/lib/models/User";
import { DocuemntEnum } from "~/data/enums";

export default eventHandler(async (event) => {
  const session = (await getAdminEntity(event)) as any;
  if (!session) return sendRedirect(event, "/auth", 302);

  const user = await User.findOne({ uuid: session.uuid });
  if (!user) return sendRedirect(event, "/auth", 302);

  const body = await readBody(event);

  const found = await Buyout.findOne({ uuid: body.uuid });
  if (!found) {
    throw createError({
      statusCode: 400,
      message: "Выкуп не найден",
    });
  }

  const balanceIsExist = await checkBalance(
    user,
    [{ ...found, price: parseFloat(found.product.price) }],
    "buyouts",
    "flowwow"
  );
  if (!balanceIsExist) {
    throw createError({
      statusCode: 400,
      message: "Недостаточно средств",
    });
  }

  found.status = "active";
  await found.save();

  await userLog(event, {
    documentType: DocuemntEnum.Buyout,
    documentId: found.uuid,
    comment: "убран из архива",
  });

  return {
    status: "ok",
  };
});
