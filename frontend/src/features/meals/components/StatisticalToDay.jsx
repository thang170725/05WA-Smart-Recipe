import { Flame, Target } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export function StatisticalToDay ({ payload }) {
    if (!payload) return <div>Đang phân tích ...</div>
    const caloriesData = [
    { day: "T2", calories: 2100, target: 2000 },
    { day: "T3", calories: 1950, target: 2000 },
    { day: "T4", calories: 2200, target: 2000 },
    { day: "T5", calories: 1800, target: 2000 },
    { day: "T6", calories: 2050, target: 2000 },
    { day: "T7", calories: 1900, target: 2000 },
    { day: "CN", calories: 1850, target: 2000 },
  ];

    // Dữ liệu cho biểu đồ dinh dưỡng hôm nay
    const macroData = [
        { name: "Chất đạm", value: payload.components.protein, color: "#2563eb" },
        { name: "Chất xơ", value: payload.components.fiber, color: "#8b5cf6" },
        { name: "Chất béo", value: payload.components.fat, color: "#f97316" },
        { name: "Tinh bột", value: payload.components.carb, color: "#10b981" },
        { name: "Vitamin & Khoáng chất khác", value: payload.components.other, color: "#64748b" }
    ];

  // Dữ liệu cho biểu đồ bữa ăn
  const mealData = [
    { meal: "Sáng", calories: 450 },
    { meal: "Phụ 1", calories: 200 },
    { meal: "Trưa", calories: 650 },
    { meal: "Phụ 2", calories: 150 },
    { meal: "Tối", calories: 400 },
  ];
    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold">Thống Kê Chi tiết</h1>
                <p className="text-gray-300 text-sm">Tổng quan dinh dưỡng & phân tích chi tiết bằng AI</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-2xl shadow-sm p-4">
                    <div className="flex items-center justify-between pb-4">
                        <div>
                            <p className="text-sm text-gray-300">Lượng Calories hôm nay</p>
                            <h2 className="text-2xl font-bold">{payload.calories}</h2>
                        </div>

                        <Flame className="w-8 h-8 text-orange-500" />
                    </div>
                </div>
        
                {/* Biểu đồ phân bố dinh dưỡng */}
                <div className="bg-black/50 rounded-2xl shadow-sm p-6 col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold">🥗 Dinh dưỡng hôm nay</h3>
                            <p className="text-sm text-gray-300">Phân bố macro</p>
                        </div>

                        <Target className="w-5 h-5 text-blue-500" />
                    </div>

                    <div className="flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                data={macroData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value}g`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                >
                                    {macroData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>

                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#fff', 
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontSize: '12px'
                                  }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-4">
                        <div className="text-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-1"></div>
                            <p className="text-xs text-slate-500">Chất đạm</p>
                            <p className="font-semibold text-sm">{payload.components.protein}</p>
                        </div>

                        <div className="text-center">
                          <div className="w-3 h-3 bg-purple-600 rounded-full mx-auto mb-1"></div>
                          <p className="text-xs text-slate-500">Chất xơ</p>
                          <p className="font-semibold text-sm">{payload.components.fiber}</p>
                        </div>

                        <div className="text-center">
                          <div className="w-3 h-3 bg-orange-500 rounded-full mx-auto mb-1"></div>
                          <p className="text-xs text-slate-500">Chất béo</p>
                          <p className="font-semibold text-sm">{payload.components.fat}</p>
                        </div>

                        <div className="text-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1"></div>
                          <p className="text-xs text-slate-500">Tinh bột</p>
                          <p className="font-semibold text-sm">{payload.components.carbs}</p>
                        </div>

                        <div className="text-center">
                          <div className="w-3 h-3 bg-gray-500 rounded-full mx-auto mb-1"></div>
                          <p className="text-xs text-slate-500">Vitamin & Khoáng chất khác</p>
                          <p className="font-semibold text-sm">{payload.components.other}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">🍱 Gợi ý bữa ăn thông minh</h3>

                <div className="grid grid-cols-3 gap-3 bg-white rounded-2xl shadow-sm p-6">       
                    <div className="p-4 bg-slate-100 rounded-xl">
                        <p className="font-medium">Bữa sáng: {payload.comment.breakfast}</p>
                    </div>

                    <div className="p-4 bg-slate-100 rounded-xl">
                        <p className="font-medium">Bữa trưa: {payload.comment.lunch}</p>
                    </div>
                            
                    <div className="p-4 bg-slate-100 rounded-xl">
                        <p className="font-medium">Bữa tối: {payload.comment.dinner}</p>
                    </div>

                    <div className="col-span-3">
                        <h5 className="p-2">Tổng kết của AI</h5>
                        <p className="p-4 bg-slate-100 rounded-xl">{payload.summarize}</p>
                    </div>
                </div>

                
            </div>
        </div>                            
    )
}