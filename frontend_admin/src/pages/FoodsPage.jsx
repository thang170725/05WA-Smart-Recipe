import { useState, useMemo, useEffect } from "react";
import { 
  Utensils, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  X, 
  Flame,
  CheckCircle,
  Ban,
  Image as ImageIcon,
  BookOpen,
  List
} from "lucide-react";
import { GetFoodsLibraryApi } from "../api/FoodsApi";

// --- MOCK DATA DỰA TRÊN CẤU TRÚC API MỚI ---
const initialFoods = [
  { 
    id: 1, 
    name: 'bánh mì nướng bơ', 
    unit_support: 'chiếc,gram', 
    image_url: '/foods/avocado_toast.jpg', 
    calories_per_100: 350.00, 
    created_at: '2026-02-17T16:41:37', 
    description: 'Bánh mì nướng kèm bơ và trứng.', 
    category: "Tinh bột", // Giữ lại để filter UI
    status: "ACTIVE", // Giữ lại để UI toggle
    ingredients_json: [
      { name: 'Bánh mì', mass: 100, unit: 'g' }, 
      { name: 'Bơ', mass: 150, unit: 'g' }, 
      { name: 'Trứng', mass: 60, unit: 'g' }
    ], 
    instructions_json: [
      { step: 1, text: 'Nướng bánh mì đến khi vàng giòn.' }
    ] 
  }
];

const CATEGORIES = ["Tất cả", "Thịt & Cầm", "Hải sản", "Tinh bột", "Rau củ", "Trứng & Sữa", "Khác"];

