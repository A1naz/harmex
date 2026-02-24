import axios from 'axios'
import { AIKey } from '~/server/lib/models/AIKey'
import { getAxiosProxy } from '~/server/utils/AI/proxy'


export type ReviewProvider = 'openai' | 'gemini' | 'deepseek'

export type ParsedItem = {
  id: number
  name: ReviewProvider
  text: string
  positive: string
  negative: string
}

async function getKey(provider: ReviewProvider): Promise<string> {
  const record = await AIKey.findOne({ aiProvider: provider, isActive: true }).sort({ priority: 1 })
  if (!record?.apiKey) throw new Error(`Нет активного ключа для провайдера: ${provider}`)
  return record.apiKey
}

function buildReviewPrompt(productName: string): string {
  return `Напиши реалистичный отзыв покупателя для товара "${productName}".

Строго соблюдай формат (три строки, без markdown, без лишнего текста):
Строка 1: основной текст отзыва от первого лица (100–250 символов)
Строка 2: Плюсы: <перечисление плюсов через запятую>
Строка 3: Минусы: <перечисление минусов или "не выявлено">`
}

function buildAdditionPrompt(productName: string, oldReview: string): string {
  return `Перепиши отзыв покупателя для товара "${productName}", сохрани смысл но измени формулировки.

Исходный отзыв:
${oldReview}

Строго соблюдай формат (три строки, без markdown, без лишнего текста):
Строка 1: основной текст отзыва от первого лица (100–250 символов)
Строка 2: Плюсы: <перечисление плюсов через запятую>
Строка 3: Минусы: <перечисление минусов или "не выявлено">`
}

async function callOpenAI(apiKey: string, prompt: string): Promise<string> {
  const { data } = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
      temperature: 0.8,
    },
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      proxy: false,
      httpsAgent: getAxiosProxy(),
      timeout: 60000,
    }
  )
  return data.choices?.[0]?.message?.content ?? ''
}

async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const { data } = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.8,
        thinkingConfig: { thinkingBudget: 0 },
      },
    },
    {
      proxy: false,
      httpsAgent: getAxiosProxy(),
      timeout: 60000,
    }
  )
  const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  console.log('[Gemini raw]:', JSON.stringify(text))
  return text
}

async function callDeepSeek(apiKey: string, prompt: string): Promise<string> {
  const { data } = await axios.post(
    'https://api.deepseek.com/chat/completions',
    {
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
      temperature: 0.8,
    },
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      proxy: false,
      httpsAgent: getAxiosProxy(),
      timeout: 60000,
    }
  )
  return data.choices?.[0]?.message?.content ?? ''
}

function parseReviewText(raw: string, index: number, provider: ReviewProvider): ParsedItem {
  const cleaned = raw.trim().replace(/\*\*/g, '').replace(/\*/g, '').replace(/#+ /g, '')

  const positiveMatch = cleaned.match(/плюс[ыа]?:[ \t]*([\s\S]+?)(?=минус|$)/i)
  const negativeMatch = cleaned.match(/минус[ыа]?:[ \t]*([\s\S]+?)(?=плюс|$)/i)

  const positive = positiveMatch
    ? positiveMatch[1].trim().replace(/\n+/g, ', ').replace(/,\s*,/g, ',').replace(/\*\*/g, '')
    : ''
  const negative = negativeMatch
    ? negativeMatch[1].trim().replace(/\n+/g, ', ').replace(/,\s*,/g, ',').replace(/\*\*/g, '')
    : ''

  const textEndIndex = cleaned.search(/плюс[ыа]?:|минус[ыа]?:/i)
  const textPart = (textEndIndex > 0 ? cleaned.slice(0, textEndIndex) : cleaned.split(/\n/)[0] ?? cleaned)
    .trim()
    .replace(/\n+/g, ' ')

  return { id: index + 1, name: provider, text: textPart, positive, negative }
}

async function callProvider(provider: ReviewProvider, prompt: string): Promise<ParsedItem> {
  const apiKey = await getKey(provider)
  let raw = ''
  if (provider === 'openai') raw = await callOpenAI(apiKey, prompt)
  else if (provider === 'gemini') raw = await callGemini(apiKey, prompt)
  else if (provider === 'deepseek') raw = await callDeepSeek(apiKey, prompt)
  return parseReviewText(raw, 0, provider)
}

export async function generateReviewsDirect(productName: string): Promise<ParsedItem[]> {
  const providers: ReviewProvider[] = ['openai', 'gemini', 'deepseek']
  const prompt = buildReviewPrompt(productName)
  const results = await Promise.allSettled(providers.map((p) => callProvider(p, prompt)))
  return results
    .map((result, i) => {
      if (result.status === 'fulfilled') return { ...result.value, id: i + 1 }
      console.error(`[AI:${providers[i]}] ошибка:`, result.reason)
      return null
    })
    .filter(Boolean) as ParsedItem[]
}

export async function generateReviewAdditionDirect(
  productName: string,
  oldReview: string
): Promise<ParsedItem[]> {
  const providers: ReviewProvider[] = ['openai', 'gemini', 'deepseek']
  const prompt = buildAdditionPrompt(productName, oldReview)
  const results = await Promise.allSettled(providers.map((p) => callProvider(p, prompt)))
  return results
    .map((result, i) => {
      if (result.status === 'fulfilled') return { ...result.value, id: i + 1 }
      console.error(`[AI:${providers[i]}] ошибка:`, result.reason)
      return null
    })
    .filter(Boolean) as ParsedItem[]
}
