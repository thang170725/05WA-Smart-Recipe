use SmartRecipe;

select * from users;
select * from meals;
select * from meal_plan_items mpi;
select * from meal_plans mp;
select * from user_meals um;
select * from food_library fl;
select * from food_library_category flc;
select * from categories c;

select * from workout_plans;
select * from workout_plan_items;

select * from ai_tool_registry atr;

select * from 

SELECT COALESCE(
  SUM(fl.calories_per_100 * m.quantity * 0.1),
  0
) AS total_calories from food_library fl 
join meals m on m.food_id = fl.id 
where m.created_at >= :week_start and m.created_at < DATE_ADD(:week_start, INTERVAL 7 DAY) and m.user_id = :user_id;

-- 4. MUSCLE DISTRIBUTION: xem user tập nhóm cơ nào nhiều nhất
SELECT
    e.muscle_group AS name,
    COUNT(*) AS value
FROM workout_plan_items wpi
JOIN workout_plans wp 
    ON wp.id = wpi.workout_plan_id
JOIN exercises e
    ON e.id = wpi.exercise_id
WHERE wp.user_id = :user_id
GROUP BY e.muscle_group
ORDER BY value DESC;

-- 5. CALORIES WEEKLY: tính calo đốt khi tập luyện
SELECT
    YEARWEEK(wp.plan_date,1) AS week,
    ROUND(SUM(e.calories_per_minute * IFNULL(wpi.duration_minutes,10)),0) AS calories
FROM workout_plan_items wpi
JOIN workout_plans wp
    ON wp.id = wpi.workout_plan_id
JOIN exercises e
    ON e.id = wpi.exercise_id
WHERE wp.user_id = :user_id
GROUP BY week
ORDER BY week DESC
LIMIT 8;

-- 6. WORKOUT WEEKLY: đếm số buổi tập mỗi tuần
SELECT
    YEARWEEK(plan_date,1) AS week,
    COUNT(*) AS sessions
FROM workout_plans
WHERE user_id = :user_id
GROUP BY week
ORDER BY week DESC
LIMIT 8;

-- tính calo ăn vào mỗi tuần
SELECT
    YEARWEEK(mp.plan_date, 1) AS week,
    SUM(m.calories) AS calories
FROM meal_plan_items mpi
JOIN meal_plans mp 
    ON mp.id = mpi.meal_plan_id
JOIN meals m 
    ON m.id = mpi.meal_id
WHERE mp.user_id = :user_id
GROUP BY week
ORDER BY week DESC
LIMIT 8;

-- để user biết tăng cân hay giảm cân
SELECT
    t.week,
    t.calories_intake,
    t.calories_burn,
    (t.calories_intake - t.calories_burn) AS net_calories
FROM
(
    SELECT
        YEARWEEK(mp.plan_date,1) AS week,
        SUM(m.calories) AS calories_intake,
        SUM(
            e.calories_per_minute * IFNULL(wpi.duration_minutes,10)
        ) AS calories_burn
    FROM meal_plans mp
    LEFT JOIN meal_plan_items mpi 
        ON mpi.meal_plan_id = mp.id
    LEFT JOIN meals m 
        ON m.id = mpi.meal_id

    LEFT JOIN workout_plans wp
        ON wp.user_id = mp.user_id
        AND wp.plan_date = mp.plan_date

    LEFT JOIN workout_plan_items wpi
        ON wpi.workout_plan_id = wp.id

    LEFT JOIN exercises e
        ON e.id = wpi.exercise_id

    WHERE mp.user_id = :user_id

    GROUP BY week
) t
ORDER BY week DESC
LIMIT 8;

CREATE TABLE weight_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    weight FLOAT NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);
Query Weight Progress
SELECT
    DATE(recorded_at) AS date,
    ROUND(AVG(weight),1) AS weight
FROM weight_history
WHERE user_id = :user_id
GROUP BY DATE(recorded_at)
ORDER BY date;


-- tạo bảng --
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email varchar(50) not null,
    password VARCHAR(500) NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    fullname VARCHAR(50),
    address VARCHAR(100),
    phone VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    google_id VARCHAR(255) UNIQUE,
    birth_date date,
	gender enum('male', 'female', 'other') not null default 'other',
	activity_level enum('sedentary', 'light', 'moderate', 'active', 'very_active'), 
	target_goal enum('lose_weight', 'gain_muscle', 'maintenance'),
	avatar_url varchar(255)
) ENGINE=InnoDB;

CREATE TABLE otp (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255),
    otp VARCHAR(20),
    expires_at DATETIME,
    is_used BOOLEAN DEFAULT FALSE,
    
    INDEX idx_email (email)
) engine=InnoDB;

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    type enum('food', 'drick', 'forum', 'exercise') not null,
    slug varchar(120),
    created_at timestamp default current_timestamp
) ENGINE=InnoDB;

