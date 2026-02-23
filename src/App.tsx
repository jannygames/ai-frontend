import type { FormEvent } from 'react'
import { useState } from 'react'
import { TopBanner } from './components/TopBanner'
import { Sidebar } from './components/Sidebar'
import { ChatPanel } from './components/ChatPanel'
import { ConfigPanel } from './components/ConfigPanel'
import { useChatStream } from './hooks/useChatStream'

const DEFAULT_SYSTEM_PROMPT =
  'You are a helpful coding assistant. Be concise and provide code examples.'

function App() {
  const [message, setMessage] = useState('')
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT)
  const [temperature, setTemperature] = useState(0.3)
  const [model, setModel] = useState('gemini-3-flash-preview')

  const {
    history,
    displayedText,
    isStreaming,
    error,
    usage,
    submit,
    stop,
    clearHistory,
    messagesEndRef,
  } = useChatStream()

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const trimmed = message.trim()
    if (!trimmed || isStreaming) return
    setMessage('')
    await submit({ message: trimmed, systemPrompt, temperature, model })
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      <TopBanner />

      <main className="flex flex-1 items-stretch justify-center px-6 py-8">
        <div className="grid w-full max-w-6xl gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg lg:grid-cols-[260px_minmax(0,1.6fr)_minmax(0,1fr)]">
          <Sidebar history={history} onNewChat={clearHistory} />

          <ChatPanel
            systemPrompt={systemPrompt}
            history={history}
            displayedText={displayedText}
            isStreaming={isStreaming}
            error={error}
            message={message}
            messagesEndRef={messagesEndRef}
            onMessageChange={setMessage}
            onSubmit={handleSubmit}
            onStop={stop}
          />

          <ConfigPanel
            model={model}
            systemPrompt={systemPrompt}
            temperature={temperature}
            usage={usage}
            onModelChange={setModel}
            onSystemPromptChange={setSystemPrompt}
            onTemperatureChange={setTemperature}
          />
        </div>
      </main>
    </div>
  )
}

export default App
