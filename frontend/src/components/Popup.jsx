export default function Popup({ open, onClose, title, children }) {
  if (!open) return null

  return (
    <div className="modal-backdrop">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="modal-panel relative z-10 w-full max-w-lg">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
          <h2 className="font-display text-xl font-bold text-slate-800">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors text-lg"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}
