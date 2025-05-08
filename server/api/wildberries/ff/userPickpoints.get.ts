import { User } from "@/server/lib/models/User";
import { FFPVZ } from "~/server/lib/models/wildberries/FFPVZS";
import MenuBuilder from "~/server/utils/menuBuilder";
import { UserRoles } from "~/data/enums";

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event);
  if (!user) return sendRedirect(event, "/auth", 302);

  const { date }: any = getQuery(event);

  let admin: any = null;

  if (user.roles[0] == UserRoles.staff) {
    const admin = await User.findOne({ uuid: user.uuidCompany });
    if (!admin) return sendRedirect(event, "/auth", 302);
  }

  const pvzs: any = await FFPVZ.findOne({ user: admin ? admin._id : user._id });

  if (!pvzs || !pvzs.pvzs || !pvzs.pvzs.length) {
    return {
      status: "ok",
      points: [],
    };
  }

  const trueDate = new Date(new Date(date).setHours(0, 0, 0, 0));
  const minDate = new Date(
    new Date(trueDate).setHours(trueDate.getHours() - 6)
  );
  const maxDate = new Date(
    new Date(trueDate).setHours(trueDate.getHours() + 6)
  );
  const rmDate = new Date(new Date().setHours(trueDate.getHours() - 24));

  pvzs.pvzs = pvzs.pvzs.filter((item: any) => new Date(item.date) > rmDate);

  await pvzs.save();

  const format = pvzs.pvzs
    .map((item: any) => {
      if (new Date(item.date) >= minDate && new Date(item.date) <= maxDate) {
        return {
          id: item.id,
          a: item.address,
          lt: item.lt,
          lg: item.lg,
          w: item.w,
        };
      }
    })
    .filter((item: any) => item !== undefined);

  console.log("format" + format);
  return {
    status: "ok",
    points: format,
  };
});
