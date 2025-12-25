import { LoginAttempt } from '@/server/lib/models/LoginAttempt'

/**
 * Админский endpoint для анализа атак
 * Показывает подозрительную активность
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  
  // Только для администраторов
  if (!session.user || !session.user.acesses?.includes('admin')) {
    throw createError({
      statusCode: 403,
      message: 'Доступ запрещен'
    })
  }

  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 3600000)
  const oneDayAgo = new Date(now.getTime() - 86400000)

  // 1. Топ IP адресов с самым большим количеством попыток входа
  const topIPs = await LoginAttempt.aggregate([
    { $match: { createdAt: { $gte: oneDayAgo } } },
    {
      $group: {
        _id: '$ip',
        total: { $sum: 1 },
        failed: {
          $sum: { $cond: [{ $eq: ['$success', false] }, 1, 0] }
        },
        success: {
          $sum: { $cond: [{ $eq: ['$success', true] }, 1, 0] }
        }
      }
    },
    { $sort: { total: -1 } },
    { $limit: 20 }
  ])

  // 2. Топ номеров телефонов с самым большим количеством неудачных попыток
  const topPhones = await LoginAttempt.aggregate([
    {
      $match: {
        createdAt: { $gte: oneDayAgo },
        success: false
      }
    },
    {
      $group: {
        _id: '$phoneNumber',
        attempts: { $sum: 1 },
        uniqueIPs: { $addToSet: '$ip' }
      }
    },
    {
      $project: {
        phoneNumber: '$_id',
        attempts: 1,
        uniqueIPsCount: { $size: '$uniqueIPs' }
      }
    },
    { $sort: { attempts: -1 } },
    { $limit: 20 }
  ])

  // 3. Подозрительная активность (признаки прокси)
  const suspiciousActivity = await LoginAttempt.aggregate([
    { $match: { createdAt: { $gte: oneHourAgo } } },
    {
      $group: {
        _id: '$phoneNumber',
        uniqueIPs: { $addToSet: '$ip' },
        totalAttempts: { $sum: 1 }
      }
    },
    {
      $match: {
        $expr: { $gt: [{ $size: '$uniqueIPs' }, 5] } // Более 5 разных IP для одного номера
      }
    },
    {
      $project: {
        phoneNumber: '$_id',
        uniqueIPsCount: { $size: '$uniqueIPs' },
        totalAttempts: 1
      }
    },
    { $sort: { uniqueIPsCount: -1 } }
  ])

  // 4. Общая статистика за последний час
  const hourlyStats = await LoginAttempt.aggregate([
    { $match: { createdAt: { $gte: oneHourAgo } } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        failed: {
          $sum: { $cond: [{ $eq: ['$success', false] }, 1, 0] }
        },
        success: {
          $sum: { $cond: [{ $eq: ['$success', true] }, 1, 0] }
        },
        uniqueIPs: { $addToSet: '$ip' },
        uniquePhones: { $addToSet: '$phoneNumber' }
      }
    },
    {
      $project: {
        total: 1,
        failed: 1,
        success: 1,
        uniqueIPsCount: { $size: '$uniqueIPs' },
        uniquePhonesCount: { $size: '$uniquePhones' }
      }
    }
  ])

  // 5. Последние 50 попыток
  const recentAttempts = await LoginAttempt.find()
    .sort({ createdAt: -1 })
    .limit(50)
    .select('phoneNumber ip success createdAt userAgent')

  return {
    summary: hourlyStats[0] || {
      total: 0,
      failed: 0,
      success: 0,
      uniqueIPsCount: 0,
      uniquePhonesCount: 0
    },
    topIPs,
    topPhones,
    suspiciousActivity,
    recentAttempts,
    analysis: {
      isUnderAttack: hourlyStats[0]?.failed > 100,
      likelyUsingProxies: suspiciousActivity.length > 0,
      riskLevel:
        hourlyStats[0]?.failed > 500
          ? 'CRITICAL'
          : hourlyStats[0]?.failed > 100
          ? 'HIGH'
          : hourlyStats[0]?.failed > 20
          ? 'MEDIUM'
          : 'LOW'
    }
  }
})

