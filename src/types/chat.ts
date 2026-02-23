export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface TokenUsage {
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
}

export const MODEL_OPTIONS = [
  { id: 'gemini-3-flash-preview', label: 'Gemini 3 Flash Preview' },
  { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
] as const

export type ModelId = (typeof MODEL_OPTIONS)[number]['id']

export const STORAGE_KEY = 'ai-chat-history'

export function loadHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ChatMessage[]) : []
  } catch {
    return []
  }
}

export function saveHistory(messages: ChatMessage[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
}
