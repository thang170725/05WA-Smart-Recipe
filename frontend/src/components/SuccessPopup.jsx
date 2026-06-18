import { useEffect } from "react"
import { Check } from "lucide-react"

export default function SuccessPopup({ onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 1000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
      <div className="bg-white rounded-2xl shadow-2xl px-10 py-8 flex flex-col items-center gap-4 animate-scale-in border border-slate-100">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center ring-4 ring-emerald-100">
          <Check className="w-9 h-9 text-emerald-600" strokeWidth={2.5} />
        </div>
        <p className="text-lg font-semibold text-slate-700 font-display">
          Thành công
        </p>
      </div>
    </div>
  )
}
