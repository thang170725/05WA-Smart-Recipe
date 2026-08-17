import { motion } from "framer-motion";
import { Dumbbell } from "lucide-react";

export default function Header() {
  return (
    <div className="space-y-4 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div 
          className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wider mb-3">
          <Dumbbell size={16} />
          Workout Planner
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-100 tracking-tight">
          Lộ trình luyện tập cá nhân hóa
        </h1>

        <p className="text-zinc-400 mt-2 text-base md:text-lg max-w-2xl">
          Được thiết kế theo từng mục tiêu cụ thể của bạn.
          <span className="block text-sm text-emerald-500/80 italic mt-2">
            "Mỗi buổi tập là một bước gần hơn tới mục tiêu của bạn."
          </span>
        </p>
      </motion.div>
    </div>
  );
}