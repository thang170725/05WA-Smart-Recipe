// components/AuthLoader.jsx
import { motion, AnimatePresence } from "framer-motion"

export function AuthLoader({ phase }) {
  // phase: "loading" | "success"
  return (
    <AnimatePresence mode="wait">
      {phase === "loading" && (
        <motion.span
          key="spinner"
          className="block w-5 h-5 rounded-full border-2 border-white/30 border-t-white"
          style={{ animation: "spin 0.6s linear infinite" }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
        />
      )}

      {phase === "success" && (
        <motion.svg
          key="check"
          viewBox="0 0 24 24"
          className="w-5 h-5"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <motion.path
            d="M4 12l5 5L20 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
          />
        </motion.svg>
      )}
    </AnimatePresence>
  )
}