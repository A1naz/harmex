import { User } from "~/server/lib/models/User";
import { PartnerPaymentHistory } from "~/server/lib/models/PartnerPaymentHistory";
import { HarmexReferrals } from "~/server/lib/models/HarmexReferrals";

export default async function (
  user: any,
  itemsPerPage?: number,
  page?: number,
  skip?: number
) {
  const ref = await HarmexReferrals.findOne({ user: user._id });

  const result = await PartnerPaymentHistory.aggregate([
    {
      $match: {
        user: user._id,
      },
    },
    {
      $group: {
        _id: "$referral",
        totalAmount: { $sum: "$amount" },
      },
    },
    {
      $lookup: {
        from: "users", // Коллекция, откуда берём данные (название в MongoDB)
        localField: "_id", // Поле из текущей коллекции (PartnerPaymentHistory.referral)
        foreignField: "_id", // Поле в коллекции users (_id)
        as: "userInfo", // Временное поле с массивом найденных пользователей
      },
    },
    {
      $unwind: "$userInfo", // Превращаем массив в объект (т.к. lookup возвращает массив)
    },
    {
      $project: {
        referralId: "$_id", // Сохраняем ID реферала
        totalAmount: 1, // Оставляем сумму
        username: "$userInfo.username", // Берём только username из модели User
        // Можно добавить другие поля, например:
        // userEmail: '$userInfo.email',
      },
    },
    {
      $sort: { totalAmount: -1 }, // Сортируем по убыванию суммы
    },
  ]);

  const formatResult = result.map((item: any) => {
    const foundRef = ref?.referrals.find(
      (ref) => ref.user.valueOf() === item.referralId.valueOf()
    );

    return {
      commission: item.totalAmount.toFixed(2).toString(),
      username: item.username,
      date: foundRef ? foundRef.date : "",
    };
  });

  return formatResult;
}
