import { User } from "~/server/lib/models/User";
import { PartnerPaymentHistory } from "~/server/lib/models/PartnerPaymentHistory";

export default async function (
  user: any,
  itemsPerPage?: number,
  page?: number,
  skip?: number
) {
  const limit = itemsPerPage ? itemsPerPage : 25;
  const data = await PartnerPaymentHistory.find({ user })
    .sort({ _id: -1 })
    .skip(page ? (page - 1) * skip : 0)
    .limit(page ? limit : 100000);

  const users: any = await User.find({
    _id: { $in: data.map((el: any) => el.referral) },
  });

  const format = data.map((el: any) => {
    const findUser = users.find(
      (user: any) => user._id.valueOf() == el.referral.valueOf()
    );

    return {
      commission: el.amount.toString(),
      username: findUser?.username,
      date: findUser?.registrationDate,
    };
  });

  return format;
}
