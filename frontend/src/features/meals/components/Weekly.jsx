import { BASE_URL } from "../../../services/JsonApi"
import { PostMealsApi, 
  GetFoodByPlanDateAndMealTypeApi, 
  RemoveMealApi } from "../api/MealsApi"
import { 
  GetIdAndNameFromFoodLibrary,
  GetIngredientsByIdApi,
  GetInstructionsByIdApi
 } from "../api/FoodLibraryApi";
import { useState, useRef, useEffect } from "react";
import { Search, Plus, ChefHat, Carrot, Trash2 } from "lucide-react";

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Chọn..."
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // click outside để đóng
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative w-28">
      {/* Button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-white/10 hover:border-white/20 text-white text-sm flex items-center justify-between transition-colors focus:ring-2 focus:ring-brand/50 outline-none"
      >
        {selected ? selected.label : placeholder}
        <span className="text-white/50 text-xs">▼</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full glass-card-elevated border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fade-in backdrop-blur-2xl">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors
                hover:bg-brand/20
                ${value === opt.value ? "bg-brand/30 text-brand-light font-medium" : "text-slate-300"}`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Weekly ({ 
  devMode, // chọn chế độ production và dev
  dateDetail, // quản lý thời gian (ngày, giờ)
  currentDate, // quản lý ngày hiện tại hoặc ngày mà hệ thống focus
  setSelectedMealType,
  setShowLibrary,
  selectedDay,
  menuDay, setMenuDay,
  selectedMeal, setSelectedMeal // lựa chọn 1 trong các option breakfast, lunch, dinner
}) {   
    // =======================================================================================================================================
    // ========================= chức năng select và ghi lại xem người dùng đang ở breakfast, lunch, dinner  ================================
    // =======================================================================================================================================
    const meals = [
        { key: "breakfast", label: "Bữa Sáng", icon: "🌅" },
        { key: "lunch", label: "Bữa Trưa", icon: "☀️" },
        { key: "dinner", label: "Bữa Tối", icon: "🌙" },
    ];

    const [activeMeal, setActiveMeal] = useState(null); // xác định meal card nào đang mở input thêm món
    const [chooseMode, setChooseMode] = useState("") // xác định xem người dùng đang chọn món bằng nhập tay hay dùng library (hand, library) 
    
    // =======================================================================================================================================
    // ========================= chức năng lấy menu trong 1 ngày dựa vào plan_date và meal_type ================================
    // =======================================================================================================================================
    // ==== API lấy Menu thực đơn trong 1 ngày ======
    const [isLoaded, setIsLoaded] = useState(false)
    const loadGetFoodByPlanDateAndMealTypeApi = async () => {
      try {
        const data = await GetFoodByPlanDateAndMealTypeApi(
          devMode,
          dateDetail.currentDate,
          selectedMeal
        )
  
        setMenuDay(data) // set vào biến lưu thực đơn 1 ngày
        setIsLoaded(true) // ✅ đánh dấu đã load xong
      } catch (err) {
        console.error("LỖI LẤY MENU MÓN ĂN: ", err)
      }
    }
    useEffect(() => {
      loadGetFoodByPlanDateAndMealTypeApi()
    }, [currentDate, selectedMeal])
    
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
    
    // ====== USESTAE FOR USER ENTER MEAL AS HAND =======
    // ====== thêm món vào thực đơn =======
    const [newMealName, setNewMealName] = useState(""); // dùng để giữ giá trị người dùng đang nhập trong input
    const [quantityValue, setQuantityValue] = useState("")
    const unitOptions = [
      { value: "g", label: "g" },
      { value: "ml", label: "ml" },
      { value: "l", label: "l" },
      { value: "cai", label: "cái" },
    ];
    const [quantityUnit, setQuantityUnit] = useState("")
    // ==== API lưu món ăn mới vào thức đơn khi user chọn nhập tay ===
    const handleInsertNewMeal = async () => {
      try {
        await PostMealsApi(devMode, {
          food_id: selectIdFood,
          new_meal: newMealName,
          meal_type: selectedMeal,
          plan_date: dateDetail.currentDate,
          week_start: dateDetail.dateStartInWeek,
          quantity_value: Number(quantityValue),
          quantity_unit: quantityUnit
        })
      } catch (err) {
          console.error("LỖI INSERT MÓN MỚI: ", err)
      }
    }

    // ===========================================
    // ==== chức năng xóa món khỏi thực đơn =====
    // ===========================================
    const removeDish = async (meal) => {
      await RemoveMealApi(devMode, meal.meal_id)

      setMenuDay((prev) => prev.filter((m) => m.id !== meal.id)); // cập nhật UI
    };

    // lấy meal hiện tại
    const currentMeal = meals.find(m => m.key === selectedMeal);
  
  // ====== xử lý logic khi bấm nút "+ Nhập tay" ======

  // ====== API lấy id và name trong trong thư viện món ăn ======
  // mục đích dùng để lọc tìm kiếm
  const [idAndNameFoodLibrary, setIdAndNameFoodLibrary] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectIdFood, setSelectIdFood] = useState(-1)
  const [isSelecting, setIsSelecting] = useState(false);
  
  const clickEnterHand = async () => {
    try {
      const response = await GetIdAndNameFromFoodLibrary(devMode)
      console.log("Food library:", response)
      setIdAndNameFoodLibrary(response)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (isSelecting) {
      setIsSelecting(false)
      return
    }

    if (!newMealName.trim()) {
      setSuggestions([])
      return
    }

    const filtered = idAndNameFoodLibrary.filter(item =>
      item.name.toLowerCase().includes(newMealName.toLowerCase())
    )

    setSuggestions(filtered)
  }, [newMealName, idAndNameFoodLibrary])

 
  
  return (
    <div className="mb-20">       
      {/* ===== TABS SÁNG / TRƯA / TỐI (nút bấm chuyển tab) ===== */}
      <div className="flex flex-wrap gap-3 mb-6 p-1.5 glass-panel inline-flex rounded-2xl">
        {meals.map((meal) => {
          return (
              <button
                  key={meal.key}
                  onClick={() => setSelectedMeal(meal.key)}
                  className={`
                      px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300
                      flex items-center gap-2 cursor-pointer

                      ${selectedMeal === meal.key
                          ? "bg-gradient-to-r from-[#E85D4A] to-[#E86D6A] text-white shadow-[0_0_15px_rgba(232,93,74,0.4)]"
                          : "bg-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200"
                      }
                  `}
              >
                  <span className="text-base">{meal.icon}</span>
                  <span>{meal.label}</span>
              </button>
          )
        })}
      </div>

      {/* ===== MEAL DETAIL (FULL WIDTH) ===== */}
      <div className="glass-panel p-6 sm:p-8 space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-3">
              <span className="text-3xl">{currentMeal.icon}</span>
              <h2 className="text-2xl font-display font-semibold text-white">
                 {currentMeal.label}
              </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
                onClick={() => {
                    setActiveMeal(selectedMeal)
                    setChooseMode("hand")
                    clickEnterHand()
                }}
                className="cursor-pointer flex items-center gap-2 text-slate-300 text-sm font-medium px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
            >
              <Plus size={16} /> Nhập tay
            </button>

            <button
                onClick={() => {
                    setSelectedMealType(selectedMeal);
                    setShowLibrary(true);
                    setChooseMode("library")
                }}
                className="cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-[#E85D4A] to-[#E86D6A] text-white hover:opacity-90 shadow-lg shadow-brand/20 transition-all"
            >
              <Search size={16} /> Chọn từ thư viện
            </button>
          </div>
        </div>

        {/* LIST */}
        <div className="space-y-4">
            {menuDay.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 glass-card border-dashed border-white/10">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <span className="text-3xl grayscale opacity-50">🍜</span>
                </div>
                <div className="text-base font-medium text-slate-300">Chưa có món nào</div>
                <div className="text-sm mt-1">Hãy thêm món ăn cho {currentMeal.label.toLowerCase()} nhé</div>
              </div>
            ) : (
              <div className="space-y-4">
                {menuDay.map((meal, idx) => (
                  <div
                    key={meal.name}
                    className="group flex flex-col sm:flex-row gap-5 p-4 rounded-2xl glass-card hover:border-white/20 hover:bg-white/5 transition-all duration-300"
                  >
                    {/* Ảnh */}
                    <div className="relative shrink-0 overflow-hidden rounded-xl w-full sm:w-32 h-40 sm:h-32 border border-white/5">
                        <img
                        src={`${BASE_URL}${meal.image_url}`}
                        alt={meal.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>

                    {/* Nội dung */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="text-lg font-display font-semibold text-white group-hover:text-brand-light transition-colors">
                            {meal.name}
                          </h3>

                          <p className="text-sm text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {meal.description}
                          </p>

                          <div className="flex items-center gap-4 mt-3">
                              <div className="text-sm text-orange-400 font-bold bg-orange-400/10 px-2.5 py-1 rounded-md">
                                🔥 {Math.round((meal.calories_per_100 * meal.quantity) / 100)} kcal
                              </div>
                              
                              {(meal.quantity || meal.unit) && (
                                <div className="text-xs font-medium text-sky-300 bg-sky-400/10 px-2.5 py-1 rounded-md">
                                  Khẩu phần: {meal.quantity} {meal.unit}
                                </div>
                              )}
                          </div>
                        </div>

                        <button
                          onClick={() => removeDish(meal)}
                          className="p-2 rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer"
                          title="Xóa món ăn"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
                        <button
                          onClick={() => onHandleIngredients(meal.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs font-medium hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                        >
                          <Carrot size={14} className="text-emerald-400"/> Nguyên liệu
                        </button>

                        <button
                          onClick={() => onHandleInstructions(meal.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-medium hover:bg-sky-500/20 hover:text-sky-200 transition-colors cursor-pointer"
                        >
                          <ChefHat size={14} /> Cách nấu
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* ====== INPUT FOR USER ENTER MEAL AS HAND ====== */}
        {activeMeal === selectedMeal && (
        <div className="mt-6 p-5 glass-card bg-white/5 border-dashed border-brand/30 rounded-2xl relative animate-fade-in"> 
            <div className="text-sm font-medium text-brand-light mb-3 flex items-center gap-2">
                <Plus size={16} /> Thêm món ăn thủ công
            </div>
            
            <div className="flex flex-col md:flex-row gap-3"> 
                {/* Tên món */}
                <div className="flex-1 relative">
                    <input
                        className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand/50 transition-all"
                        placeholder="Nhập tên món ăn (vd: Cơm trắng, Thịt bò...)"
                        value={newMealName}
                        onChange={(e) => setNewMealName(e.target.value)}
                    />

                    {suggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-2 z-40 bg-slate-800/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                        {suggestions.map((item) => (
                            <div
                            key={item.id}
                            onClick={() => {
                                setIsSelecting(true)
                                setNewMealName(item.name)
                                setSelectIdFood(item.id)
                                setSuggestions([])
                            }}
                            className="px-4 py-3 text-sm text-slate-200 hover:bg-brand/20 hover:text-brand-light cursor-pointer border-b border-white/5 last:border-0 transition-colors"
                            >
                            {item.name.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                            </div>
                        ))}
                        </div>
                    )}
                </div>

                {/* Số lượng & Đơn vị (Gom chung trên mobile) */}
                <div className="flex gap-2">
                    <input
                        type="number"
                        min="0"
                        step="0.1"
                        className="w-24 px-4 py-2.5 rounded-xl bg-black/20 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand/50 transition-all text-center"
                        placeholder="SL (vd: 300)"
                        value={quantityValue}
                        onChange={(e) => setQuantityValue(e.target.value)}
                    />

                    <CustomSelect
                        options={unitOptions}
                        value={quantityUnit}
                        onChange={setQuantityUnit}
                    />
                </div>

                {/* Button Thêm & Hủy */}
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                        if (!newMealName.trim()) return;
                        if (!quantityValue || quantityValue <= 0) return;
                        
                        const newItem = {
                            food_id: selectIdFood,
                            name: newMealName.trim(),
                            meal_type: selectedMeal,
                            quantity_value: Number(quantityValue),
                            quantity_unit: quantityUnit,
                        };
                        
                        setMenuDay((prev) => [...prev, newItem]);
                        handleInsertNewMeal();
                        
                        // reset & close
                        setNewMealName("");
                        setQuantityValue("");
                        setQuantityUnit("g");
                        setActiveMeal(null);
                        }}
                        className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-linear-to-r from-[#E85D4A] to-[#E86D6A] hover:opacity-90 text-white text-sm font-medium shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                    >
                        Thêm
                    </button>   
                    
                    <button
                        onClick={() => setActiveMeal(null)}
                        className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-sm font-medium transition-all cursor-pointer"
                    >
                        Hủy
                    </button>
                </div>
            </div>
        </div>
        )}   
      </div>     

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
    </div>
  )
}