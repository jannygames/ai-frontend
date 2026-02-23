import type { FormEvent } from 'react'
import type { ChatMessage } from '../types/chat'

interface ChatPanelProps {
  systemPrompt: string
  history: ChatMessage[]
  displayedText: string
  isStreaming: boolean
  error: string | null
  message: string
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  onMessageChange: (value: string) => void
  onSubmit: (event: FormEvent) => void
  onStop: () => void
}

export function ChatPanel({
  systemPrompt,
  history,
  displayedText,
  isStreaming,
  error,
  message,
  messagesEndRef,
  onMessageChange,
  onSubmit,
  onStop,
}: ChatPanelProps) {
  return (
    <section className="flex h-full flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 pb-4 pt-3">
      {/* Messages */}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-xl border border-dashed border-slate-200 bg-white p-3 text-sm">
        {/* System prompt card */}
        <div className="rounded-lg border border-dashed border-amber-200 bg-amber-50 px-3 py-2 text-slate-800">
          <div className="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
            System
          </div>
          <p className="text-xs leading-relaxed">{systemPrompt}</p>
        </div>

        {/* Persisted history */}
        {history.map((msg, idx) =>
          msg.role === 'user' ? (
            <div key={idx} className="flex gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-300 text-xs font-semibold text-slate-700">
                U
              </div>
              <div className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2">
                <div className="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  User
                </div>
                <p className="whitespace-pre-wrap text-sm text-slate-900">
                  {msg.content}
                </p>
              </div>
            </div>
          ) : (
            <div key={idx} className="flex gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-white">
                AI
              </div>
              <div className="flex-1 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2">
                <div className="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Assistant
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-900">
                  {msg.content}
                </p>
              </div>
            </div>
          ),
        )}

        {/* Live streaming bubble */}
        {(isStreaming || displayedText || error) && (
          <div className="flex gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-white">
              AI
            </div>
            <div className="flex-1 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2">
              <div className="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Assistant
              </div>
              {displayedText ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-900">
                  {displayedText}
                  {isStreaming && (
                    <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-slate-500 align-middle" />
                  )}
                </p>
              ) : isStreaming ? (
                <p className="text-xs text-slate-500">Thinking…</p>
              ) : null}
              {error && (
                <p className="mt-1 text-xs text-rose-500">{error}</p>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form
        className="mt-1 flex flex-col gap-2 border-t border-slate-200 pt-3"
        onSubmit={onSubmit}
      >
        <label
          className="text-xs font-medium text-slate-600"
          htmlFor="user-message"
        >
          Your message
        </label>
        <textarea
          id="user-message"
          className="min-h-[96px] resize-y rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/60 disabled:opacity-70"
          placeholder="Type your prompt here..."
          value={message}
          onChange={(event) => onMessageChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              onSubmit(event as unknown as FormEvent)
            }
          }}
          disabled={isStreaming}
          rows={4}
        />
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-default disabled:bg-slate-400"
            disabled={!message.trim() || isStreaming}
          >
            Send
          </button>
          {isStreaming && (
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:border-slate-400"
              onClick={onStop}
            >
              Stop generating
            </button>
          )}
        </div>
      </form>
    </section>
  )
}
