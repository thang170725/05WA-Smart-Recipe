// mockdata của thư viện bài tập mẫu
export function MockDataLibraryProgram () {
    return [
        { 
            name: "Jumping Jacks", 
            description: "Bài tập squat với tạ đòn giúp phát triển cơ đùi, mông và tăng khối lượng cơ toàn thân.",
            muscle_group: "legs",
            calories_per_minute: 8.5,
            difficulty: "medium",
            image_url: "images/barbell_squat.jpg",
            video_url: "https://www.youtube.com/watch?v=Dy28eq2PjcM",
            category_name: "gain_muscle",
            sets: 4,
            reps: 15,
            duration_minutes: 10,
            order_index: 1
        },
        { 
            name: "Jumping Jacks", 
            description: "Bài tập squat với tạ đòn giúp phát triển cơ đùi, mông và tăng khối lượng cơ toàn thân.",
            muscle_group: "legs",
            calories_per_minute: 8.5,
            difficulty: "medium",
            image_url: "images/barbell_squat.jpg",
            video_url: "https://www.youtube.com/watch?v=Dy28eq2PjcM",
            category_name: "gain_muscle",
            sets: 4,
            reps: 15,
            duration_minutes: 10,
            order_index: 2
        }
    ]
}

// mockdata để hiển thị vào quản lý lịch tập trong 1 tuần
export function MockDataWeekPrograms() {
  return [
    {
      week_start: "2026-03-02",
      week_menu: {
        Mon: [
          {
            name: "Push Up",
            difficulty: "medium",
            calories_per_minute: 10,
            sets: 4,
            reps: 15,
            duration_minutes: 10,
            order_index: 1
          }
        ],
        Tue: [
          {
            name: "Squat",
            difficulty: "medium",
            calories_per_minute: 8,
            sets: 4,
            reps: 12,
            duration_minutes: 10,
            order_index: 1
          }
        ],
        Wed: [
          {
            name: "Plank",
            difficulty: "easy",
            calories_per_minute: 5,
            sets: 3,
            reps: 1,
            duration_minutes: 5,
            order_index: 1
          }
        ],
        Thu: [],
        Fri: [],
        Sat: [],
        Sun: []
      }
    },

    {
      week_start: "2026-02-23",
      week_menu: {
        Mon: [
          {
            name: "Bench Press",
            difficulty: "hard",
            calories_per_minute: 12,
            sets: 5,
            reps: 10,
            duration_minutes: 12,
            order_index: 1
          }
        ],
        Tue: [
          {
            name: "Deadlift",
            difficulty: "hard",
            calories_per_minute: 14,
            sets: 5,
            reps: 8,
            duration_minutes: 12,
            order_index: 1
          }
        ],
        Wed: [
          {
            name: "Pull Up",
            difficulty: "medium",
            calories_per_minute: 9,
            sets: 4,
            reps: 10,
            duration_minutes: 8,
            order_index: 1
          }
        ],
        Thu: [],
        Fri: [],
        Sat: [],
        Sun: []
      }
    }
  ];
}

// mockdata chương trình tập luyện mẫu
export function MockDataWorkoutProgramTemplate () {
    return (
        [
            {
                id: 1,
                name: "30 ngày tăng cơ beginer"
            },
            {
                id: 2,
                name: "30 ngày tăng cơ junior",
            },
            {
                id: 3,
                name: "30 ngày tăng cơ senior",
            },
            {
                id: 4,
                name: "30 ngày cardio đốt mỡ beginner",
            },
            {
                id: 5,
                name: "30 ngày cardio đốt mỡ intermediate",
            },
        ]
    )
}

