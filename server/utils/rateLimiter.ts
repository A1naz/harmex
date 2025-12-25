import { LoginAttempt } from '@/server/lib/models/LoginAttempt'
import type { H3Event } from 'h3'

const RATE_LIMITS = {
  PER_IP_PER_MINUTE: 3,           // 5 попыток в минуту с одного IP
  PER_PHONE_PER_HOUR: 10,         // 10 попыток в час на один номер
  PER_PHONE_PER_15_MIN: 3,        // 3 попытки за 15 минут (жесткое ограничение)
  BLOCK_AFTER_FAILED: 7,          // Блокировка после 7 неудачных попыток
  BLOCK_DURATION: 3600000,         // Блокировка на 60 минут (в миллисекундах)
  SUSPICIOUS_IPS_THRESHOLD: 3,    // Подозрительно если 3+ разных IP для одного номера
}

/**
 * Получает IP адрес клиента
 */
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

/**
 * Проверяет, не превышен ли лимит попыток входа
 */
export async function checkRateLimit(
  event: H3Event,
  phoneNumber: string
): Promise<{ allowed: boolean; reason?: string; waitTime?: number }> {
  const ip = getClientIP(event)
  const now = new Date()
  
  // 1. Проверка лимита по IP (5 попыток в минуту)
  const oneMinuteAgo = new Date(now.getTime() - 60000)
  const ipAttempts = await LoginAttempt.countDocuments({
    ip,
    createdAt: { $gte: oneMinuteAgo }
  })
  
  if (ipAttempts >= RATE_LIMITS.PER_IP_PER_MINUTE) {
    return {
      allowed: false,
      reason: 'Слишком много попыток входа с вашего IP. Подождите 1 минуту.',
      waitTime: 60
    }
  }
  
  // 2. Проверка жесткого лимита по номеру телефона (3 попытки за 15 минут)
  const fifteenMinutesAgo = new Date(now.getTime() - 900000)
  const recentPhoneAttempts = await LoginAttempt.countDocuments({
    phoneNumber: phoneNumber.replace(/[()\-\s]/g, ''),
    createdAt: { $gte: fifteenMinutesAgo }
  })
  
  if (recentPhoneAttempts >= RATE_LIMITS.PER_PHONE_PER_15_MIN) {
    return {
      allowed: false,
      reason: 'Слишком много попыток входа. Подождите 15 минут.',
      waitTime: 900
    }
  }

  // 3. Проверка лимита по номеру телефона (10 попыток в час)
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
  
  // 4. Обнаружение прокси-атак (подозрительная активность)
  const uniqueIPsForPhone = await LoginAttempt.distinct('ip', {
    phoneNumber: phoneNumber.replace(/[()\-\s]/g, ''),
    createdAt: { $gte: fifteenMinutesAgo }
  })
  
  if (uniqueIPsForPhone.length >= RATE_LIMITS.SUSPICIOUS_IPS_THRESHOLD) {
    // Обнаружена атака с использованием прокси!
    return {
      allowed: false,
      reason: 'Обнаружена подозрительная активность. Попробуйте позже или обратитесь в поддержку.',
      waitTime: 1800 // 30 минут
    }
  }

  // 5. Проверка блокировки после неудачных попыток (7 попыток → блокировка на 15 минут)
  const recentFailedAttempts = await LoginAttempt.countDocuments({
    phoneNumber: phoneNumber.replace(/[()\-\s]/g, ''),
    success: false,
    createdAt: { $gte: oneHourAgo }
  })
  
  if (recentFailedAttempts >= RATE_LIMITS.BLOCK_AFTER_FAILED) {
    // Проверяем, когда была последняя неудачная попытка
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

/**
 * Логирует попытку входа
 */
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

/**
 * Очищает старые успешные попытки входа для пользователя (после успешного входа)
 */
export async function clearOldLoginAttempts(phoneNumber: string): Promise<void> {
  try {
    // Удаляем все неудачные попытки старше 1 часа для этого номера
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

