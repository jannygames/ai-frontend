import { useEffect, useRef, useState } from 'react'
import { streamChat } from '../chatApi'
import {
  type ChatMessage,
  type TokenUsage,
  loadHistory,
  saveHistory,
} from '../types/chat'

export interface UseChatStreamReturn {
  history: ChatMessage[]
  displayedText: string
  isStreaming: boolean
  error: string | null
  usage: TokenUsage | null
  submit: (params: {
    message: string
    systemPrompt: string
    temperature: number
    model: string
  }) => Promise<void>
  stop: () => void
  clearHistory: () => void
  messagesEndRef: React.RefObject<HTMLDivElement | null>
}

export function useChatStream(): UseChatStreamReturn {
  const [history, setHistory] = useState<ChatMessage[]>(loadHistory)
  const [streamBuffer, setStreamBuffer] = useState('')
  const [displayedText, setDisplayedText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usage, setUsage] = useState<TokenUsage | null>(null)

  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const displayedLenRef = useRef(0)
  const animFrameRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, displayedText])

  // Word-by-word typewriter animation
  useEffect(() => {
    if (!isStreaming && streamBuffer === '') return

    const schedule = () => {
      if (displayedLenRef.current >= streamBuffer.length) return

      const remaining = streamBuffer.slice(displayedLenRef.current)
      const spaceIdx = remaining.indexOf(' ')
      const chunkLen =
        spaceIdx === -1 ? Math.min(6, remaining.length) : spaceIdx + 1
      displayedLenRef.current += chunkLen
      setDisplayedText(streamBuffer.slice(0, displayedLenRef.current))

      animFrameRef.current = setTimeout(schedule, 35)
    }

    if (animFrameRef.current === null) {
      animFrameRef.current = setTimeout(schedule, 35)
    }

    return () => {
      if (animFrameRef.current !== null) {
        clearTimeout(animFrameRef.current)
        animFrameRef.current = null
      }
    }
  }, [streamBuffer, isStreaming])

  const submit = async ({
    message,
    systemPrompt,
    temperature,
    model,
  }: {
    message: string
    systemPrompt: string
    temperature: number
    model: string
  }) => {
    setError(null)
    setUsage(null)
    setStreamBuffer('')
    setDisplayedText('')
    displayedLenRef.current = 0
    animFrameRef.current = null

    const nextHistory: ChatMessage[] = [
      ...history,
      { role: 'user', content: message },
    ]
    setHistory(nextHistory)
    saveHistory(nextHistory)

    const abortController = new AbortController()
    abortControllerRef.current = abortController
    setIsStreaming(true)

    let fullResponse = ''

    await streamChat({
      message,
      systemPrompt,
      temperature,
      model,
      signal: abortController.signal,
      onToken: (text) => {
        fullResponse += text
        setStreamBuffer((prev) => prev + text)
      },
      onDone: (ev) => {
        setIsStreaming(false)
        setUsage(ev.data.usage ?? null)
        abortControllerRef.current = null

        setDisplayedText(fullResponse)
        displayedLenRef.current = fullResponse.length
        if (animFrameRef.current !== null) {
          clearTimeout(animFrameRef.current)
          animFrameRef.current = null
        }

        const finalHistory: ChatMessage[] = [
          ...nextHistory,
          { role: 'assistant', content: fullResponse },
        ]
        setHistory(finalHistory)
        saveHistory(finalHistory)
        setStreamBuffer('')
        setDisplayedText('')
      },
      onError: (err) => {
        setIsStreaming(false)
        abortControllerRef.current = null
        if ('type' in err && err.type === 'error') {
          setError(err.data.message)
          return
        }
        setError(
          err instanceof Error
            ? err.message
            : 'Something went wrong while talking to the assistant.',
        )
      },
    })
  }

  const stop = () => {
    if (!abortControllerRef.current) return
    abortControllerRef.current.abort()
    abortControllerRef.current = null
    setIsStreaming(false)
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('ai-chat-history')
  }

  return {
    history,
    displayedText,
    isStreaming,
    error,
    usage,
    submit,
    stop,
    clearHistory,
    messagesEndRef,
  }
}
