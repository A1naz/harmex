import { Referral } from '~/server/lib/models/Referral'
import { PartnerPaymentHistory } from '~/server/lib/models/PartnerPaymentHistory'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

    const updatedReferral = await Referral.findOneAndUpdate(
      { 
        "referrals.user": user._id 
      },
      {
        $set: {
          "referrals.$.isShared": true 
        }
      },
      { new: true } 
    );

  
  return { 
    status: 'ok', 

  }
})
