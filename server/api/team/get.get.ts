import MenuBuilder from "~/server/utils/menuBuilder";
import { User } from "~~/server/lib/models/User";

function getRussianRoles(role: string) {
  switch (role) {
    case "manager":
      return "менеджер";
    case "courier":
      return "курьер";
    case "financier":
      return "финансист";
    case "accountant":
      return "бухгалтер";
    case "admin":
      return "админ";
    default:
      return "";
  }
}

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event);
  if (!user) return sendRedirect(event, "/auth", 302);

  const myTeams = await User.find({ uuidCompany: user.uuid }).sort({ _id: -1 });

  const format = myTeams.map((user) => {
    const { menu, allowedPathes } = user.uuidCompany
      ? MenuBuilder.filteredAccess(user.acesses)
      : MenuBuilder.filteredAccess();

    return {
      isBanned: user.isBanned,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      uuid: user.uuid,
      uuidCompany: user.uuidCompany,
      acesses: user.acesses,
      emailConfirmed: user.emailConfirmed,
      mmenuItems: menu,
      allowedPathes: allowedPathes,
      post: user.post && typeof user.post === "string" ? getRussianRoles(user.post) : "",
    };
  });
  return format;
});
