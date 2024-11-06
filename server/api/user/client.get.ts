import { User } from "~~/server/lib/models/User";
import auth from "~~/server/utils/auth";
export default defineEventHandler(async (event) => {
  await auth.updateSession(event);
  return "success";
});