// mockdata chương trình mẫu chi tiết trong 30 ngày
export function MockWorkoutProgramTemplateDetail () {
  return [
    {
      id: 1,
      days: [
        {
          day: 1,
          exercises: [
            { name: "Barbell Squat", difficulty: "medium", calories_per_minute: 8.5, sets: 4, reps: 8, duration_minutes: 10, order_index: 1 },
            { name: "Leg Press", difficulty: "medium", calories_per_minute: 8.0, sets: 3, reps: 10, duration_minutes: null, order_index: 2 },
            { name: "Lunges", difficulty: "medium", calories_per_minute: 7.0, sets: 3, reps: 12, duration_minutes: null, order_index: 3 },
            { name: "Standing Calf Raise", difficulty: "easy", calories_per_minute: 6.5, sets: 4, reps: 15, duration_minutes: null, order_index: 4 }
          ]
        },

        {
day: 2,
exercises: [
{ name: "Bench Press", difficulty: "hard", calories_per_minute: 7.5, sets: 4, reps: 8, duration_minutes: null, order_index: 1 },
{ name: "Incline Bench Press", difficulty: "medium", calories_per_minute: 7.5, sets: 3, reps: 10, duration_minutes: null, order_index: 2 },
{ name: "Chest Fly", difficulty: "easy", calories_per_minute: 6.5, sets: 3, reps: 12, duration_minutes: null, order_index: 3 },
{ name: "Cable Tricep Pushdown", difficulty: "easy", calories_per_minute: 6.8, sets: 3, reps: 12, duration_minutes: null, order_index: 4 }
]
        },

        {
day: 4,
exercises: [
{ name: "Lat Pulldown", difficulty: "medium", calories_per_minute: 7.0, sets: 4, reps: 10, duration_minutes: null, order_index: 1 },
{ name: "Seated Row", difficulty: "medium", calories_per_minute: 7.2, sets: 3, reps: 10, duration_minutes: null, order_index: 2 },
{ name: "Bicep Curl", difficulty: "easy", calories_per_minute: 5.0, sets: 3, reps: 12, duration_minutes: null, order_index: 3 },
{ name: "Hammer Curl", difficulty: "easy", calories_per_minute: 6.5, sets: 3, reps: 12, duration_minutes: null, order_index: 4 }
]
        },

        {
day: 5,
exercises: [
{ name: "Shoulder Press", difficulty: "medium", calories_per_minute: 7.5, sets: 4, reps: 8, duration_minutes: null, order_index: 1 },
{ name: "Lateral Raise", difficulty: "easy", calories_per_minute: 6.2, sets: 3, reps: 12, duration_minutes: null, order_index: 2 },
{ name: "Plank", difficulty: "easy", calories_per_minute: 4.0, sets: 3, reps: 45, duration_minutes: null, order_index: 3 },
{ name: "Russian Twist", difficulty: "medium", calories_per_minute: 6.8, sets: 3, reps: 20, duration_minutes: null, order_index: 4 }
]
        },

        {
day: 7,
exercises: [
{ name: "Jump Rope", difficulty: "easy", calories_per_minute: 8.5, sets: null, reps: null, duration_minutes: 10, order_index: 1 },
{ name: "Mountain Climbers", difficulty: "medium", calories_per_minute: 8.5, sets: null, reps: null, duration_minutes: 5, order_index: 2 },
{ name: "Cat Cow Stretch", difficulty: "easy", calories_per_minute: 3.0, sets: null, reps: null, duration_minutes: 5, order_index: 3 }
]
        },

        {
day: 8,
exercises: [
{ name: "Front Squat", difficulty: "hard", calories_per_minute: 8.2, sets: 4, reps: 6, duration_minutes: null, order_index: 1 },
{ name: "Bulgarian Split Squat", difficulty: "hard", calories_per_minute: 8.0, sets: 3, reps: 8, duration_minutes: null, order_index: 2 },
{ name: "Leg Curl", difficulty: "easy", calories_per_minute: 7.0, sets: 3, reps: 12, duration_minutes: null, order_index: 3 }
]
        },

        {
day: 9,
exercises: [
{ name: "Dumbbell Bench Press", difficulty: "medium", calories_per_minute: 7.8, sets: 4, reps: 8, duration_minutes: null, order_index: 1 },
{ name: "Cable Crossover", difficulty: "medium", calories_per_minute: 6.8, sets: 3, reps: 12, duration_minutes: null, order_index: 2 },
{ name: "Tricep Dips", difficulty: "medium", calories_per_minute: 6.5, sets: 3, reps: 12, duration_minutes: null, order_index: 3 }
]
        },

        {
day: 11,
exercises: [
{ name: "Bent Over Row", difficulty: "hard", calories_per_minute: 8.2, sets: 4, reps: 8, order_index: 1 },
{ name: "T Bar Row", difficulty: "hard", calories_per_minute: 8.0, sets: 3, reps: 10, order_index: 2 },
{ name: "Preacher Curl", difficulty: "medium", calories_per_minute: 6.7, sets: 3, reps: 12, order_index: 3 }
]
        },

        {
day: 12,
exercises: [
{ name: "Arnold Press", difficulty: "medium", calories_per_minute: 7.5, sets: 4, reps: 8, order_index: 1 },
{ name: "Front Raise", difficulty: "easy", calories_per_minute: 6.0, sets: 3, reps: 12, order_index: 2 },
{ name: "Hanging Leg Raise", difficulty: "hard", calories_per_minute: 8.0, sets: 3, reps: 12, order_index: 3 }
]
        },

        {
day: 14,
exercises: [
{ name: "Jump Rope", difficulty: "easy", calories_per_minute: 8.5, duration_minutes: 10, order_index: 1 },
{ name: "High Knees", difficulty: "medium", calories_per_minute: 9.0, duration_minutes: 5, order_index: 2 },
{ name: "Burpees", difficulty: "hard", calories_per_minute: 9.0, duration_minutes: 5, order_index: 3 }
]
        },

        {
day: 15,
exercises: [
{ name: "Hack Squat", difficulty: "medium", calories_per_minute: 7.5, sets: 4, reps: 8, order_index: 1 },
{ name: "Step Up", difficulty: "medium", calories_per_minute: 7.2, sets: 3, reps: 10, order_index: 2 },
{ name: "Standing Calf Raise", difficulty: "easy", calories_per_minute: 6.5, sets: 4, reps: 15, order_index: 3 }
]
        },

        {
day: 16,
exercises: [
{ name: "Incline Bench Press", difficulty: "medium", calories_per_minute: 7.5, sets: 4, reps: 8, order_index: 1 },
{ name: "Dumbbell Fly", difficulty: "medium", calories_per_minute: 6.5, sets: 3, reps: 12, order_index: 2 },
{ name: "Rope Tricep Extension", difficulty: "easy", calories_per_minute: 6.5, sets: 3, reps: 12, order_index: 3 }
]
        },

        {
day: 18,
exercises: [
{ name: "Lat Pulldown", difficulty: "medium", calories_per_minute: 7.0, sets: 4, reps: 10, order_index: 1 },
{ name: "Single Arm Cable Row", difficulty: "medium", calories_per_minute: 7.0, sets: 3, reps: 10, order_index: 2 },
{ name: "Hammer Curl", difficulty: "easy", calories_per_minute: 6.5, sets: 3, reps: 12, order_index: 3 }
]
        },

        {
day: 19,
exercises: [
{ name: "Machine Shoulder Press", difficulty: "medium", calories_per_minute: 7.0, sets: 4, reps: 8, order_index: 1 },
{ name: "Face Pull", difficulty: "easy", calories_per_minute: 6.0, sets: 3, reps: 12, order_index: 2 },
{ name: "Side Plank", difficulty: "easy", calories_per_minute: 6.0, sets: 3, reps: 30, order_index: 3 }
]
        },

        {
day: 21,
exercises: [
{ name: "Jump Rope", difficulty: "easy", calories_per_minute: 8.5, duration_minutes: 10, order_index: 1 },
{ name: "Bear Crawls", difficulty: "medium", calories_per_minute: 8.0, duration_minutes: 5, order_index: 2 },
{ name: "Hip Flexor Stretch", difficulty: "easy", calories_per_minute: 3.0, duration_minutes: 5, order_index: 3 }
]
        },

        {
day: 22,
exercises: [
{ name: "Goblet Squat", difficulty: "easy", calories_per_minute: 7.2, sets: 4, reps: 10, order_index: 1 },
{ name: "Leg Extension", difficulty: "easy", calories_per_minute: 7.0, sets: 3, reps: 12, order_index: 2 },
{ name: "Leg Curl", difficulty: "easy", calories_per_minute: 7.0, sets: 3, reps: 12, order_index: 3 }
]
        },

        {
day: 23,
exercises: [
{ name: "Machine Chest Press", difficulty: "easy", calories_per_minute: 7.0, sets: 4, reps: 10, order_index: 1 },
{ name: "Cable Crossover", difficulty: "medium", calories_per_minute: 6.8, sets: 3, reps: 12, order_index: 2 },
{ name: "Overhead Tricep Extension", difficulty: "medium", calories_per_minute: 6.5, sets: 3, reps: 12, order_index: 3 }
]
        },

        {
day: 25,
exercises: [
{ name: "Seated Row", difficulty: "medium", calories_per_minute: 7.2, sets: 4, reps: 10, order_index: 1 },
{ name: "Reverse Pec Deck", difficulty: "easy", calories_per_minute: 6.5, sets: 3, reps: 12, order_index: 2 },
{ name: "Concentration Curl", difficulty: "easy", calories_per_minute: 6.2, sets: 3, reps: 12, order_index: 3 }
]
        },

        {
day: 26,
exercises: [
{ name: "Lateral Raise", difficulty: "easy", calories_per_minute: 6.2, sets: 3, reps: 12, order_index: 1 },
{ name: "Front Raise", difficulty: "easy", calories_per_minute: 6.0, sets: 3, reps: 12, order_index: 2 },
{ name: "Plank", difficulty: "easy", calories_per_minute: 4.0, sets: 3, reps: 45, order_index: 3 }
]
        },

        {
day: 28,
exercises: [
{ name: "Sprint Intervals", difficulty: "hard", calories_per_minute: 9.5, duration_minutes: 8, order_index: 1 },
{ name: "Jump Squat", difficulty: "hard", calories_per_minute: 8.5, duration_minutes: 5, order_index: 2 },
{ name: "Mountain Climbers", difficulty: "medium", calories_per_minute: 8.5, duration_minutes: 5, order_index: 3 }
]
        },

        {
day: 29,
exercises: [
{ name: "Push Up", difficulty: "easy", calories_per_minute: 6.0, sets: 4, reps: 12, order_index: 1 },
{ name: "Pull Up", difficulty: "medium", calories_per_minute: 7.0, sets: 3, reps: 8, order_index: 2 },
{ name: "Goblet Squat", difficulty: "easy", calories_per_minute: 7.2, sets: 3, reps: 12, order_index: 3 }
]
        },

        {
          day: 30,
          exercises: [
            { name: "Cat Cow Stretch", difficulty: "easy", calories_per_minute: 3.0, duration_minutes: 5, order_index: 1 },
            { name: "Child Pose Stretch", difficulty: "easy", calories_per_minute: 3.0, duration_minutes: 5, order_index: 2 },
            { name: "Hamstring Stretch", difficulty: "easy", calories_per_minute: 3.0, duration_minutes: 5, order_index: 3 }
          ]
        }
      ]
    }
  ]
}