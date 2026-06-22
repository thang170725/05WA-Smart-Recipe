import JsonApi from '../../services/JsonApi';

export async function GetExercisesListApi(planDate) {
  return JsonApi('/workout/get-exercises-list', {
    method: 'GET',
    params: { plan_date: planDate },
  });
}

export async function GetWorkoutProgramTemplatesApi() {
  return JsonApi('/workout/get-workout-program-templates', { method: 'GET' });
}

export async function GetWorkoutProgramTemplatesDetailApi(program_id) {
  return JsonApi('/workout/get-workout-program-template-detail/', {
    method: 'GET',
    params: { program_id },
  });
}

export async function InsertWorkoutExercisesApi(planDate, weekStart, selectedExercises) {
  return JsonApi('/workout/insert-exercises-by-id', {
    method: 'POST',
    body: {
      plan_date: planDate,
      week_start: weekStart,
      selected_exercises: selectedExercises,
    },
  });
}

export async function PostWorkoutProgramTemplatesDetailToWeekApi(
  currentDate,
  weekStart,
  workoutProgramTemplateDetail
) {
  return JsonApi('/workout/post-workout-program-template-detail-to-week', {
    method: 'POST',
    body: {
      current_date: currentDate,
      week_start: weekStart,
      workout_program_template_detail: workoutProgramTemplateDetail,
    },
  });
}
