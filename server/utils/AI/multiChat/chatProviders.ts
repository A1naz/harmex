import axios from 'axios'
import crypto from 'crypto'

export async function callOpenAIChat(
  apiKey: string,
  messages: any[],
  systemPrompt: string,
  model: string
): Promise<string> {
  const { data } = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens: 2000,
      temperature: 0.7,
    },
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 60000,
    }
  )
  return data.choices?.[0]?.message?.content ?? ''
}

export async function callGeminiChat(
  apiKey: string,
  messages: any[],
  systemPrompt: string,
  model: string
): Promise<string> {
  const geminiMessages = messages.map((msg: any) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }))

  const { data } = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      contents: geminiMessages,
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: { maxOutputTokens: 2048, temperature: 0.7 },
    },
    { timeout: 60000 }
  )
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

export async function callDeepSeekChat(
  apiKey: string,
  messages: any[],
  systemPrompt: string,
  model: string
): Promise<string> {
  const { data } = await axios.post(
    'https://api.deepseek.com/chat/completions',
    {
      model,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens: 2000,
      temperature: 0.7,
    },
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 60000,
    }
  )
  return data.choices?.[0]?.message?.content ?? ''
}

export async function callAnthropicChat(
  apiKey: string,
  messages: any[],
  systemPrompt: string,
  model: string
): Promise<string> {
  const anthropicMessages = messages.map((msg: any) => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content,
  }))

  const { data } = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model,
      system: systemPrompt,
      messages: anthropicMessages,
      max_tokens: 2000,
      temperature: 0.7,
    },
    {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      timeout: 60000,
    }
  )
  return data.content?.[0]?.text ?? ''
}

export async function callXaiChat(
  apiKey: string,
  messages: any[],
  systemPrompt: string,
  model: string
): Promise<string> {
  const { data } = await axios.post(
    'https://api.x.ai/v1/chat/completions',
    {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        })),
      ],
      max_tokens: 2000,
      temperature: 0.7,
    },
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 60000,
    }
  )
  return data.choices?.[0]?.message?.content ?? ''
}

export async function callYandexGPTChat(
  apiKey: string,
  folderId: string,
  messages: any[],
  systemPrompt: string,
  model: string
): Promise<string> {
  const yandexMessages = [
    { role: 'system', text: systemPrompt },
    ...messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      text: msg.content,
    })),
  ]

  const { data } = await axios.post(
    'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
    {
      modelUri: `gpt://${folderId}/${model}`,
      completionOptions: { stream: false, temperature: 0.7, maxTokens: 2000 },
      messages: yandexMessages,
    },
    {
      headers: { Authorization: `Api-Key ${apiKey}` },
      timeout: 60000,
    }
  )
  return data.result?.alternatives?.[0]?.message?.text ?? ''
}

export async function callGigachatChat(
  apiKey: string,
  messages: any[],
  systemPrompt: string,
  model: string
): Promise<string> {
  const authResponse = await axios.post(
    'https://ngw.devices.sberbank.ru:9443/api/v2/oauth',
    new URLSearchParams({ scope: 'GIGACHAT_API_PERS' }),
    {
      headers: {
        Authorization: `Basic ${Buffer.from(apiKey + ':').toString('base64')}`,
        RqUID: crypto.randomUUID(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  )
  const accessToken = authResponse.data.access_token

  const { data } = await axios.post(
    'https://gigachat.devices.sberbank.ru/api/v1/chat/completions',
    {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 2000,
    },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 60000,
    }
  )
  return data.choices?.[0]?.message?.content ?? ''
}
