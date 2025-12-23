import { getWBProductInfo } from "~~/server/utils/wildberries/getProductInfo";

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event);
  if (!user) return sendRedirect(event, "/auth", 302);

  const params = event.context.params as any;
  
  const product = await getWBProductInfo(params.article);

  return {
    product,
  };
});
