import { motion } from "framer-motion";

export default function Header () {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
        >
            <span className="badge-brand">Analytics</span>
            <h1 className="page-title text-gradient text-5xl py-2">
              Fitness Dashboard - Thống kê chi tiết
            </h1>

            <div className="flex gap-2 flex-wrap">
              <span className="badge text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                Health Tracking
              </span>
              <span className="badge text-sky-400 border-sky-500/30 bg-sky-500/10">
                Analytics
              </span>
              <span className="badge text-violet-400 border-violet-500/30 bg-violet-500/10">
                Progress
              </span>
            </div>

            <p className="page-subtitle !mt-0">
              Theo dõi toàn bộ hoạt động sức khỏe, luyện tập và tiến trình của bạn trong một nơi duy nhất. Hãy trận trọng sức khỏe của chính bạn.
            </p>
        </motion.div>
    )
}
