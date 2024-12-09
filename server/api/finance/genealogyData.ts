
import { User } from "~/server/lib/models/User"
import { PartnerPaymentHistory } from "~/server/lib/models/PartnerPaymentHistory"

export default async function (user: any, itemsPerPage?: number, page?: number, skip?: number) {
        const data = await PartnerPaymentHistory.find({ user, type: "reward harmex", }).sort({ _id: -1 })

        const users: any = await User.find(
                {
                        _id: data.map((el: any) => el.referral)
                }
        )


        const format = data.map((el: any) => {
                const findUser = users.find((user: any) => user._id.valueOf() == el.referral.valueOf())
                return {
                        commission: el.amount,
                        username: findUser?.username,
                        date: findUser?.registrationDate
                }
        })

        return format
}
