import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Sparkles, AlertCircle } from "lucide-react";

// ===== Nhãn fallback nếu backend không gửi label =====
const WORKFLOW_LABELS = {
    rewrite: "Phân tích câu hỏi",
    retrieve: "Tìm công cụ phù hợp",
    agent: "AI suy luận",
    execute: "Thực thi công cụ",
    result_evaluator: "Kiểm tra kết quả",
    decision_validator: "Xác thực câu trả lời",
    done: "Hoàn thành",
};

/**
 * Thanh tiến trình AI Agent — timeline dọc, animated.
 *
 * workflow item shape:
 *   { node, status: "running"|"completed"|"error", label?, message? }
 */
export default function WorkflowProgress({
    workflow,
}) {
    if (!workflow?.length) {
        return null;
    }

    // ===== Tính % hoàn thành (running chưa tính) =====
    const completedCount = workflow.filter(
        (item) => item.status === "completed" || item.node === "done"
    ).length;
    const progressPct = Math.min(
        100,
        Math.round((completedCount / Math.max(workflow.length, 1)) * 100)
    );

    const current =
        [...workflow].reverse().find((item) => item.status === "running") ||
        workflow[workflow.length - 1];

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="
                mb-3
                overflow-hidden
                rounded-2xl
                border
                border-teal-200/70
                bg-gradient-to-br
                from-slate-900
                via-slate-900
                to-teal-950
                p-4
                shadow-lg
                shadow-teal-900/20
            "
        >
            {/* ================= Header ================= */}
            <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/20">
                        <Sparkles className="h-3.5 w-3.5 text-teal-300" />
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-white">
                            AI đang suy luận
                        </div>
                        <div className="text-[11px] text-teal-300/80 truncate max-w-[220px]">
                            {current?.message ||
                                current?.label ||
                                WORKFLOW_LABELS[current?.node] ||
                                "Đang xử lý..."}
                        </div>
                    </div>
                </div>

                <div className="text-[11px] font-medium tabular-nums text-teal-200/90">
                    {progressPct}%
                </div>
            </div>

            {/* ================= Progress bar ================= */}
            <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                />
            </div>

            {/* ================= Timeline steps ================= */}
            <div className="relative space-y-0">
                <AnimatePresence initial={false}>
                    {workflow.map((item, index) => {
                        const label =
                            item.label ||
                            WORKFLOW_LABELS[item.node] ||
                            item.node;

                        const isDone = item.status === "completed";
                        const isError = item.status === "error";
                        const isRunning = item.status === "running";
                        const isLast = index === workflow.length - 1;

                        return (
                            <motion.div
                                key={`${item.node}-${index}`}
                                initial={{ opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, delay: 0.02 * index }}
                                className="relative flex gap-3 pb-3 last:pb-0"
                            >
                                {/* ---- Vertical line ---- */}
                                {!isLast && (
                                    <div
                                        className="
                                            absolute
                                            left-[9px]
                                            top-5
                                            bottom-0
                                            w-px
                                            bg-white/10
                                        "
                                    />
                                )}

                                {/* ---- Status icon ---- */}
                                <div className="relative z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                                    {isError ? (
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20">
                                            <AlertCircle className="h-3 w-3 text-red-400" />
                                        </div>
                                    ) : isDone ? (
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/25">
                                            <Check className="h-3 w-3 text-emerald-400" />
                                        </div>
                                    ) : (
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-400/20 ring-2 ring-teal-400/40">
                                            <Loader2 className="h-3 w-3 animate-spin text-teal-300" />
                                        </div>
                                    )}
                                </div>

                                {/* ---- Text ---- */}
                                <div className="min-w-0 flex-1 pt-0.5">
                                    <div
                                        className={[
                                            "text-xs leading-tight",
                                            isRunning
                                                ? "font-semibold text-white"
                                                : isDone
                                                ? "text-slate-300"
                                                : "text-slate-400",
                                        ].join(" ")}
                                    >
                                        {label}
                                    </div>

                                    {item.message && isRunning && (
                                        <div className="mt-0.5 text-[11px] text-teal-300/70 truncate">
                                            {item.message}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