export function FoodsPage() {
  const devMode = "production";

  const [foods, setFoods] = useState(initialFoods);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("Tất cả");

  // State cho Modal (Popup)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view"); // 'view' | 'add' | 'edit'
  const [selectedFood, setSelectedFood] = useState(null);

  // FETCH API
  useEffect(() => {
    const loadApi = async () => {
      try {
        const data = await GetFoodsLibraryApi(devMode);
        if (data && data.length > 0) {
          // Map thêm category và status mặc định nếu API chưa trả về
          const mappedData = data.map(item => ({
            ...item,
            category: item.category || "Khác",
            status: item.status || "ACTIVE"
          }));
          setFoods(mappedData);
        }
      } catch (err) {
        console.error(`GetFoodsLibraryApi Error: ${err}`);
      }
    };
    loadApi();
  }, [devMode]);

  // --- LOGIC LỌC & TÌM KIẾM ---
  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      const matchSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = filterCategory === "Tất cả" || food.category === filterCategory;
      return matchSearch && matchCategory;
    });
  }, [foods, searchQuery, filterCategory]);

  // --- HÀNH ĐỘNG ---
  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa món này khỏi thư viện?")) {
      setFoods((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const openModal = (mode, food = null) => {
    setModalMode(mode);
    if (mode === "add") {
      setSelectedFood({ 
        name: "", 
        description: "", 
        image_url: "", 
        calories_per_100: 0, 
        unit_support: "gram", 
        category: "Khác",
        status: "ACTIVE",
        ingredients_json: [],
        instructions_json: []
      });
    } else {
      setSelectedFood({ ...food });
    }
    setIsModalOpen(true);
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    if (modalMode === "add") {
      const newId = foods.length ? Math.max(...foods.map(f => f.id)) + 1 : 1;
      setFoods([{ ...selectedFood, id: newId, created_at: new Date().toISOString() }, ...foods]);
    } else if (modalMode === "edit") {
      setFoods(foods.map((f) => (f.id === selectedFood.id ? selectedFood : f)));
    }
    setIsModalOpen(false);
  };

  const handleToggleStatus = (id) => {
    setFoods((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, status: f.status === "ACTIVE" ? "HIDDEN" : "ACTIVE" } : f
      )
    );
  };

  return (
    <div className="space-y-6 relative">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Utensils className="w-5 h-5 text-amber-400" />
            Quản lý Thư viện Món ăn
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý dữ liệu dinh dưỡng, công thức và phân loại các thực phẩm trong hệ thống.
          </p>
        </div>
        <button
          onClick={() => openModal("add")}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          Thêm món mới
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row gap-3 bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên món ăn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/50 border border-slate-800 text-white text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-amber-500/50 transition-all"
          />
        </div>
        <div className="relative w-full sm:w-48">
          <Filter className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full bg-slate-950/50 border border-slate-800 text-white text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-amber-500/50 appearance-none cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Mã</th>
                <th className="p-4">Tên & Mô tả</th>
                <th className="p-4">Dinh dưỡng (Calories/100g)</th>
                <th className="p-4">Đơn vị hỗ trợ</th>
                <th className="p-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredFoods.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">Không tìm thấy món ăn nào phù hợp.</td>
                </tr>
              ) : (
                filteredFoods.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-800/30 transition-all group">
                    <td className="p-4 font-mono text-slate-500">#{f.id}</td>
                    <td className="p-4">
                      <div className="font-bold text-white text-[13px] capitalize">{f.name}</div>
                      <div className="text-[10px] text-slate-400 mt-1 line-clamp-1 max-w-[200px]">{f.description}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                        <Flame className="w-3.5 h-3.5" /> {Number(f.calories_per_100).toFixed(1)} kcal
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1 flex-wrap max-w-[150px]">
                        {f.unit_support?.split(',').map(unit => (
                          <span key={unit} className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                            {unit.trim()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal("view", f)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all" title="Xem chi tiết">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => openModal("edit", f)} className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all" title="Chỉnh sửa">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(f.id)} className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all" title="Xóa">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL (POPUP) */}
      {isModalOpen && selectedFood && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/30 shrink-0">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 capitalize">
                {modalMode === "add" ? "Thêm Món Ăn Mới" : modalMode === "edit" ? "Chỉnh sửa: " + selectedFood.name : "Chi tiết: " + selectedFood.name}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-5 text-xs custom-scrollbar">
              <form id="food-form" onSubmit={handleSaveModal} className="space-y-4">
                
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-400 mb-1.5">Tên món ăn</label>
                    <input type="text" disabled={modalMode === "view"} required value={selectedFood.name} onChange={(e) => setSelectedFood({ ...selectedFood, name: e.target.value })} className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500/50 disabled:opacity-70 capitalize" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1.5">Mô tả ngắn</label>
                    <textarea disabled={modalMode === "view"} value={selectedFood.description || ""} onChange={(e) => setSelectedFood({ ...selectedFood, description: e.target.value })} className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500/50 disabled:opacity-70 min-h-[60px]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1.5 flex items-center gap-1"><Flame className="w-3 h-3 text-amber-500"/> Calories / 100g</label>
                    <input type="number" step="0.01" disabled={modalMode === "view"} required value={selectedFood.calories_per_100} onChange={(e) => setSelectedFood({ ...selectedFood, calories_per_100: e.target.value })} className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500/50 disabled:opacity-70 font-mono text-amber-400" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1.5">Đơn vị hỗ trợ</label>
                    <input type="text" disabled={modalMode === "view"} value={selectedFood.unit_support} onChange={(e) => setSelectedFood({ ...selectedFood, unit_support: e.target.value })} placeholder="VD: gram, chiếc, bát..." className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500/50 disabled:opacity-70" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-slate-400 mb-1.5 flex items-center gap-1"><ImageIcon className="w-3 h-3"/> Image URL</label>
                  <input type="text" disabled={modalMode === "view"} value={selectedFood.image_url || ""} onChange={(e) => setSelectedFood({ ...selectedFood, image_url: e.target.value })} className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500/50 disabled:opacity-70" />
                </div>

                {/* Ingredients & Instructions (Hiển thị chi tiết ở chế độ View) */}
                {modalMode === "view" && (
                  <>
                    <div className="pt-4 border-t border-slate-800/50">
                      <h4 className="text-emerald-400 font-semibold mb-2 flex items-center gap-1.5"><List className="w-4 h-4"/> Thành phần ({selectedFood.ingredients_json?.length || 0})</h4>
                      <div className="bg-slate-950/30 rounded-lg p-3 space-y-2 border border-slate-800">
                        {selectedFood.ingredients_json?.map((ing, idx) => (
                          <div key={idx} className="flex justify-between items-center text-slate-300">
                            <span>• {ing.name}</span>
                            <span className="font-mono text-[10px] text-slate-500">{ing.mass} {ing.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <h4 className="text-blue-400 font-semibold mb-2 flex items-center gap-1.5"><BookOpen className="w-4 h-4"/> Cách làm</h4>
                      <div className="bg-slate-950/30 rounded-lg p-3 space-y-3 border border-slate-800">
                        {selectedFood.instructions_json?.map((inst, idx) => (
                          <div key={idx} className="flex gap-2 text-slate-300">
                            <span className="shrink-0 font-bold text-blue-500/70">Bước {inst.step}:</span>
                            <span>{inst.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

              </form>
            </div>
            
            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-800 bg-slate-950/30 shrink-0">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl font-medium text-slate-300 hover:bg-slate-800 transition-colors">
                {modalMode === "view" ? "Đóng" : "Hủy"}
              </button>
              {modalMode !== "view" && (
                <button form="food-form" type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold transition-colors">
                  {modalMode === "add" ? "Thêm mới" : "Lưu thay đổi"}
                </button>
              )}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}