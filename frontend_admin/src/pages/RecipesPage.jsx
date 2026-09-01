import { ChefHat, Plus, Dumbbell } from "lucide-react";

export function RecipesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-amber-400" />
            Kho Dữ Liệu Công Thức & Bài Tập
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý thư viện thực đơn mẫu và video/hình ảnh động bài tập gym cung cấp cho AI RAG context.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Mở form thêm món ăn / bài tập mới")}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Dữ Liệu Mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Thực Đơn Mẫu (120 Món)</h3>
              <p className="text-xs text-slate-400">Đã gán chỉ số Macro (Protein, Carb, Fat, Calo)</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Bài Tập Thể Hình (85 Bài)</h3>
              <p className="text-xs text-slate-400">Phân loại theo nhóm cơ (Ngực, Lưng, Chân, Vai)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}