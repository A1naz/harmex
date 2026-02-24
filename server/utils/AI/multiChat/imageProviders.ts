import axios from 'axios'
import { uploadToVKCloud } from './vkCloud'

export async function callDALLE3(
  apiKey: string,
  prompt: string,
  n: number = 1,
  size: string = '1024x1024'
): Promise<string> {
  const { data } = await axios.post(
    'https://api.openai.com/v1/images/generations',
    { model: 'dall-e-3', prompt, n, size },
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 120000,
    }
  )

  const url: string = data.data?.[0]?.url
  if (!url) throw new Error('DALL-E 3 не вернул URL')
  return await uploadToVKCloud(url, false)
}

export async function callGPTImage1(
  apiKey: string,
  prompt: string,
  n: number = 1,
  size: string = '1024x1024'
): Promise<string> {
  const { data } = await axios.post(
    'https://api.openai.com/v1/images/generations',
    { model: 'gpt-image-1', prompt, n, size },
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 120000,
    }
  )

  const b64: string = data.data?.[0]?.b64_json
  if (!b64) throw new Error('gpt-image-1 не вернул base64')
  return await uploadToVKCloud(b64, true)
}

export async function callImagen4(apiKey: string, prompt: string): Promise<string> {
  const { data } = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`,
    {
      instances: [{ prompt }],
      parameters: { sampleCount: 1 },
    },
    { timeout: 120000 }
  )

  const b64: string = data.predictions?.[0]?.bytesBase64Encoded
  if (!b64) throw new Error('Imagen 4 не вернул base64')
  return await uploadToVKCloud(b64, true)
}

export async function callVeo3(_apiKey: string, _prompt: string): Promise<string> {
  throw new Error('Veo3 пока не реализован')
}
