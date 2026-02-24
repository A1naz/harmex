import axios from 'axios'
import crypto from 'crypto'
import { PutObjectCommand, PutObjectAclCommand, S3Client } from '@aws-sdk/client-s3'

export async function uploadToVKCloud(source: string, isBase64: boolean): Promise<string> {
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
    const resp = await axios.get(source, { responseType: 'arraybuffer', timeout: 60000 })
    imageBuffer = Buffer.from(resp.data)
    contentType = resp.headers['content-type'] || 'image/webp'
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
