import axios from 'axios'
import crypto from 'crypto'
import { PutObjectCommand, PutObjectAclCommand, S3Client } from '@aws-sdk/client-s3'
import { AIKey } from '~/server/lib/models/AIKey'
import { getAxiosProxy } from '~/server/utils/AI/proxy'

export type PhotoProvider = 'dalle' | 'imagen' | 'sora'

export type PhotoResult = {
  provider: PhotoProvider
  url: string | null
  error?: string
}

const PHOTO_SYSTEM_PROMPT =
  'Сгенерируй фотографию товара для отзыва на Wildberries. Фото должно выглядеть максимально естественно, словно сделано на обычный телефон, без признаков AI-генерации. Покажи товар в повседневной обстановке, возможно, на столе или в руках, при естественном освещении. Избегай водяных знаков и излишних надписей.'

async function getKey(provider: string): Promise<string> {
  const record = await AIKey.findOne({ aiProvider: provider, isActive: true }).sort({ priority: 1 })
  if (!record?.apiKey) throw new Error(`Нет активного ключа для провайдера: ${provider}`)
  return record.apiKey
}

async function getImagenKey(): Promise<string> {
  const record = await AIKey.findOne({ aiProvider: 'gemini', isActive: true }).sort({ priority: 1 })
  if (!record?.apiKey) throw new Error('Нет активного ключа для Imagen (gemini)')
  return record.apiKey
}

async function uploadToVKCloud(source: string, isBase64: boolean): Promise<string> {
  const config = useRuntimeConfig()
  const s3 = new S3Client({
    region: 'ru-central1',
    credentials: {
      accessKeyId: config.VK_ACCESS_KEY,
      secretAccessKey: config.VK_SECRET_KEY,
    },
    endpoint: 'https://hb.vkcs.cloud',
  })

  let imageBuffer: Buffer
  let contentType = 'image/png'

  if (isBase64) {
    imageBuffer = Buffer.from(source, 'base64')
  } else {
    // Для загрузки изображения по URL — тоже через прокси
    const resp = await axios.get(source, {
      responseType: 'arraybuffer',
      proxy: false,
      httpsAgent: getAxiosProxy(),
      timeout: 60000,
    })
    imageBuffer = Buffer.from(resp.data)
    const ct = resp.headers['content-type'] || 'image/webp'
    contentType = ct
  }

  const ext = contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpg'
    : contentType.includes('png') ? 'png'
    : 'webp'

  const bucket = 'ozonmpportal'
  const fileName = `ai-review-photos/${crypto.randomUUID()}.${ext}`

  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: fileName, Body: imageBuffer, ContentType: contentType }))
  await s3.send(new PutObjectAclCommand({ Bucket: bucket, Key: fileName, ACL: 'public-read' }))

  return `https://hb.vkcs.cloud/${bucket}/${fileName}`
}

// DALL-E 3: text-to-image, возвращает URL
async function callDALLE3(productName: string): Promise<string> {
  const apiKey = await getKey('dalle')
  const prompt = `${PHOTO_SYSTEM_PROMPT} Товар: ${productName}`

  const { data } = await axios.post(
    'https://api.openai.com/v1/images/generations',
    {
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
    },
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      proxy: false,
      httpsAgent: getAxiosProxy(),
      timeout: 120000,
    }
  )

  const url: string = data.data?.[0]?.url
  if (!url) throw new Error('DALL-E 3 не вернул URL')
  return await uploadToVKCloud(url, false)
}

// gpt-image-1 (провайдер "sora"): text-to-image, возвращает base64
async function callGPTImage1(productName: string): Promise<string> {
  const apiKey = await getKey('sora')
  const prompt = `${PHOTO_SYSTEM_PROMPT} Товар: ${productName}`

  const { data } = await axios.post(
    'https://api.openai.com/v1/images/generations',
    {
      model: 'gpt-image-1',
      prompt,
      n: 1,
      size: '1024x1024',
    },
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      proxy: false,
      httpsAgent: getAxiosProxy(),
      timeout: 120000,
    }
  )

  const b64: string = data.data?.[0]?.b64_json
  if (!b64) throw new Error('gpt-image-1 не вернул base64')
  return await uploadToVKCloud(b64, true)
}

// Imagen 4 через Google Generative Language API (тот же ключ что у Gemini)
async function callImagen4(productName: string): Promise<string> {
  const apiKey = await getImagenKey()
  const prompt = `${PHOTO_SYSTEM_PROMPT} Товар: ${productName}`

  const { data } = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`,
    {
      instances: [{ prompt }],
      parameters: { sampleCount: 1 },
    },
    {
      proxy: false,
      httpsAgent: getAxiosProxy(),
      timeout: 120000,
    }
  )

  const b64: string = data.predictions?.[0]?.bytesBase64Encoded
  if (!b64) throw new Error('Imagen 4 не вернул base64')
  return await uploadToVKCloud(b64, true)
}

export async function generatePhotosDirect(productName: string): Promise<Record<PhotoProvider, string>> {
  const callers: { provider: PhotoProvider; fn: () => Promise<string> }[] = [
    { provider: 'dalle', fn: () => callDALLE3(productName) },
    { provider: 'imagen', fn: () => callImagen4(productName) },
    { provider: 'sora', fn: () => callGPTImage1(productName) },
  ]

  const results = await Promise.allSettled(callers.map((c) => c.fn()))

  const response = {} as Record<PhotoProvider, string>
  for (let i = 0; i < callers.length; i++) {
    const result = results[i]
    if (result.status === 'fulfilled') {
      response[callers[i].provider] = result.value
    } else {
      console.error(`[AI photo:${callers[i].provider}] ошибка:`, result.reason?.message ?? result.reason)
      response[callers[i].provider] = `Ошибка: ${result.reason?.message ?? 'неизвестная'}`
    }
  }

  return response
}
