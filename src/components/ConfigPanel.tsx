import { MODEL_OPTIONS } from '../types/chat'
import type { TokenUsage } from '../types/chat'

interface ConfigPanelProps {
  model: string
  systemPrompt: string
  temperature: number
  usage: TokenUsage | null
  onModelChange: (model: string) => void
  onSystemPromptChange: (value: string) => void
  onTemperatureChange: (value: number) => void
}

export function ConfigPanel({
  model,
  systemPrompt,
  temperature,
  usage,
  onModelChange,
  onSystemPromptChange,
  onTemperatureChange,
}: ConfigPanelProps) {
  return (
    <aside className="hidden flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 lg:flex">
      <section className="rounded-lg border border-slate-200 bg-white p-3">
        <h2 className="mb-2 text-sm font-semibold text-slate-900">
          Model Selection
        </h2>
        <div className="flex flex-col gap-1 text-xs">
          <label className="text-slate-500" htmlFor="model">
            Model
          </label>
          <select
            id="model"
            className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-900"
            value={model}
            onChange={(event) => onModelChange(event.target.value)}
          >
            {MODEL_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-3">
        <h2 className="mb-2 text-sm font-semibold text-slate-900">
          System Message
        </h2>
        <div className="flex flex-col gap-1 text-xs">
          <label className="text-slate-500" htmlFor="system-prompt">
            Instructions
          </label>
          <textarea
            id="system-prompt"
            className="min-h-[120px] resize-y rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/60"
            value={systemPrompt}
            onChange={(event) => onSystemPromptChange(event.target.value)}
            rows={5}
          />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-3">
        <h2 className="mb-2 text-sm font-semibold text-slate-900">
          Generation Settings
        </h2>
        <div className="flex flex-col gap-1 text-xs">
          <label className="text-slate-500" htmlFor="temperature">
            Temperature ({temperature.toFixed(2)})
          </label>
          <input
            id="temperature"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={temperature}
            onChange={(event) =>
              onTemperatureChange(parseFloat(event.target.value))
            }
          />
        </div>
      </section>

      {usage && (
        <section className="rounded-lg border border-slate-200 bg-white p-3">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">
            Token Usage
          </h2>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <div className="text-slate-500">Prompt</div>
              <div className="mt-0.5 font-semibold">
                {usage.promptTokens ?? '—'}
              </div>
            </div>
            <div>
              <div className="text-slate-500">Completion</div>
              <div className="mt-0.5 font-semibold">
                {usage.completionTokens ?? '—'}
              </div>
            </div>
            <div>
              <div className="text-slate-500">Total</div>
              <div className="mt-0.5 font-semibold">
                {usage.totalTokens ?? '—'}
              </div>
            </div>
          </div>
        </section>
      )}
    </aside>
  )
}
