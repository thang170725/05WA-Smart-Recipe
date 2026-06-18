export function MockDataMenuDay() {
    return [
        {
            id: 1,
            name: "Trứng luộc",
            meal_type: "breakfast",
            image:
                "https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?w=400",
            description:
                "Trứng gà luộc chín, giàu protein và vitamin.",
            calories: 155,
            calories_unit: "100g",
            ingredients: [
                "2 quả trứng gà",
                "Nước"
            ],
            recipe:
                "Luộc trứng trong nước sôi khoảng 8–10 phút."
        },

        {
            id: 2,
            name: "Yến mạch sữa",
            meal_type: "breakfast",
            image:
                "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400",
            description:
                "Yến mạch nấu cùng sữa tươi ít béo.",
            calories: 68,
            calories_unit: "100ml",
            ingredients: [
                "50g yến mạch",
                "200ml sữa"
            ],
            recipe:
                "Nấu yến mạch với sữa khoảng 5 phút."
        },

        {
            id: 3,
            name: "Gà hầm rau củ",
            meal_type: "lunch",
            image:
                "https://images.unsplash.com/photo-1604908176997-431221e2b47b?w=400",
            description:
                "Ức gà hầm cùng khoai tây và cà rốt.",
            calories: 165,
            calories_unit: "100g",
            ingredients: [
                "Ức gà",
                "Khoai tây",
                "Cà rốt"
            ],
            recipe:
                "Hầm nhỏ lửa khoảng 40 phút."
        },

        {
            id: 4,
            name: "Cơm chiên hải sản",
            meal_type: "dinner",
            image:
                "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400",
            description:
                "Cơm chiên cùng tôm, mực và rau củ.",
            calories: 182,
            calories_unit: "100g",
            ingredients: [
                "Cơm",
                "Tôm",
                "Mực",
                "Rau củ"
            ],
            recipe:
                "Xào hải sản rồi cho cơm vào đảo đều."
        }
    ];
}

// mockData id and name of food library
export function MockDataIdAndNameFoodLibrary () {
    return [
        {
            id: 1,
            name: "cơm rang rưa bò"
        },
        {
            id: 2,
            name: "cơm gà"
        },
        {
            id: 3,
            name: "cơm chiên trứng trộn"
        },
        {
            id: 4,
            name: "gà rán"
        }
    ]
}