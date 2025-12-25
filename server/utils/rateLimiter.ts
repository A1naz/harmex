import { LoginAttempt } from '@/server/lib/models/LoginAttempt'
import type { H3Event } from 'h3'

const RATE_LIMITS = {
  PER_IP_PER_15_MIN: 3,           // 3 попытки за 15 минут с одного IP
  PER_PHONE_PER_HOUR: 5,          // 5 попыток в час на один номер
  PER_PHONE_PER_15_MIN: 3,        // 3 попытки за 15 минут (жесткое ограничение)
  BLOCK_AFTER_FAILED: 7,          // Блокировка после 7 неудачных попыток
  BLOCK_DURATION: 3600000,         // Блокировка на 60 минут (в миллисекундах)
  SUSPICIOUS_IPS_THRESHOLD: 3,    // Подозрительно если 3+ разных IP для одного номера
}

export function getClientIP(event: H3Event): string {
  const forwarded = getHeader(event, 'x-forwarded-for')
  const realIP = getHeader(event, 'x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return event.node.req.socket?.remoteAddress || 'unknown'
}

export async function checkRateLimit(
  event: H3Event,
  phoneNumber: string
): Promise<{ allowed: boolean; reason?: string; waitTime?: number }> {
  const ip = getClientIP(event)
  const now = new Date()
  
  const fifteenMinutesAgo = new Date(now.getTime() - 900000)
  const ipAttempts = await LoginAttempt.countDocuments({
    ip,
    createdAt: { $gte: fifteenMinutesAgo }
  })
  
  if (ipAttempts >= RATE_LIMITS.PER_IP_PER_15_MIN) {
    return {
      allowed: false,
      reason: 'Слишком много попыток входа с вашего IP. Подождите 15 минут.',
      waitTime: 900
    }
  }
  
  const fifteenMinutesAgoForPhone = new Date(now.getTime() - 900000)
  const recentPhoneAttempts = await LoginAttempt.countDocuments({
    phoneNumber: phoneNumber.replace(/[()\-\s]/g, ''),
    createdAt: { $gte: fifteenMinutesAgoForPhone }
  })
  
  if (recentPhoneAttempts >= RATE_LIMITS.PER_PHONE_PER_15_MIN) {
    return {
      allowed: false,
      reason: 'Слишком много попыток входа. Подождите 15 минут.',
      waitTime: 900
    }
  }

  // 3. Проверка лимита по номеру телефона (5 попыток в час)
  const oneHourAgo = new Date(now.getTime() - 3600000)
  const phoneAttempts = await LoginAttempt.countDocuments({
    phoneNumber: phoneNumber.replace(/[()\-\s]/g, ''),
    createdAt: { $gte: oneHourAgo }
  })
  
  if (phoneAttempts >= RATE_LIMITS.PER_PHONE_PER_HOUR) {
    return {
      allowed: false,
      reason: 'Слишком много попыток входа для этого номера. Попробуйте через 1 час.',
      waitTime: 3600
    }
  }
  
  const uniqueIPsForPhone = await LoginAttempt.distinct('ip', {
    phoneNumber: phoneNumber.replace(/[()\-\s]/g, ''),
    createdAt: { $gte: fifteenMinutesAgoForPhone }
  })
  
  if (uniqueIPsForPhone.length >= RATE_LIMITS.SUSPICIOUS_IPS_THRESHOLD) {

    return {
      allowed: false,
      reason: 'Обнаружена подозрительная активность. Попробуйте позже или обратитесь в поддержку.',
      waitTime: 1800 
    }
  }

  const recentFailedAttempts = await LoginAttempt.countDocuments({
    phoneNumber: phoneNumber.replace(/[()\-\s]/g, ''),
    success: false,
    createdAt: { $gte: oneHourAgo }
  })
  
  if (recentFailedAttempts >= RATE_LIMITS.BLOCK_AFTER_FAILED) {
    const lastFailedAttempt = await LoginAttempt.findOne({
      phoneNumber: phoneNumber.replace(/[()\-\s]/g, ''),
      success: false
    }).sort({ createdAt: -1 })
    
    if (lastFailedAttempt) {
      const timeSinceLastAttempt = now.getTime() - lastFailedAttempt.createdAt.getTime()
      
      if (timeSinceLastAttempt < RATE_LIMITS.BLOCK_DURATION) {
        const waitSeconds = Math.ceil((RATE_LIMITS.BLOCK_DURATION - timeSinceLastAttempt) / 1000)
        return {
          allowed: false,
          reason: `Аккаунт временно заблокирован из-за множественных неудачных попыток входа. Попробуйте через ${waitSeconds} секунд.`,
          waitTime: waitSeconds
        }
      }
    }
  }
  
  return { allowed: true }
}

export async function logLoginAttempt(
  event: H3Event,
  phoneNumber: string,
  success: boolean
): Promise<void> {
  const ip = getClientIP(event)
  const userAgent = getHeader(event, 'user-agent')
  
  try {
    await LoginAttempt.create({
      phoneNumber: phoneNumber.replace(/[()\-\s]/g, ''),
      ip,
      success,
      userAgent,
      createdAt: new Date()
    })
  } catch (error) {
    console.error('Failed to log login attempt:', error)
  }
}


export async function clearOldLoginAttempts(phoneNumber: string): Promise<void> {
  try {
    const oneHourAgo = new Date(Date.now() - 3600000)
    await LoginAttempt.deleteMany({
      phoneNumber: phoneNumber.replace(/[()\-\s]/g, ''),
      success: false,
      createdAt: { $lt: oneHourAgo }
    })
  } catch (error) {
    console.error('Failed to clear old login attempts:', error)
  }
}

