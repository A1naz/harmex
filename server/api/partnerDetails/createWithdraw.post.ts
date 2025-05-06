import { PartnerWithdraw } from "~/server/lib/models/PartnerWithdraw";
import { DocuemntEnum } from "~/data/enums";
import auth from "~~/server/utils/auth";
import { User } from "~/server/lib/models/User";

export default eventHandler(async (event) => {
  const user = await auth.user(event);
  if (!user) return sendRedirect(event, "/auth", 302);

  if (user.uuidCompany) {
    return {
      status: "error",
      message: "Только админ может создавать запрос на вывод.",
    };
  }

  const { amount } = await readBody(event);

  if (Number(amount) < 5000) {
    return {
      status: "error",
      message: "Минимальная сумма вывода - 5000 руб.",
    };
  }
  const balance = user.partner?.balance;

  if (!balance || Number(amount) > balance) {
    return {
      status: "error",
      message: "Сумма вывода не должна быть больше доступного баланса",
    };
  }

  const withdraw = await PartnerWithdraw.create({
    userUuid: user.uuid,
    user,
    amount: Number(amount),
    status: "created",
    type: "account",
  });

  if (withdraw) {
    user.partner.balance -= Number(amount);
    const res = await User.updateOne(
      { uuid: user.uuid },
      { $set: { "partner.balance": user.partner.balance } }
    )

    await userLog(event, {
      documentType: DocuemntEnum.Partners,
      documentId: res._id,
      comment: "вывод средств",
    });

    return { status: "ok", document: withdraw, message: "success" };
  } else {
    return { status: "error", message: "Не удалось создать вывод" };
  }
});
