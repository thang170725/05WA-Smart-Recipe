import { BASE_URL } from "../../../services/JsonApi"
import { useState, useEffect } from "react"
import { 
  InsertFoodFromLibraryApi, 
  GetListFoodLibraryByCategoryNameApi,
  GetIngredientsByIdApi,
  GetInstructionsByIdApi,
} from "../api/FoodLibraryApi"
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

  // ======================================================================================================
  // ==================== hiển thị hướng dẫn nấu 1 món ăn ==============================================
  // ======================================================================================================
  const [instructions, setInstructions] = useState([]) // lưu hướng dẫn
  const [ingredients, setIngredients] = useState([]) // lưu nguyên liệu
  const [mode, setMode] = useState("unknown") // quyết định mở hướng dẫn hay nguyên liệu
  const [open, setOpen] = useState(false) 
  
  useEffect(() => {
    if (foodId !== 0) {
      const loadApi = async () => {
        const ins = await GetInstructionsByIdApi(foodId)
        const ing = await GetIngredientsByIdApi(foodId)
        setInstructions(ins)
        setIngredients(ing)
      }
      loadApi()
    }
  }, [foodId])

  // =======================================================================================================================
  // ==================== chức năng ghi món ăn vào menu của user từ thư viện ==============================================
  // =======================================================================================================================
  const [openQuantityPopup, setOpenQuantityPopup] = useState(false)
  const [selectedFood, setSelectedFood] = useState(null)
  const [quantity, setQuantity] = useState("")
  const [unit, setUnit] = useState("g")
  
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
      
      await InsertFoodFromLibraryApi(devMode, {
          food_id: selectedFood.food_id,
          meal_type: selectedMeal,
          plan_date: dateDetail.currentDate,
          week_start: dateDetail.dateStartInWeek,
          quantity: Number(quantity),
          unit: unit
      })

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

  return (
    <>
      {showLibrary && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
                            setFoodId(food.food_id)
                            setMode("ingredients")
                            setOpen(true)
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs hover:bg-white/10 hover:text-white transition cursor-pointer"
                        >
                          <Carrot size={14} className="text-emerald-400"/> Nguyên liệu
                        </button>

                        <button
                          onClick={() => {
                            setFoodId(food.food_id)
                            setMode("instructions")
                            setOpen(true)
                          }}
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
                          className="ml-auto flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-brand to-[#E86D6A] text-white text-sm font-medium hover:opacity-90 transition shadow-lg shadow-brand/20 cursor-pointer"
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

      {/* POPUP HIỂN THỊ NGUYÊN LIỆU / CÁCH NẤU */}
      <LibrariesPopup
        open={open}
        setOpen={setOpen}
        mode={mode}
        ingredients={ingredients}
        instructions={instructions}
      />

      {/* POPUP NHẬP ĐỊNH LƯỢNG KHI CHỌN MÓN */}
      <Popup
        open={openQuantityPopup}
        onClose={() => setOpenQuantityPopup(false)}
        title="Nhập định lượng"
      >
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm text-slate-300">
              Số lượng
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-black/30 border border-white/10 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand/50 focus:border-brand/50 transition-all"
              placeholder="VD: 100"
            />
          </div>
                  
          <div>
            <label className="block mb-2 text-sm text-slate-300">
              Đơn vị
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full bg-black/30 border border-white/10 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand/50 focus:border-brand/50 transition-all"
            >
              <option className="bg-slate-800" value="g">Gram (g)</option>
              <option className="bg-slate-800" value="kg">Kilogram (kg)</option>
              <option className="bg-slate-800" value="ml">Mililit (ml)</option>
              <option className="bg-slate-800" value="l">Lít (l)</option>
            </select>
          </div>
                  
          <button
            onClick={handleSelectMeal}
            className="w-full bg-gradient-to-r from-brand to-[#E86D6A] text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity shadow-lg shadow-brand/20 mt-2"
          >
            Xác nhận
          </button>
        </div>
      </Popup>
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

function Popup({ open, onClose, title, children }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Nền mờ đè lên mọi thứ */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Khung nội dung */}
      <div className="relative w-full max-w-md bg-slate-900/95 border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 animate-scale-in">
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