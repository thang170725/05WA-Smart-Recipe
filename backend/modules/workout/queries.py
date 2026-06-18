def get_loc_exercises_query():
    return """
select 
	wp.name as workout_program_name, wp.level, wp.duration_days,
	wpd.title, wpd.day_number,
	e.name as exercise_name, e.description, e.muscle_group, e.calories_per_minute, e.difficulty, e.image_url, e.video_url,
	wpdi.sets, wpdi.reps, wpdi.duration_minutes, wpdi.order_index
from workout_program_day_items wpdi 
join exercises e on e.id = wpdi.exercise_id
join workout_program_days wpd on wpd.id = wpdi.program_day_id  
join workout_programs wp on wp.id = wpd.program_id
where 1=1
	and wp.slug = :slug
ORDER BY wpd.day_number, wpdi.order_index;
"""