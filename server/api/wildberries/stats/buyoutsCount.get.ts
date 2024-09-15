import { Buyout } from '~/server/lib/models/wildberries/Buyout'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

  const advertisementRules = [8, 9]
  const allBuyouts = await Buyout.find({ user })
  const advertBuyoutsCount = await Buyout.countDocuments({
    user,
    rules: { $in: advertisementRules },
  })

  return { all: allBuyouts.length, inAdvertisement: advertBuyoutsCount }
})
