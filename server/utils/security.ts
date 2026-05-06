import { ObjectId } from 'mongodb'

const ALLOWED_IMAGE_HOSTS = [
  'ozon.ru',
  'ozone.ru',
  'cdn.ozone.ru',
  'cdn1.ozone.ru',
  'yandex.net',
  'avatars.mds.yandex.net',
  'avatars.mds.yandex.ru',
  'wildberries.ru',
  'wb.ru',
  'wbbasket.ru',
  'wbstatic.net',
  'geobasket.ru',
  'avito.ru',
  'avito.st',
  'goldapple.ru',
  'flowwow.com',
  'sutochno.ru',
]

export function parseObjectId(value: unknown) {
  if (typeof value !== 'string' || !ObjectId.isValid(value)) {
    throw createError({
      statusCode: 400,
      message: 'Некорректный идентификатор',
    })
  }

  return new ObjectId(value)
}

export function pickAllowedFields<T extends Record<string, unknown>>(
  source: Record<string, unknown>,
  allowedFields: (keyof T)[],
): Partial<T> {
  return allowedFields.reduce((acc, field) => {
    if (Object.prototype.hasOwnProperty.call(source, field))
      acc[field] = source[field as string] as T[keyof T]

    return acc
  }, {} as Partial<T>)
}

export function assertSafeS3Key(value: unknown) {
  if (typeof value !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'Некорректный путь к файлу',
    })
  }

  const key = value.replace(/^ozonmpportal\//, '')
  if (
    !key
    || key.startsWith('/')
    || key.includes('\\')
    || key.split('/').some(part => part === '..' || part === '')
  ) {
    throw createError({
      statusCode: 400,
      message: 'Некорректный путь к файлу',
    })
  }

  return key
}

export function assertAllowedRemoteImageUrl(value: string) {
  let parsed: URL
  try {
    parsed = new URL(value)
  }
  catch {
    throw createError({
      statusCode: 400,
      message: 'Некорректная ссылка',
    })
  }

  if (!['https:', 'http:'].includes(parsed.protocol)) {
    throw createError({
      statusCode: 400,
      message: 'Недопустимый протокол ссылки',
    })
  }

  const host = parsed.hostname.toLowerCase()
  const isAllowed = ALLOWED_IMAGE_HOSTS.some(
    allowedHost => host === allowedHost || host.endsWith(`.${allowedHost}`),
  )

  if (!isAllowed) {
    throw createError({
      statusCode: 400,
      message: 'Домен ссылки не разрешен',
    })
  }

  return parsed.toString()
}

export function escapeRegex(value: unknown) {
  if (typeof value !== 'string')
    return ''

  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
