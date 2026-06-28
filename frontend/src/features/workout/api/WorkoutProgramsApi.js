import JsonApi from "../../../services/JsonApi";
import { MockDataWorkoutProgramTemplate, MockWorkoutProgramTemplateDetail } from "../../../mockdata/Workout"
import { MockDataWeekPrograms } from "../../../mockdata/Workout"

// =========================
// ======= API GET =========
// =========================
// lấy lịch tập trong 1 ngày bằng planDate
export async function GetExercisesListApi(devMode, planDate) {
    const response = await JsonApi("/workout/get-exercises-list", { 
        method: "GET",
        params: {
            plan_date: planDate
        }
    })

    return response
}

export async function GetWorkoutProgramTemplatesApi(devMode) {
    if (devMode === "dev") {
        const workoutPrograms = MockDataWorkoutProgramTemplate()
        return workoutPrograms
    }

    return await JsonApi(
        "/workout/get-workout-program-templates", {
        method: "GET", 
    });
}

export async function GetWorkoutProgramTemplatesDetailApi (devMode, program_id) {
    if (devMode === "dev") {
        const workoutTemplateDetailList = MockWorkoutProgramTemplateDetail()

        const workoutTemplateDetail = workoutTemplateDetailList.find(
            w => w.id === program_id
        )

        return workoutTemplateDetail || null
    }
    
    return await JsonApi(
        `/workout/get-workout-program-template-detail/?program_id=${program_id}`, {
        method: "GET", 
    });
}

// ===================================
// ======= API POST / INSERT =========
// ===================================
// thêm các bài tập vào schedule của user
export async function InsertWorkoutExercisesApi (devMode, planDate, weekStart, selectedExercises){
    console.log("InsertWorkoutExercisesApi: ", {
        plan_date: planDate,
        week_start: weekStart,
        selected_exercises: selectedExercises,
    })

    return await JsonApi("/workout/insert-exercises",
        {
            method: "POST",
            body: {
                plan_date: planDate,
                week_start: weekStart,
                selected_exercises: selectedExercises,
            }
        }
    )
}

// ghi chương trình luyện tập mẫu vào kế hoạch tập luyện của người dùng
export async function PostWorkoutProgramTemplatesDetailToWeekApi (devMode, currentDate, weekStart, workoutProgramTemplateDetail) {    
    return await JsonApi(
        `/workout/post-workout-program-template-detail-to-week`, {
        method: "POST", 
        body: {
            current_date: currentDate,
            week_start: weekStart,
            workout_program_template_detail: workoutProgramTemplateDetail
        }
    });
}

export async function UpdateActiveDurationSecondsApi (payload) {
    console.log("UpdateActiveDurationSecondsApi: ", payload)
    return await JsonApi("/workout/update-active-duration-seconds", {
        method: 'POST',
        body: payload
    })
}

export async function UpdateWorkoutSetCompletedApi (payload) {
    console.log("UpdateWorkoutSetCompletedApi: ", payload)

    return await JsonApi("workout/update-workout-set-completed", {
        method: "POST",
        body: payload
    })
}