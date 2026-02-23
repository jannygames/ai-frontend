import type { ChatMessage } from '../types/chat'

interface SidebarProps {
  history: ChatMessage[]
  onNewChat: () => void
}

export function Sidebar({ history, onNewChat }: SidebarProps) {
  const userMessages = history.filter((m) => m.role === 'user').slice(-6)

  return (
    <aside className="hidden flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 lg:flex">
      <button
        className="w-full rounded-full border border-dashed border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
        onClick={onNewChat}
      >
        + New Chat
      </button>

      <div className="flex items-center justify-between">
        <div className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Conversation History
        </div>
        {userMessages.length > 0 && (
          <button
            title="Clear all chats"
            className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
            onClick={onNewChat}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        )}
      </div>

      {userMessages.length === 0 ? (
        <div className="text-xs italic text-slate-400">No messages yet.</div>
      ) : (
        <div className="flex flex-col gap-1">
          {userMessages.map((m, i) => (
            <div
              key={i}
              className="truncate rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600"
            >
              {m.content}
            </div>
          ))}
        </div>
      )}
    </aside>
  )
}
