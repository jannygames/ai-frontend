export function TopBanner() {
  return (
    <header className="w-full bg-slate-900 text-slate-50 border-b border-slate-800">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Interview Exercise
        </p>
        <h1 className="text-base font-bold">
          🎯 Interview Exercise: &quot;Build This&quot; AI Chat App
        </h1>
        <p className="text-xs text-slate-400">
          Show this wireframe to the candidate and discuss how they would build
          it.
        </p>
      </div>
    </header>
  )
}
