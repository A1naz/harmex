import { Referral } from '~/server/lib/models/Referral'
import { PartnerPaymentHistory } from '~/server/lib/models/PartnerPaymentHistory'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

  const userRefAcc = await Referral.findOne({ user })

  if (!userRefAcc) {
    return {
      status: 'Not found',
    }
  }

  const comissions = await PartnerPaymentHistory.aggregate([
    { $match: { user: user._id } },
    {
      $group: {
        _id: '$referral',
        summ: { $sum: '$amount' },
      },
    },
  ])

  
  const referIds = comissions.map(comission => comission._id);
  const dealsCount = await PartnerPaymentHistory.aggregate([
    { $match: { referral: { $in: referIds } } },
    {
      $group: {
        _id: '$referral',
        count: { $sum: 1 },
      },
    },
  ])

  const referralUsers = userRefAcc.referrals.map(referral => referral.user.toString());
  // console.log('referralUsers', referralUsers)
  
  const totalCommissions = comissions.reduce((count, comission) => count + comission.summ, 0);
  // const totalDeals = dealsCount.reduce((total, deal) => total + deal.count, 0);
  const firstPaymentCounts = comissions.filter(comission => new Set(referralUsers).has(comission._id.toString())).length;

  const repeatDealsCount = await PartnerPaymentHistory.aggregate([
    {
      $match: {
        referral: { $in: referIds },
        serviceType: { $in: ['carts', 'buyouts', 'reviews', 'questions', 'productlikes', 'likes'] }
      }
    },
    {
      $group: {
        _id: { referral: '$referral', serviceType: '$serviceType' }, 
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.referral', 
        countsByServiceType: {
          $push: { serviceType: '$_id.serviceType', count: '$count' } 
        }
      }
    }
  ]);
  repeatDealsCount.forEach(referralData => {
    referralData.countsByServiceType.forEach(( serviceTypeData: any) => {
      serviceTypeData.count -= 1;
    });
  });
  

  let totalDealsCount = 0;
  repeatDealsCount.forEach(referralData => {
    if (referralUsers.includes(referralData._id.toString())) { 
      referralData.countsByServiceType.forEach((serviceTypeData: any) => {
        totalDealsCount += serviceTypeData.count;
      });
    }
  });
  
  
  
// console.log('Общее количество услуг:', totalDealsCount);


  const repeatPayments:any = await paymenthistory.aggregate([{ 
    $match: { 
      user: { $in: referIds },
      typeoperations: 'Приход'
    } 
  }, 
  {
    $group: {
      _id: '$user',
      repeatPaymentCount: { $sum: 1 }
    }
  }, 
  {
    $project: {
      repeatPaymentCount: { $subtract: ["$repeatPaymentCount", 1] }
    }
  }]);
  const totalRepeatPayments = repeatPayments.reduce((total: any, payment:any) => {
    if (referralUsers.includes(payment._id.toString())) {
      return total + payment.repeatPaymentCount;
    }
    return total;
  }, 0);



  let firstLevelDealsCount = 0;
  let secondLevelDealsCount = 0;

  dealsCount.forEach(dealsCount => {
    const dealsCountIdString = dealsCount._id.toString();
    if (referralUsers.includes(dealsCountIdString)) {
      firstLevelDealsCount += dealsCount.count;
    } else {
      secondLevelDealsCount += dealsCount.count;
    }
  });

  let firstLevelComissions = 0;
  let secondLevelComissions = 0;

  comissions.forEach(comission => {
    const comissionIdString = comission._id.toString();
    if (referralUsers.includes(comissionIdString)) {
      firstLevelComissions += comission.summ;
    } else {
      secondLevelComissions += comission.summ;
    }
  });


  let sharedReferralsCount = 0; 

  userRefAcc.referrals.forEach(referral => {
    if (referral.isShared === true) {
      sharedReferralsCount++; 
    }
  });

  
  return { 
    status: 'ok', 
    firstLevelComissions, 
    secondLevelComissions, 
    totalCommissions, 
    firstPaymentCounts, 
    firstLevelDealsCount,
    totalRepeatPayments,
    totalDealsCount,
    sharedReferralsCount
  }
})
