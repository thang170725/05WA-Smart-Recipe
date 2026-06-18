import { motion } from "framer-motion";

export default function Header() {
  return (
    <div className="space-y-4">

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="badge">💪 Workout Planner</span>

        <h1 className="page-title mt-3 text-gradient">
          Lộ trình luyện tập cá nhân hóa
        </h1>

        <p className="page-subtitle">
          Được thiết kế theo từng mục tiêu cụ thể của bạn.
          <span className="block text-sm text-slate-500 italic mt-2">
            "Mỗi buổi tập là một bước gần hơn tới mục tiêu của bạn."
          </span>
        </p>
      </motion.div>

    </div>
  );
}