CREATE TABLE food_library (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    image_url VARCHAR(255),
    calories_per_100 decimal(6,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    description text,
    ingredients_json json,
    instructions_json json,
    cooking_time int,
    difficulty enum('easy', 'medium', 'hard')
) ENGINE=InnoDB;

CREATE TABLE food_library_category (
    food_id INT,
    category_id INT,
    
    PRIMARY KEY (food_id, category_id),

    FOREIGN KEY (food_id)
        REFERENCES food_library(id)
        ON DELETE CASCADE,

    FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE CASCADE
);

CREATE TABLE user_meals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    
    name VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    calories_per_100 DECIMAL(6,2),

    -- index cực quan trọng
    INDEX idx_user (user_id),

    -- optional: chống trùng trong cùng user
    UNIQUE KEY unique_user_meal (user_id, name),
    
    CONSTRAINT fk_user_meals_users FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE meals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    food_id INT null,
    user_meal_id INT NULL,
    quantity FLOAT, -- gram hoặc ml
    unit VARCHAR(10),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (food_id) REFERENCES food_library(id),
    CONSTRAINT fk_meals_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_meals_user_meal FOREIGN KEY (user_meal_id) REFERENCES user_meals(id)
);

CREATE TABLE meal_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    plan_date DATE NOT NULL,
    week_start DATE NOT NULL COMMENT 'Monday of the week',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uniq_user_plan_date (user_id, plan_date),
    INDEX idx_user_week (user_id, week_start),

    CONSTRAINT fk_meal_plans_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE meal_plan_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meal_plan_id INT NOT NULL,
    meal_id INT NOT NULL,
    meal_type ENUM('breakfast','lunch','dinner','snack') NOT NULL,
    
    INDEX idx_meal_plan_id (meal_plan_id),
	INDEX idx_plan_type (meal_plan_id, meal_type),
	UNIQUE KEY uniq_plan_meal_type (meal_plan_id, meal_id, meal_type),

    FOREIGN KEY (meal_plan_id)
        REFERENCES meal_plans(id)
        ON DELETE CASCADE,

    FOREIGN KEY (meal_id)
        REFERENCES meals(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE platform (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(255),
    content TEXT,
    category_id INT,
    number_comment INT DEFAULT 0,
    rating_count INT DEFAULT 0,
    rating_avg FLOAT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_platform_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_platform_category
        FOREIGN KEY (category_id) REFERENCES categories(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    platform_id INT,
    user_id INT,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_comments_platform
        FOREIGN KEY (platform_id) REFERENCES platform(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_comments_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    platform_id INT,
    user_id INT,
    rating TINYINT CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	
    UNIQUE KEY unique_user_platform (platform_id, user_id),
    
    CONSTRAINT fk_ratings_platform
        FOREIGN KEY (platform_id) REFERENCES platform(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_ratings_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE health_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    weight FLOAT NOT NULL,
    height FLOAT NOT NULL,
    bmi FLOAT,
    bmr FLOAT,
    tdee FLOAT,
    health_status VARCHAR(50),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_id
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
) engine=InnoDB;

CREATE TABLE health_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    health_metric_id int not null,
    month enum('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec') not null,
    bmi_avarage float null,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_health_metric
        FOREIGN KEY (health_metric_id) REFERENCES health_metrics(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    muscle_group VARCHAR(50),
    calories_per_minute FLOAT,
    difficulty ENUM('easy', 'medium', 'hard') NOT NULL,
    image_url VARCHAR(255),
    video_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    category_id int,
    
    constraint fk_exercises_category_id foreign key (category_id) references categories(id)
    on delete cascade
) engine=InnoDB;

CREATE TABLE workout_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    plan_date DATE NOT NULL,
    note VARCHAR(255),
    status ENUM('pending', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    week_start date not null,

    UNIQUE KEY unique_user_plan (user_id, plan_date),
    INDEX idx_user_id (user_id),
    
    CONSTRAINT fk_workout_plans_user_id
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE workout_plan_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    workout_plan_id INT NOT NULL,
    exercise_id INT NOT NULL,
    sets INT DEFAULT 3,
    reps INT DEFAULT 12,
    duration_minutes INT,
    order_index INT,

    CONSTRAINT fk_workout_plan
        FOREIGN KEY (workout_plan_id)
        REFERENCES workout_plans(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_exercise
        FOREIGN KEY (exercise_id)
        REFERENCES exercises(id)
        ON DELETE CASCADE,

    INDEX idx_plan_id (workout_plan_id),
    INDEX idx_exercise_id (exercise_id)
) engine=InnoDB;

CREATE TABLE workout_programs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    category_id INT,
    duration_days INT DEFAULT 30,
    level ENUM('beginner','intermediate','advanced'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    slug varchar(50),

    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE workout_program_days (
    id INT AUTO_INCREMENT PRIMARY KEY,
    program_id INT NOT NULL,
    day_number INT NOT NULL,
    title VARCHAR(100),
    description JSON null,
    
    FOREIGN KEY (program_id)
        REFERENCES workout_programs(id)
        ON DELETE CASCADE
);

CREATE TABLE workout_program_day_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    program_day_id INT NOT NULL,
    exercise_id INT NOT NULL,
    sets INT,
    reps INT,
    duration_minutes INT,
    order_index INT,

    FOREIGN KEY (program_day_id)
        REFERENCES workout_program_days(id)
        ON DELETE CASCADE,

    FOREIGN KEY (exercise_id)
        REFERENCES exercises(id)
        ON DELETE CASCADE
);

CREATE TABLE user_active_programs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    program_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('active','completed','cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, status),
    
	FOREIGN KEY (user_id) REFERENCES users(id)
	ON DELETE CASCADE,
	FOREIGN KEY (program_id) REFERENCES workout_programs(id) on delete cascade
);

create table ai_tool_registry (
	id int auto_increment primary key,
	description text not null,
	embedding json not null,
	name varchar(100) not null
) engine=InnoDB;

