import JsonApi from "../../../services/JsonApi";
import { MockDataWorkoutProgramTemplate, MockWorkoutProgramTemplateDetail } from "../../../mockdata/Workout"

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