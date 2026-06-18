import { useState, lazy, Suspense } from "react"
import { Brain } from "lucide-react"

export default function AI () {
  const devMode = "production"

  const AiAssistant = lazy(() => import("../features/ai-assistant/components/AiAssistant.jsx"))

  const [open, setOpen] = useState(false)
  return (
    <>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      <aside
        className={`
          fixed top-0 right-0 h-screen w-full sm:w-[380px] lg:w-[420px]
          glass-panel rounded-none border-r-0 border-t-0 border-b-0 z-50
          transform transition-transform duration-300 ease-out
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <button
          type="button"
          onClick={() => setOpen(prev => !prev)}
          className="
            absolute -left-14 bottom-3
            w-12 h-12 rounded-2xl
            glass-card-elevated
            flex items-center justify-center
            cursor-pointer
            hover:scale-105 transition-transform
            shadow-lg
          "
          aria-label="Mở trợ lý AI"
        >
          <Brain size={26} className="text-brand-light" />
        </button>

        <Suspense fallback={
          <div className="p-6 text-slate-400 text-sm animate-pulse">Đang tải trợ lý...</div>
        }>
          {open && <AiAssistant devMode={devMode} />}
        </Suspense>
      </aside>
    </>
  )
}
