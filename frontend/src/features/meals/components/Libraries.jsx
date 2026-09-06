import { BASE_URL } from "../../../services/JsonApi"
import { useState, useEffect } from "react"
import { 
  InsertFoodFromLibraryApi, 
  GetListFoodLibraryByCategoryNameApi,
  GetIngredientsByIdApi,
  GetInstructionsByIdApi,
} from "../api/FoodLibraryApi"
import { GetFoodByPlanDateAndMealTypeApi } from "../api/MealsApi"
import { Search, X, ChefHat, Carrot, Plus, Flame, Clock } from "lucide-react" // Thêm thư viện icon cho đẹp

export default function Libraries({
  devMode, // quản lý chế độ xem
  dateDetail,
  showLibrary, setShowLibrary, // biến cho phép mở đóng UI thư viện món ăn
  search, setSearch, // biến để giữ giá trị người dùng khi nhập vào ô tìm kiếm món ăn
  setMenuDay,
  selectedMeal, setSelectedMeal //// state chọn meal (UI tab), lựa chọn breakfast, lunch, dinner
}) {
  // ======================================================================================================
  // ==================== hiển thị danh sách món ăn trong thư viện theo category_name ====================
  // ======================================================================================================
  const [foodId, setFoodId] = useState(0) // lưu id món ăn khi người dùng bấm nút xem hướng dẫn hoặc xem nguyên liệu
  const [categoryName, setCategoryName] = useState("breakfast"); // dùng để lọc theo category_name
  const [listFoodLibraryByCategoryName, setListFoodLibraryByCategoryName] = useState([]); // chứa danh sách món ăn lọc bởi categoryName

  // API lấy thư viện món ăn 
  useEffect(() => {
    const loadApi = async () => {
      try {
        const response = await GetListFoodLibraryByCategoryNameApi(categoryName);
        console.log("DATA CỦA THƯ VIỆN MÓN ĂN:", response)
        setListFoodLibraryByCategoryName(response)
      } catch (error) {
        console.error("lỗi lấy thư viện món ăn", error);
      }
    };
    loadApi();
  }, [showLibrary, categoryName])

  // =======================================================================================================================
  // ==================== chức năng ghi món ăn vào menu của user từ thư viện ==============================================
  // =======================================================================================================================
  const [openQuantityPopup, setOpenQuantityPopup] = useState(false)
  const [selectedFood, setSelectedFood] = useState(null)
  const [quantity, setQuantity] = useState("")
  const [unit, setUnit] = useState("g")
  // API reload lại thư viện khi bấm chọn món ăn trong thư viện
  const loadGetFoodByPlanDateAndMealTypeApi = async () => {
    try {
      const data = await GetFoodByPlanDateAndMealTypeApi(
        devMode,
        dateDetail.currentDate,
        selectedMeal
      )

      setMenuDay(data) // set vào biến lưu thực đơn 1 ngày
    } catch (err) {
      console.error("LỖI LẤY MENU MÓN ĂN: ", err)
    }
  }
  // ==== API thêm món ăn vào menu khi bấm "chón món" ====
  const handleSelectMeal = async () => {
    if (!selectedFood) return

    try {
      setMenuDay((prev) => {
        return ([
          ...prev,
          {
            name: selectedFood.food_name,
            meal_type: selectedMeal,
            quantity,
            unit
          }
        ])
      })
      
      // 1. insert DB trước
      await InsertFoodFromLibraryApi(devMode, {
          food_id: selectedFood.food_id,
          meal_type: selectedMeal,
          plan_date: dateDetail.currentDate,
          week_start: dateDetail.dateStartInWeek,
          quantity: Number(quantity),
          unit: unit
      })

      // 2. get lại menu
      await loadGetFoodByPlanDateAndMealTypeApi();


      setOpenQuantityPopup(false)
      setShowLibrary(false);
    } catch (err) {
      console.error("LỖI THÊM MÓN TRỪ LIBRARY VÀ MENU: ", err)
    }
  }

  // Lọc món ăn kết hợp ô search (Bổ sung logic tìm kiếm ở UI)
  const filteredList = listFoodLibraryByCategoryName.filter(food => 
    food.food_name.toLowerCase().includes(search.toLowerCase())
  );

  // =======================================================================================================================================
  // ========================= chức năng xem nguyên liệu của món ăn ================================
  // =======================================================================================================================================
  const [ingredients, setIngredients] = useState(null)
  const onHandleIngredients = async (foodId) => {
    const response = await GetIngredientsByIdApi(foodId)
    setIngredients(response)
  }

  // =======================================================================================================================================
  // ========================= chức năng xem hướng dẫn nấu của món ăn ================================
  // =======================================================================================================================================
  const [instructions, setInstructions] = useState(null)
  const onHandleInstructions = async (foodId) => {
    const response = await GetInstructionsByIdApi(foodId)
    setInstructions(response)
  }

  
  
  return (
    <>
      {showLibrary && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          {/* Overlay Background */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowLibrary(false)}></div>

          {/* Modal Container */}
          <div className="relative w-full max-w-6xl h-[90vh] flex flex-col rounded-3xl glass-panel bg-slate-900/95 border border-white/10 shadow-2xl overflow-hidden animate-scale-in">
            
            {/* HEADER */}
            <div className="shrink-0 p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5">
              <div>
                <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                  Thư Viện <span className="text-brand-light">Món Ăn</span>
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Thêm món cho bữa {selectedMeal === "breakfast" ? "Sáng" : selectedMeal === "lunch" ? "Trưa" : "Tối"}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Tìm món ăn..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/50 transition-all"
                  />
                </div>

                {/* Category Select */}
                <select
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-sm text-white focus:outline-none focus:border-brand/50 transition-all cursor-pointer"
                >
                  <option className="bg-slate-800" value="breakfast">Bữa sáng</option>
                  <option className="bg-slate-800" value="savory_dishes">Món mặn</option>
                  <option className="bg-slate-800" value="sweet_dishes">Món ngọt</option>
                  <option className="bg-slate-800" value="drink">Nước uống</option>
                </select>

                {/* Close Button */}
                <button
                  onClick={() => setShowLibrary(false)}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/30 transition-all cursor-pointer hidden sm:block"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* GRID DANH SÁCH MÓN ĂN */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {filteredList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Search size={48} className="mb-4 opacity-20" />
                  <p>Không tìm thấy món ăn nào phù hợp.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredList.map((food, index) => (
                    <div
                      key={index}
                      className="group flex flex-col p-4 rounded-2xl glass-card border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all duration-300"
                    >
                      {/* Image */}
                      <div className="w-full h-44 rounded-xl overflow-hidden mb-4 relative border border-white/5">
                        <img
                          src={`${BASE_URL}${food.image_url}`}
                          alt={food.food_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-semibold text-lg text-white group-hover:text-brand-light transition-colors line-clamp-1">
                            {food.food_name}
                          </h3>
                          <span className="shrink-0 text-xs text-brand-light border border-brand/30 bg-brand/10 px-2 py-0.5 rounded-md">
                            {food.category_type}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><Flame size={12} className="text-orange-400"/> {food.calories} kcal</span>
                          <span className="flex items-center gap-1"><Clock size={12} className="text-sky-400"/> {food.cooking_time} phút</span>
                          <span>Độ khó: <span className="text-slate-300">{food.difficulty}</span></span>
                        </div>

                        <p className="text-sm text-slate-500 line-clamp-2 mt-2">
                          {food.description}
                        </p>
                      </div>

                      {/* Buttons */}
                      <div className="flex flex-wrap items-center gap-2 pt-4 mt-4 border-t border-white/10">
                        <button
                          onClick={() => {
                            onHandleIngredients(food.food_id)}}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs hover:bg-white/10 hover:text-white transition cursor-pointer"
                        >
                          <Carrot size={14} className="text-emerald-400"/> Nguyên liệu
                        </button>

                        <button
                          onClick={() => {onHandleInstructions(food.food_id)}}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs hover:bg-white/10 hover:text-white transition cursor-pointer"
                        >
                          <ChefHat size={14} className="text-sky-400"/> Cách nấu
                        </button>

                        <button
                          onClick={() => {
                            setSelectedFood(food)
                            setQuantity("")
                            setUnit("g")
                            setOpenQuantityPopup(true)
                          }}
                          className="ml-auto flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-linear-to-r from-brand to-[#E86D6A] text-white text-sm font-medium hover:opacity-90 transition shadow-lg shadow-brand/20 cursor-pointer"
                        >
                          <Plus size={16} /> Chọn
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Close Mobile */}
            <div className="sm:hidden p-4 border-t border-white/10 bg-black/20">
              <button 
                onClick={() => setShowLibrary(false)}
                className="w-full py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP NHẬP ĐỊNH LƯỢNG KHI CHỌN MÓN */}
      <Popup
        open={openQuantityPopup}
        onClose={() => setOpenQuantityPopup(false)}
        title="Nhập định lượng món ăn"
        width="w-400"
      >
        <div className="space-y-5">
          {/* ================= LƯU Ý ================= */}
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">

            <div className="flex items-start gap-3">

                {/* Icon */}
                <div className="shrink-0 w-9 h-9 rounded-xl bg-amber-400/10 flex items-center justify-center">
                    <span className="text-lg">💡</span>
                </div>

                <div className="space-y-2 text-sm leading-relaxed">

                    <h3 className="font-semibold text-amber-300">
                        Lưu ý về đơn vị
                    </h3>

                    <p className="text-slate-300">
                        Để hệ thống tính toán lượng calo và dinh dưỡng chính xác
                        hơn, bạn nên ưu tiên sử dụng các đơn vị có thể đo lường
                        cụ thể như:
                    </p>

                    {/* Đơn vị khuyến nghị */}
                    <div className="flex flex-wrap gap-2 pt-1">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-xs font-medium">
                            ✓ Gram (g)
                        </span>

                        <span className="px-2.5 py-1 rounded-lg bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-xs font-medium">
                            ✓ Mililit (ml)
                        </span>

                        <span className="px-2.5 py-1 rounded-lg bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-xs font-medium">
                            ✓ Kilogram (kg)
                        </span>

                        <span className="px-2.5 py-1 rounded-lg bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-xs font-medium">
                            ✓ Lít (l)
                        </span>
                    </div>

                    <p className="text-slate-400 text-xs pt-1">
                        Ví dụ: thay vì nhập <strong className="text-slate-300">1 con gà</strong>,
                        bạn nên nhập khoảng <strong className="text-emerald-300">200 g</strong>
                        nếu đó là lượng gà bạn thực tế sử dụng.
                    </p>

                </div>
            </div>
          </div>

          {/* ================= ĐƠN VỊ ƯỚC LƯỢNG ================= */}
          <div className="rounded-2xl border border-sky-400/15 bg-sky-400/5 p-4">

            <div className="flex items-start gap-3">

                <div className="shrink-0 w-8 h-8 rounded-lg bg-sky-400/10 flex items-center justify-center">
                    <span className="text-sm">ℹ️</span>
                </div>

                <div className="flex-1">

                    <h4 className="text-sm font-medium text-sky-300 mb-1">
                        Nếu bạn không biết chính xác khối lượng
                    </h4>

                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                        Bạn vẫn có thể sử dụng các đơn vị ước lượng.
                        Để thuận tiện cho việc tính toán, hệ thống sẽ quy đổi
                        các đơn vị này theo giá trị mặc định.
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs">

                        <div className="flex justify-between px-3 py-2 rounded-lg bg-black/20 border border-white/5">
                            <span className="text-slate-400">1 quả</span>
                            <span className="text-slate-200 font-medium">
                                ≈ 100 g
                            </span>
                        </div>

                        <div className="flex justify-between px-3 py-2 rounded-lg bg-black/20 border border-white/5">
                            <span className="text-slate-400">1 suất</span>
                            <span className="text-slate-200 font-medium">
                                ≈ 100 g
                            </span>
                        </div>

                        <div className="flex justify-between px-3 py-2 rounded-lg bg-black/20 border border-white/5">
                            <span className="text-slate-400">1 cốc</span>
                            <span className="text-slate-200 font-medium">
                                ≈ 100 ml
                            </span>
                        </div>

                        <div className="flex justify-between px-3 py-2 rounded-lg bg-black/20 border border-white/5">
                            <span className="text-slate-400">1 bát</span>
                            <span className="text-slate-200 font-medium">
                                ≈ 100 g
                            </span>
                        </div>

                        <div className="flex justify-between px-3 py-2 rounded-lg bg-black/20 border border-white/5">
                            <span className="text-slate-400">1 cái</span>
                            <span className="text-slate-200 font-medium">
                                ≈ 100 g
                            </span>
                        </div>

                        <div className="flex justify-between px-3 py-2 rounded-lg bg-black/20 border border-white/5">
                            <span className="text-slate-400">Đơn vị khác</span>
                            <span className="text-slate-200 font-medium">
                                ≈ 100
                            </span>
                        </div>

                    </div>

                    <p className="text-[11px] text-slate-500 mt-3 italic">
                        * Đây là giá trị quy ước để hệ thống ước tính, thực tế
                        có thể khác tùy từng loại thực phẩm.
                    </p>

                </div>
            </div>
          </div>

          {/* ================= NHẬP SỐ LƯỢNG ================= */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
                Số lượng
            </label>

            <input
                type="number"
                min="0"
                step="0.1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-black/30 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-brand/50 focus:border-brand/50 transition-all placeholder:text-slate-600"
                placeholder="Ví dụ: 200"
            />

          </div>

          {/* ================= CHỌN ĐƠN VỊ ================= */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-300">
                    Đơn vị
                </label>

                <span className="text-[11px] text-emerald-400">
                    Khuyến nghị: g / ml
                </span>
            </div>

            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full bg-black/30 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-brand/50 focus:border-brand/50 transition-all cursor-pointer"
            >
              {selectedFood?.unit_support?.map((item) => (
                <option
                  key={item}
                  value={item}
                  className="bg-slate-800"
                >
                  {item}
                </option>
              ))}      
            </select>
          </div>

          {/* ================= BUTTON ================= */}
          <button
            onClick={handleSelectMeal}
            disabled={!quantity || Number(quantity) <= 0}
            className="w-full bg-linear-to-r from-brand to-[#E86D6A] text-white py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand/20 mt-2"
        >
            <span className="flex items-center justify-center gap-2">
                <Plus size={17} />
                Thêm món vào thực đơn
            </span>
          </button>
        </div>
      </Popup>

      {/* ===== MODAL NGUYÊN LIỆU ===== */}
      {ingredients && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIngredients(null)}></div>
          <div className="relative w-full max-w-md rounded-3xl glass-panel bg-slate-900/80 border border-white/10 p-6 sm:p-8 animate-scale-in shadow-2xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
              <h2 className="text-xl font-display font-semibold text-white flex items-center gap-2">
                <Carrot className="text-emerald-400" /> Nguyên Liệu
              </h2>

              <button
                onClick={() => setIngredients(null)}
                className="p-2 -mr-2 text-slate-400 hover:bg-white/10 hover:text-white rounded-full transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {ingredients.map((i, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-slate-200"
                >
                  <span className="font-medium">{i.name}</span>
                  <span className="text-sm text-brand-light font-semibold bg-brand/10 px-2 py-1 rounded-md">
                    {i.mass} {i.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}     

      {/* ===== MODAL CÁCH NẤU ===== */}
      {instructions && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setInstructions(null)}></div>
          <div className="relative w-full max-w-xl rounded-3xl glass-panel bg-slate-900/80 border border-white/10 p-6 sm:p-8 animate-scale-in shadow-2xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
              <h2 className="text-xl font-display font-semibold text-white flex items-center gap-2">
                <ChefHat className="text-sky-400" /> Hướng Dẫn Cách Nấu
              </h2>

              <button
                onClick={() => setInstructions(null)}
                className="p-2 -mr-2 text-slate-400 hover:bg-white/10 hover:text-white rounded-full transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {instructions.map((s) => (
                <div
                  key={s.step}
                  className="flex gap-4 p-4 rounded-xl glass-card bg-white/5 border border-white/5"
                >
                  <div className="shrink-0 w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm">
                    {s.step}
                  </div>
                  <div className="text-slate-300 leading-relaxed text-sm pt-1">
                    {s.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}   
    </>
  )
}

// ==============================================================================
// Các Component Phụ (Popup) đã được Glassmorphism hóa
// ==============================================================================

function LibrariesPopup({ open, setOpen, mode, ingredients, instructions }) {
  return (
    <Popup
      open={open}
      onClose={() => setOpen(false)}
      title={
        mode === "ingredients" ? "Nguyên liệu" : mode === "instructions" ? "Cách nấu" : "Thông tin"
      }
    >
      {mode === "ingredients" && ingredients && (
        <div className="space-y-2 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
          {ingredients.map((i, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center bg-white/5 border border-white/5 px-4 py-3 rounded-xl text-slate-200"
            >
              <span className="font-medium">{i.name}</span>
              <span className="text-sm bg-brand/10 text-brand-light px-2 py-1 rounded-md font-semibold">
                {i.mass} {i.unit}
              </span>
            </div>
          ))}
        </div>
      )}

      {mode === "instructions" && instructions && (
        <div className="space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
          {instructions.map((s) => (
            <div
              key={s.step}
              className="flex gap-4 bg-white/5 border border-white/5 px-4 py-4 rounded-xl text-slate-300 text-sm leading-relaxed"
            >
              <span className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-sky-500/20 text-sky-400 font-bold">
                {s.step}
              </span>
              <span className="pt-1">{s.text}</span>
            </div>
          ))}
        </div>
      )}
    </Popup>
  )
}

function Popup({ open, onClose, title, children, width }) {
  if (!open) return null

  return (
    <div className={`fixed inset-0 z-[150] flex items-center justify-center p-4 `}>
      {/* Nền mờ đè lên mọi thứ */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm `}
        onClick={onClose}
      />

      {/* Khung nội dung */}
      <div className={`relative bg-slate-900/95 border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 animate-scale-in ${width}`}>
        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
          <h2 className="text-xl font-display font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 -mr-2 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}