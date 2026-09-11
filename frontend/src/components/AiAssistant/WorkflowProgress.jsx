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

/* ====================================================
 * React Component dùng để hiển thị "tiến trình AI Agent" theo dạng timeline dọc có animation
 * Backend / SSE
 *      ↓
 * nhận event workflow
 *      ↓
 * FE cập nhật state workflow
 *      ↓
 * <WorkflowProgress workflow={workflow} />
 *      ↓
 * component tính:
 * - bước nào đang chạy
 * - bước nào hoàn thành
 * - % tiến độ
 *      ↓
 * render timeline + progress bar + icon
 * ==================================================== */
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
                border-orange-200/60
                bg-gradient-to-br
                from-white
                via-white
                to-orange-50
                p-4
                shadow-sm
                shadow-orange-900/5
            "
        >
            {/* ================= Header ================= */}
            <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100">
                        <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-slate-800">
                            AI đang suy luận
                        </div>
                        <div className="text-[11px] text-orange-600/90 truncate max-w-[220px]">
                            {current?.message ||
                                current?.label ||
                                WORKFLOW_LABELS[current?.node] ||
                                "Đang xử lý..."}
                        </div>
                    </div>
                </div>

                <div className="text-[11px] font-bold tabular-nums text-orange-600">
                    {progressPct}%
                </div>
            </div>

            {/* ================= Progress bar ================= */}
            <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-orange-100/60">
                <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-400"
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
                                            bg-orange-200/60
                                        "
                                    />
                                )}

                                {/* ---- Status icon ---- */}
                                <div className="relative z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                                    {isError ? (
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100">
                                            <AlertCircle className="h-3 w-3 text-red-500" />
                                        </div>
                                    ) : isDone ? (
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                                            <Check className="h-3 w-3 text-green-600" />
                                        </div>
                                    ) : (
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 ring-2 ring-orange-200/50">
                                            <Loader2 className="h-3 w-3 animate-spin text-orange-500" />
                                        </div>
                                    )}
                                </div>

                                {/* ---- Text ---- */}
                                <div className="min-w-0 flex-1 pt-0.5">
                                    <div
                                        className={[
                                            "text-xs leading-tight",
                                            isRunning
                                                ? "font-semibold text-slate-800"
                                                : isDone
                                                ? "text-slate-500"
                                                : "text-slate-400",
                                        ].join(" ")}
                                    >
                                        {label}
                                    </div>

                                    {item.message && isRunning && (
                                        <div className="mt-0.5 text-[11px] text-orange-600/80 truncate">
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