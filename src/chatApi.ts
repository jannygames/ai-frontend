export type ChatSseEventType = 'token' | 'done' | 'error'

export interface ChatTokenEvent {
  type: 'token'
  data: {
    text: string
  }
}

export interface ChatDoneEvent {
  type: 'done'
  data: {
    finishReason?: string
    usage?: {
      promptTokens?: number
      completionTokens?: number
      totalTokens?: number
    }
  }
}

export interface ChatErrorEvent {
  type: 'error'
  data: {
    message: string
    code?: string
  }
}

export type ChatSseEvent = ChatTokenEvent | ChatDoneEvent | ChatErrorEvent

export interface StreamChatParams {
  message: string
  systemPrompt?: string
  temperature?: number
  model?: string
  signal?: AbortSignal
  onToken: (text: string) => void
  onDone: (event: ChatDoneEvent) => void
  onError: (event: ChatErrorEvent | Error) => void
}

const API_URL = import.meta.env.VITE_API_URL as string | undefined

if (!API_URL) {
  // Fail fast in development if the env var is missing.
  // eslint-disable-next-line no-console
  console.warn(
    'VITE_API_URL is not defined. Set it in your .env file to enable chat streaming.',
  )
}

export async function streamChat({
  message,
  systemPrompt,
  temperature,
  model,
  signal,
  onToken,
  onDone,
  onError,
}: StreamChatParams): Promise<void> {
  try {
    if (!API_URL) {
      throw new Error('API URL is not configured')
    }

    const response = await fetch(`${API_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        message,
        systemPrompt: systemPrompt || undefined,
        temperature,
        model,
      }),
      signal,
    })

    if (!response.ok || !response.body) {
      const error = new Error(
        `Request failed with status ${response.status} ${response.statusText}`,
      )
      onError(error)
      return
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    while (true) {
      const { value, done } = await reader.read()
      if (done) {
        break
      }

      buffer += decoder.decode(value, { stream: true })

      const events = buffer.split('\n\n')
      buffer = events.pop() ?? ''

      for (const rawEvent of events) {
        const parsed = parseSseEvent(rawEvent)
        if (!parsed) continue

        if (parsed.type === 'token') {
          onToken(parsed.data.text)
        } else if (parsed.type === 'done') {
          onDone(parsed)
        } else if (parsed.type === 'error') {
          onError(parsed)
          return
        }
      }
    }
  } catch (err) {
    if ((err as DOMException).name === 'AbortError') {
      return
    }
    onError(err as Error)
  }
}

function parseSseEvent(raw: string): ChatSseEvent | null {
  let eventType: ChatSseEventType | undefined
  const dataLines: string[] = []

  const lines = raw.split('\n')

  for (const line of lines) {
    if (line.startsWith('event:')) {
      eventType = line.slice('event:'.length).trim() as ChatSseEventType
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice('data:'.length).trim())
    }
  }

  if (!eventType || dataLines.length === 0) {
    return null
  }

  const dataRaw = dataLines.join('\n')

  try {
    const parsedData = JSON.parse(dataRaw)

    if (eventType === 'token') {
      return {
        type: 'token',
        data: {
          text: String(parsedData.text ?? ''),
        },
      }
    }

    if (eventType === 'done') {
      return {
        type: 'done',
        data: {
          finishReason: parsedData.finishReason,
          usage: parsedData.usage,
        },
      }
    }

    if (eventType === 'error') {
      return {
        type: 'error',
        data: {
          message: String(parsedData.message ?? 'Unknown error'),
          code: parsedData.code,
        },
      }
    }
  } catch {
    return null
  }

  return null
}

