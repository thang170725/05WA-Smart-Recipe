import JsonApi from "../../../services/JsonApi"
import { MockDataMenuDay } from "../../../mockdata/Meal"

// ====== API POST =======
// lưu món mới
export async function PostMealsApi(devMode, payload) {
    if (devMode === "dev") {
        console.log("Lưu thực đơn (Post meal api):", payload)
        return
    }

    return JsonApi('/user/insert-new-meal', {
        method: 'POST',
        body: payload,
    })
}

// =========================
// ======= API GET =========
// =========================
// 
export async function GetFoodByPlanDateAndMealTypeApi(devMode, planDate, mealType) {
    if (devMode === "dev") {
        const list = MockDataMenuDay(planDate)
        console.log("MOCK DATA MENU DAY: ", list)
        return list
    }

    return JsonApi("/user/get-food-by-plan_date-and-meal_type", {
        method: "GET",
        params: {
            plan_date: planDate,
            meal_type: mealType
        }
    })
}

// lấy tổng lượng calo tuần của user bằng week_start 
export async function GetTotalWeekCaloriesApi(WeekStart) {
    return await JsonApi("/user/get-total-calories-week",
        {
            method: "GET",
            params: {
                week_start: WeekStart
            }
        }
    )
}

// ======= REMOVE ========
// xóa một món ra khỏi danh sách
export async function RemoveMealApi(devMode, payload) {
    if (devMode === "dev") {
        const list = MockDataMenuDay(plan_date)
        console.log("MOCK DATA MENU DAY: ", list)
        return list
    }

    return JsonApi(`/user/remove-meal`, {
        method: "POST",
        body: payload
    })
}

export function MenuJsonContainer () {
    // MENU THỰC ĐƠN TUẦN CỦA USER ĐỂ POST - GET
    /* 
    {
        week_start: '2026-02-16',
        week_menu: {
            Fri: {breakfast: [], dinner: [], lunch: []}
            ...
        }
    }
    */
    const menuDays = {
        breakfast: [],
        lunch: [],
        dinner: [],
        plan_date: "",
    };

    const menuWeek = {
        Mon: structuredClone(menuDays),
        Tue: structuredClone(menuDays),
        Wed: structuredClone(menuDays),
        Thu: structuredClone(menuDays),
        Fri: structuredClone(menuDays),
        Sat: structuredClone(menuDays),
        Sun: structuredClone(menuDays),
    };
    
    const menu = { 
      week_start: null,
      week_menu: menuWeek 
    };
    return menu
}