import { EmailLog } from "~/server/lib/models/EmailLog";
import { User } from "~/server/lib/models/User";
import { UserRoles } from "~/data/enums";

/**
 * Get email campaign logs with pagination
 */
export default eventHandler(async (event) => {
  const isAuth = await getUserSession(event);

  if (!isAuth) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }

  // Check if user is admin - get full user from DB
  const currentUser = await User.findOne({ uuid: isAuth.user?.uuid });
  if (!currentUser || !currentUser.roles?.includes(UserRoles.admin)) {
    throw createError({
      statusCode: 403,
      message: "Forbidden - Admin access required",
    });
  }

  const query = getQuery(event);
  const page = parseInt((query.page as string) || "1");
  const limit = parseInt((query.limit as string) || "50");
  const status = query.status as string | undefined;
  const userId = query.userId as string | undefined;

  const filter: any = {};
  if (status) {
    filter.status = status;
  }
  if (userId) {
    filter.userId = userId;
  }

  try {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      EmailLog.find(filter)
        .sort({ sentAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      EmailLog.countDocuments(filter),
    ]);

    return {
      status: "ok",
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || "Failed to fetch logs",
    });
  }
});

