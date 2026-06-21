import { BASE_URL } from "../../../services/JsonApi"
import { PostMealsApi, 
  GetFoodByPlanDateAndMealTypeApi, 
  RemoveMealApi } from "../api/MealsApi"
import { GetIdAndNameFromFoodLibrary } from "../api/FoodLibraryApi";
import { useState, useRef, useEffect } from "react";

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
    <div ref={ref} className="relative w-24">
      {/* Button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2 rounded-xl glass-card text-white text-sm flex items-center justify-between"
      >
        {selected ? selected.label : placeholder}
        <span className="text-white/70">▼</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full glass-card-elevated rounded-xl shadow-lg overflow-hidden animate-fade-in">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`px-3 py-2 text-sm cursor-pointer transition
                hover:bg-sky-500/30
                ${value === opt.value ? "bg-sky-500/40" : "text-white"}`}
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
    // TEST
    useEffect(() => {
      console.log("🔥 selectedDay:", selectedDay)
    }, [selectedDay])

    // =======================================================================================================================================
    // ========================= chức năng select và ghi lại xem người dùng đang ở breakfast, lunch, dinner  ================================
    // =======================================================================================================================================
    const meals = [
        { key: "breakfast", label: "Sáng", icon: "🌅" },
        { key: "lunch", label: "Trưa", icon: "☀️" },
        { key: "dinner", label: "Tối", icon: "🌙" },
    ];

    const [activeMeal, setActiveMeal] = useState(null); // xác định meal card nào đang mở input thêm món
    const [chooseMode, setChooseMode] = useState("") // xác định xem người dùng đang chọn món bằng nhập tay hay dùng library (hand, library) 
    
    // =======================================================================================================================================
    // ========================= chức năng lấy menu trong 1 ngày dựa vào plan_date và meal_type ================================
    // =======================================================================================================================================
    // ==== API lấy Menu thực đơn trong 1 ngày ======
    const [isLoaded, setIsLoaded] = useState(false)
    useEffect(() => {
        try {
          const loadApi = async () => {
            const data = await GetFoodByPlanDateAndMealTypeApi(
              devMode,
              dateDetail.currentDate,
              selectedMeal
            )

            console.log(data)
            setMenuDay(data) // set vào biến lưu thực đơn 1 ngày
            setIsLoaded(true) // ✅ đánh dấu đã load xong
          }

          loadApi()

        } catch (err) {
          console.error("LỖI LẤY MENU MÓN ĂN: ", err)
        }
      }, [currentDate, selectedMeal])

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
    
    // ==== API xóa món khỏi thực đơn =====
    const removeDish = async (meal) => {
      await RemoveMealApi(devMode, {
          id: meal.id,
      })

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

  // ====== Modal xem chi tiết món ăn ======
  const [ingredientMeal, setIngredientMeal] = useState(null)
  const [recipeMeal, setRecipeMeal] = useState(null)
  
  return (
    <div className="mb-30">       
      {/* ===== MODAL NGUYÊN LIỆU ===== */}
{ingredientMeal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-white/10 p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold text-white">
          🥕 Nguyên liệu
        </h2>

        <button
          onClick={() => setIngredientMeal(null)}
          className="text-gray-400 hover:text-red-400"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        {ingredientMeal.ingredients?.map((item, idx) => (
          <div
            key={idx}
            className="px-4 py-3 rounded-xl bg-white/5 text-gray-300"
          >
            • {item}
          </div>
        ))}
      </div>
    </div>
  </div>
)}     

      {/* ===== MODAL CÁCH NẤU ===== */}
{recipeMeal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-white/10 p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold text-white">
          👨‍🍳 Cách nấu
        </h2>

        <button
          onClick={() => setRecipeMeal(null)}
          className="text-gray-400 hover:text-red-400"
        >
          ✕
        </button>
      </div>

      <div className="rounded-2xl bg-white/5 p-5 text-gray-300 leading-7">
        {recipeMeal.recipe}
      </div>
    </div>
  </div>
)}
      {/* ===== TABS SÁNG / TRƯA / TỐI (nút bấm chuyển tab) ===== */}
      <div className="flex gap-3 mb-6">
        {meals.map((meal) => {
          return (
              <button
                  key={meal.key}
                  onClick={() => setSelectedMeal(meal.key)}
                  className={`
                      px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                      flex items-center gap-2

                      ${selectedMeal === meal.key
                          ? "bg-linear-to-r from-[#E85D4A] to-[#E86D6A] text-white shadow-lg scale-105"
                          : "bg-white/10 text-gray-300 hover:bg-white/20"
                      }
                  `}
              >
                  <span>{meal.icon}</span>
                  <span>{meal.label}</span>
              </button>
          )
        })}
      </div>

      {/* ===== MEAL DETAIL (FULL WIDTH) ===== */}
      <div className="glass-panel rounded-3xl backdrop-blur-xl border border-white/10 shadow-xl p-6 space-y-5 transition-all duration-300">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div className="text-2xl font-semibold text-gray-300">
              {currentMeal.icon} Bữa {currentMeal.label}
          </div>

          <div className="flex gap-2 font-bold">
            <button
                onClick={() => {
                    setActiveMeal(selectedMeal)
                    setChooseMode("hand")
                    clickEnterHand()
                }}
                className="cursor-pointer text-gray-300 text-sm px-5 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition"
            >
              + Nhập tay
            </button>

            <button
                onClick={() => {
                    setSelectedMealType(selectedMeal);
                    setShowLibrary(true);
                    setChooseMode("library")
                }}
                className="cursor-pointer px-3 py-1 rounded-lg text-sm bg-linear-to-r from-[#E85D4A] to-[#E86D6A] text-white hover:opacity-90 transition"
            >
              + Thư viện
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {/* LIST */}
          <div className="min-h-30 p-3 rounded-2xl">
            {menuDay.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <div className="text-4xl mb-2">🍜</div>
                <div className="text-sm">Chưa có món nào</div>
                <div className="text-xs mt-1">Hãy thêm món để bắt đầu</div>
              </div>
            ) : (
              <div className="space-y-4">
                {menuDay.map((meal, idx) => (
                  <div
                    key={meal.name}
                    className="
                      group
                      flex
                      gap-4
                      p-4
                      rounded-3xl
                      bg-white/5
                      border border-white/10
                      hover:bg-white/10
                      transition-all duration-300
                    "
                  >
                    {/* Ảnh */}
                    <img
                      src={`${BASE_URL}${meal.image_url}`}
                      alt={meal.name}
                      className="
                        w-28 h-28
                        rounded-2xl
                        object-cover
                        shrink-0
                      "
                    />

                    {/* Nội dung */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {meal.name}
                          </h3>

                          <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                            {meal.description}
                          </p>

                          <div className="mt-3 text-sm text-amber-300 font-medium">
                            🔥 {meal.calories_per_100 * meal.quantity / 100} kcal
                          </div>

                          {(meal.quantity || meal.unit) && (
                            <div className="mt-1 text-xs text-sky-300">
                              Khẩu phần:
                              {" "}
                              {meal.quantity}
                              {" "}
                              {meal.unit}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => removeDish(meal)}
                          className="
                            self-start
                            text-gray-400
                            hover:text-red-500
                            transition
                          "
                        >
                          ✕
                        </button>
                      </div>

                      <div className="flex gap-2 mt-4 flex-wrap">
              <button
                onClick={() => setIngredientMeal(meal)}
                className="
                  px-3 py-2
                  rounded-xl
                  bg-white/10
                  text-sm
                  hover:bg-white/20
                  transition
                "
              >
                🥕 Xem nguyên liệu
              </button>

              <button
                onClick={() => setRecipeMeal(meal)}
                className="
                  px-3 py-2
                  rounded-xl
                  bg-sky-500/20
                  text-sky-300
                  text-sm
                  hover:bg-sky-500/30
                  transition
                "
              >
                👨‍🍳 Xem cách nấu
              </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ====== INPUT FOR USER ENTER MEAL AS HAND*/}
          {activeMeal === selectedMeal && (
            <div className="flex gap-2 items-center"> 
              {/* Tên món */}
              <input
                className="flex-1 px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-sm text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Tên món ăn (vd: cơm)"
                value={newMealName}
                onChange={(e) => setNewMealName(e.target.value)}
              />

              {suggestions.length > 0 && (
                <div className="absolute -bottom-25 min-w-187 bg-gray-300/20 backdrop-blur-md rounded-xl max-h-40 overflow-y-auto">
                  {suggestions.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setIsSelecting(true)
                        setNewMealName(item.name)
                        setSelectIdFood(item.id)
                        setSuggestions([])
                      }}
                      className="px-3 py-2 text-sm text-white hover:bg-sky-500/30 cursor-pointer"
                    >
                      {item.name.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                    </div>
                  ))}
                </div>
              )}

              {/* Số lượng */}
              <input
                type="number"
                min="0"
                step="0.1"
                className="w-24 px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="300"
                value={quantityValue}
                onChange={(e) => setQuantityValue(e.target.value)}
              />

              {/* Đơn vị */}
              <CustomSelect
                options={unitOptions}
                value={quantityUnit}
                onChange={setQuantityUnit}
              />

              {/* Button */}
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
                
                  // reset
                  setNewMealName("");
                  setQuantityValue("");
                  setQuantityUnit("g");
                }}
                className="px-4 py-2 rounded-xl bg-linear-0 from-[#E85D4A] to-[#E86D6A] hover:bg-sky-600 text-sm font-medium transition"
              >
                + Thêm
              </button>           
            </div>
          )}   
        </div>
      </div>        
    </div>
  )
}