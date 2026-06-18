
def get_meals_to_day():
    return """
SELECT 
    m.name,
    m.calories
FROM meal_plans mp
JOIN meal_plan_items mpi ON mp.id = mpi.meal_plan_id
JOIN meals m ON mpi.meal_id = m.id
WHERE mp.user_id = :user_id
AND mp.plan_date = :plan_date
"""

def get_meals_library_query():
    return """
    select 
        m.name as name,
        m.image_url,
        m.calories,
        m.description,
        m.ingredients_json,
        m.instructions_json,
        m.cooking_time,
        m.difficulty,
        c.name as category_name,
        c.type as category_type
    from meals m
    join categories c on c.id = m.category_id;
    """
