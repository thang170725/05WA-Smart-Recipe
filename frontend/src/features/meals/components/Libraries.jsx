import Meals from "../../../pages/MealsPage"
import { BASE_URL } from "../../../services/JsonApi"
import { useState, useEffect } from "react"
import { 
  InsertFoodFromLibraryApi, 
  GetListFoodLibraryByCategoryNameApi,
  GetIngredientsByIdApi,
  GetInstructionsByIdApi,
} from "../api/FoodLibraryApi"

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
    if (foodId != 0) {
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

  return (
    <>
      {showLibrary && (
        <div className="fixed inset-0 bg-black/50 flex justify-end z-50 top-18">
          {/* SIDE PANEL */}
          <div className="w-[55%] bg-gray-200 backdrop-blur-xl shadow-2xl overflow-y-auto p-8 animate-slideLeft rounded-l-xl">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-bold text-[#E15644] tracking-wide">
                Thư viện món ăn
              </h2>

              <button
                onClick={() => setShowLibrary(false)}
                className="text-2xl text-slate-400 hover:text-red-500 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* FILTER */}
            <div className="flex gap-4 mb-8 ">
              <input
                type="text"
                placeholder="Tìm món ăn..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#E15644] flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none transition shadow-sm"
              />

              <select
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="bg-[#E15644] px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none transition shadow-sm"
              >
                <option value="breakfast">Bữa sáng</option>
                <option value="savory_dishes">Món mặn</option>
                <option value="sweet_dishes">Món ngọt</option>
                <option value="drink">Nước uống</option>
              </select>
            </div>

            {/* GRID */}
            <div className="grid grid-cols-3 gap-6">
              {listFoodLibraryByCategoryName.map((food, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition duration-300 overflow-hidden hover:-translate-y-2"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={`${BASE_URL}${food.image_url}`}
                      alt={food.food_name}
                      className="h-44 w-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition" />
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="font-semibold text-lg text-sky-900">
                      {food.food_name}
                    </h3>

                    <p className="text-sm text-slate-500">
                      {food.calories} kcal • {food.cooking_time} phút • {food.difficulty}
                    </p>

                    <p className="text-xs text-slate-400">
                      {food.category_name} ({food.category_type})
                    </p>

                    <p className="text-sm text-slate-600 line-clamp-2">
                      {food.description}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-3">
                      <button
                        onClick={() => {
                          setFoodId(food.food_id)
                          setMode("ingredients")
                          setOpen(true)
                        }}
                        className="text-xs px-3 py-1.5 rounded-full bg-sky-100 text-sky-700 hover:bg-sky-200 transition"
                      >
                        Nguyên liệu
                      </button>

                      <button
                        onClick={() => {
                          setFoodId(food.food_id)
                          setMode("instructions")
                          setOpen(true)
                        }}
                        className="text-xs px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition"
                      >
                        Cách nấu
                      </button>

                      <button
                        onClick={() => {
                          setSelectedFood(food)
                          setQuantity("")
                          setUnit("g")
                          setOpenQuantityPopup(true)
                        }}
                        className="text-xs px-3 py-1.5 rounded-full bg-linear-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90 transition shadow"
                      >
                        Chọn món
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            
          </div>

        </div>
      )}
      <LibrariesPopup
              open={open}
              setOpen={setOpen}
              mode={mode}
              ingredients={ingredients}
              instructions={instructions}
            />

            <Popup
              open={openQuantityPopup}
              onClose={() => setOpenQuantityPopup(false)}
              title="Nhập định lượng"
            >
              <div className="space-y-4">
                        
                <div>
                  <label className="block mb-1">
                    Số lượng
                  </label>
                        
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-black"
                  />
                </div>
                        
                <div>
                  <label className="block mb-1">
                    Đơn vị
                  </label>
                        
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-black"
                  >
                    <option value="g">Gram (g)</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="ml">ml</option>
                    <option value="l">Lít</option>
                  </select>
                </div>
                        
                <button
                  onClick={handleSelectMeal}
                  className="w-full bg-indigo-500 text-white py-2 rounded-lg"
                >
                  Xác nhận
                </button>
                        
              </div>
            </Popup>
    </>
  )
}

function LibrariesPopup({ open, setOpen, mode, ingredients, instructions }) {
  return (
    <Popup
      open={open}
      onClose={() => setOpen(false)}
      title={
        mode === "ingredients"
          ? "Nguyên liệu"
          : mode === "instructions"
          ? "Cách nấu"
          : "Thông tin"
      }
    >
      {mode === "ingredients" && ingredients && (
        <div className="space-y-2 text-sm text-slate-700">
          {ingredients.map((i, idx) => (
            <div
              key={idx}
              className="bg-slate-50 px-3 py-2 rounded-lg shadow-sm"
            >
              {i.name} ({i.mass}
              {i.unit})
            </div>
          ))}
        </div>
      )}

      {mode === "instructions" && instructions && (
        <div className="space-y-3 text-sm text-slate-700">
          {instructions.map((s) => (
            <div
              key={s.step}
              className="bg-slate-50 px-4 py-3 rounded-lg shadow-sm"
            >
              <span className="font-semibold text-sky-700">
                B{s.step}:
              </span>{" "}
              {s.text}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 bg-white w-full max-w-lg rounded-2xl shadow-2xl p-8 animate-scaleIn">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-sky-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-500 transition text-xl"
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}