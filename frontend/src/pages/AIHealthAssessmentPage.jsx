import { useState } from "react";
import { 
  Activity, 
  Brain, 
  Calendar, 
  ChevronRight, 
  Dumbbell, 
  Flame, 
  Info, 
  Ruler, 
  Scale, 
  Sparkles, 
  Target, 
  TrendingUp, 
  Utensils, 
  Zap 
} from "lucide-react";

export default function AIHealthAssessmentPage() {
  const [activeTab, setActiveTab] = useState("input"); // 'input' | 'result'
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // MOCK STATE: Dữ liệu đầu vào từ người dùng (Có sẵn thông tin cơ bản + cho phép nhập thêm)
  const [formData, setFormData] = useState({
    // Thông tin cơ bản có sẵn từ Profile
    age: 21,
    gender: "male",
    height: 175, // cm
    weight: 68,  // kg
    // Thông tin nâng cao yêu cầu bổ sung thêm cho AI
    bust: 92,    // Vòng 1 (cm)
    waist: 76,   // Vòng 2 (cm)
    hip: 94,     // Vòng 3 (cm)
    bodyType: "mesomorph", // ectomorph (Cơ địa gầy), mesomorph (Cơ địa cân đối/dễ tăng cơ), endomorph (Cơ địa dễ tích mỡ)
    activityLevel: "1.375", // Vận động nhẹ (1-3 buổi/tuần)
    goal: "build_muscle", // 'lose_fat' | 'build_muscle' | 'maintain'
    targetWeight: 73, // kg
  });

  // MOCK DATA: Kết quả AI Phân tích & Đánh giá
  const [assessmentResult, setAssessmentResult] = useState({
    metrics: {
      bmi: { value: 22.2, status: "Bình thường", color: "text-emerald-400" },
      bmr: { value: 1680, unit: "kcal/ngày" },
      tdee: { value: 2310, unit: "kcal/ngày" },
      bodyFatEst: { value: "15 - 17%", status: "Lý tưởng" },
      waistToHipRatio: { value: 0.81, status: "Tỷ lệ chuẩn (Thắt lưng thấp)" }
    },
    bodyTypeAnalysis: {
      title: "Tạng người Trung cơ (Mesomorph) - Tiềm năng phát triển cơ bắp tốt",
      description: "Hệ xương của bạn khá cân đối với khung vai rộng và vòng eo gọn. Tỷ lệ Vòng 2 / Vòng 3 là 0.81 nằm trong ngưỡng lý tưởng. Bạn có khả năng tổng hợp Protein và phục hồi cơ bắp tốt hơn trung bình."
    },
    nutritionStrategy: {
      dailyCalories: 2650, // Thặng dư 340 kcal để tăng cơ hạn chế tích mỡ
      protein: "140g - 160g / ngày",
      carbs: "300g - 330g / ngày",
      fats: "60g - 70g / ngày",
      advice: "Chia nhỏ 4 bữa/ngày. Tập trung nạp Carb phức hợp (khoai khoai, yến mạch) trước tập 90 phút và nạp Protein hấp thu nhanh sau tập."
    },
    workoutStrategy: {
      frequency: "4 - 5 buổi / tuần",
      focus: "Kháng lực Tăng tiến trọng lượng (Progressive Overload)",
      cardio: "LISS Cardio 20 phút cuối buổi tập (2 lần/tuần) để tối ưu lưu thông máu",
      advice: "Ưu tiên các bài tập Phức hợp (Compound) như Bench Press, Squat, Deadlift, Barbell Row trong khoảng 8-12 reps/set."
    },
    // MỐC THỜI GIAN LỘ TRÌNH CHI TIẾT (Milestones)
    timeline: [
      {
        phase: "Cột mốc 1 (Tuần 1 - Tuần 2)",
        targetWeight: "69.0 kg (+1.0 kg)",
        description: "Giai đoạn thích nghi thặng dư calo nhẹ và tích trữ Glycogen trong cơ bắp.",
        status: "Tăng nước & Glycogen"
      },
      {
        phase: "Cột mốc 2 (Tuần 3 - Tuần 6)",
        targetWeight: "70.5 kg (+2.5 kg)",
        description: "Bắt đầu xuất hiện sự tổng hợp sợi cơ mới. Sức mạnh trong các bài tập chính tăng 5-10%.",
        status: "Tăng cơ nét"
      },
      {
        phase: "Cột mốc 3 (Tuần 7 - Tuần 10)",
        targetWeight: "71.8 kg (+3.8 kg)",
        description: "Cơ bắp dày dặn rõ rệt ở vùng vai và ngực. Cần điều chỉnh tăng thêm 100 kcal nếu tốc độ tăng cân bị khựng.",
        status: "Tối ưu khối lượng cơ"
      },
      {
        phase: "Cột mốc 4 (Tuần 11 - Tuần 14)",
        targetWeight: "73.0 kg (+5.0 kg - ĐẠT MỤC TIÊU)",
        description: "Chạm mốc 73kg với tỷ lệ Mỡ bodyfat duy trì ở mức an toàn (~17%). Sẵn sàng cho giai đoạn Siết cơ (Cut) hoặc Duy trì.",
        status: "Hoàn tất mục tiêu"
      }
    ]
  });

  // Giả lập AI Đánh giá
  const handleStartAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setActiveTab("result");
    }, 2000);
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 text-slate-200">
      {/* HEADER TRANG */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/80 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white">AI Phân Tích Sức Khỏe & Thể Tạng</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Cung cấp các chỉ số sinh học để AI tính toán BMR/TDEE và dự phóng mốc thời gian đạt mục tiêu.
          </p>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex bg-slate-800/80 p-1 rounded-xl border border-white/10 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("input")}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "input" ? "bg-amber-500 text-slate-950 font-bold shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            1. Chỉ số đầu vào
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("result")}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "result" ? "bg-amber-500 text-slate-950 font-bold shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            2. Kết quả AI Đánh giá
          </button>
        </div>
      </div>

      {/* TAB 1: FORM NHẬP CHỈ SỐ NÂNG CAO */}
      {activeTab === "input" && (
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-white/10 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Ruler className="w-5 h-5 text-amber-400" />
              Thông tin sinh học & Số đo cơ thể
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Thông tin càng chi tiết, thuật toán AI dự phóng lộ trình càng chính xác.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Thông tin cố định / Đã có */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Chiều cao (cm)</label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Cân nặng hiện tại (kg)</label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-amber-400 flex items-center gap-1">
                <Target className="w-3.5 h-3.5" /> Cân nặng mục tiêu (kg)
              </label>
              <input
                type="number"
                value={formData.targetWeight}
                onChange={(e) => setFormData({ ...formData, targetWeight: Number(e.target.value) })}
                className="w-full bg-slate-800/80 border border-amber-500/40 rounded-xl px-3.5 py-2.5 text-sm text-amber-300 font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Số đo 3 vòng bổ sung */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Vòng 1 - Ngực (cm)</label>
              <input
                type="number"
                value={formData.bust}
                onChange={(e) => setFormData({ ...formData, bust: Number(e.target.value) })}
                className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                placeholder="VD: 90"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Vòng 2 - Eo (cm)</label>
              <input
                type="number"
                value={formData.waist}
                onChange={(e) => setFormData({ ...formData, waist: Number(e.target.value) })}
                className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                placeholder="VD: 75"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Vòng 3 - Mông (cm)</label>
              <input
                type="number"
                value={formData.hip}
                onChange={(e) => setFormData({ ...formData, hip: Number(e.target.value) })}
                className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                placeholder="VD: 92"
              />
            </div>

            {/* Tạng người & Vận động */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Tạng người dự đoán</label>
              <select
                value={formData.bodyType}
                onChange={(e) => setFormData({ ...formData, bodyType: e.target.value })}
                className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="ectomorph">Ectomorph (Gầy, khó tăng cân/cơ)</option>
                <option value="mesomorph">Mesomorph (Cân đối, dễ tăng cơ)</option>
                <option value="endomorph">Endomorph (Tròn trịa, dễ tích mỡ)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Cường độ vận động tuần</label>
              <select
                value={formData.activityLevel}
                onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="1.2">Ít vận động (Ngồi văn phòng)</option>
                <option value="1.375">Vận động nhẹ (Tập 1-3 buổi/tuần)</option>
                <option value="1.55">Vận động vừa (Tập 3-5 buổi/tuần)</option>
                <option value="1.725">Vận động cao (Tập 6-7 buổi/tuần)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Mục tiêu tập luyện chính</label>
              <select
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="build_muscle">Tăng cơ - Hạn chế tăng mỡ (Clean Bulk)</option>
                <option value="lose_fat">Giảm mỡ - Giữ cơ (Fat Loss)</option>
                <option value="maintain">Duy trì thể trạng & Sức khỏe chung</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            disabled={isAnalyzing}
            onClick={handleStartAnalysis}
            className="w-full py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:brightness-110 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                AI đang tính toán BMR, TDEE & Tạo lộ trình...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" /> Tiến hành AI Đánh giá Sức khỏe
              </>
            )}
          </button>
        </div>
      )}

      {/* TAB 2: BẢNG KẾT QUẢ ĐÁNH GIÁ CỦA AI */}
      {activeTab === "result" && (
        <div className="space-y-6">
          {/* 1. BẢNG BIỂU CHỈ SỐ TỔNG QUAN (Metrics Grid) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/10 space-y-1">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-amber-400" /> Chỉ số BMI
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{assessmentResult.metrics.bmi.value}</span>
                <span className={`text-xs font-semibold ${assessmentResult.metrics.bmi.color}`}>
                  {assessmentResult.metrics.bmi.status}
                </span>
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/10 space-y-1">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> BMR (Năng lượng nghỉ)
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">{assessmentResult.metrics.bmr.value}</span>
                <span className="text-xs text-slate-400">{assessmentResult.metrics.bmr.unit}</span>
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-1">
              <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> TDEE (Tiêu hao hàng ngày)
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-amber-300">{assessmentResult.metrics.tdee.value}</span>
                <span className="text-xs text-amber-400/80">{assessmentResult.metrics.tdee.unit}</span>
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/10 space-y-1">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-amber-400" /> Tỷ lệ mỡ ước tính
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{assessmentResult.metrics.bodyFatEst.value}</span>
                <span className="text-xs text-emerald-400 font-semibold">{assessmentResult.metrics.bodyFatEst.status}</span>
              </div>
            </div>
          </div>

          {/* 2. ĐÁNH GIÁ TẠNG NGƯỜI VÀ CƠ THỂ */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-white/10 space-y-2">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Phân tích Tạng người & Tỷ lệ cơ thể
            </h3>
            <h4 className="text-base font-bold text-white">{assessmentResult.bodyTypeAnalysis.title}</h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {assessmentResult.bodyTypeAnalysis.description}
            </p>
          </div>

          {/* 3. MỐC THỜI GIAN LỘ TRÌNH (TIMELINE MILESTONES) */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-white/10 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                Mốc thời gian dự phóng (Dự kiến đạt 73kg trong 14 tuần)
              </h3>
              <span className="text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                +0.35 kg / tuần
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {assessmentResult.timeline.map((item, idx) => (
                <div key={idx} className="bg-slate-800/50 p-4 rounded-xl border border-white/5 space-y-2 relative overflow-hidden">
                  <div className="text-xs font-bold text-amber-400">{item.phase}</div>
                  <div className="text-lg font-extrabold text-white">{item.targetWeight}</div>
                  <p className="text-xs text-slate-400 leading-normal">{item.description}</p>
                  <span className="inline-block text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. KHUYÊN DINH DƯỠNG & TẬP LUYỆN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dinh dưỡng */}
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-white/10 space-y-3">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <Utensils className="w-4 h-4" /> Định hướng Dinh dưỡng hàng ngày
              </h3>
              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-center">
                <span className="text-xs text-slate-400">Target Calo mỗi ngày: </span>
                <span className="text-xl font-bold text-amber-300">{assessmentResult.nutritionStrategy.dailyCalories} kcal</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li><strong className="text-white">Protein:</strong> {assessmentResult.nutritionStrategy.protein}</li>
                <li><strong className="text-white">Carbs:</strong> {assessmentResult.nutritionStrategy.carbs}</li>
                <li><strong className="text-white">Fats:</strong> {assessmentResult.nutritionStrategy.fats}</li>
              </ul>
              <p className="text-xs text-slate-400 italic bg-slate-800/40 p-2.5 rounded-lg border border-white/5">
                "{assessmentResult.nutritionStrategy.advice}"
              </p>
            </div>

            {/* Tập luyện */}
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-white/10 space-y-3">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <Dumbbell className="w-4 h-4" /> Định hướng Luyện tập
              </h3>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-white/5 space-y-1">
                <div className="text-xs text-slate-400">Tần suất: <strong className="text-white">{assessmentResult.workoutStrategy.frequency}</strong></div>
                <div className="text-xs text-slate-400">Trọng tâm: <strong className="text-white">{assessmentResult.workoutStrategy.focus}</strong></div>
              </div>
              <p className="text-xs text-slate-400 italic bg-slate-800/40 p-2.5 rounded-lg border border-white/5">
                "{assessmentResult.workoutStrategy.advice}"
              </p>
            </div>
          </div>

          {/* CTA Chuyển sang cắm AI Roadmap sau này */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" /> Sẵn sàng biến đánh giá này thành Kế hoạch hành động?
              </h4>
              <p className="text-xs text-slate-400">
                Tự động tạo Roadmap thực đơn và lịch tập chi tiết từng ngày dựa trên kết quả phân tích trên.
              </p>
            </div>
            <button
              type="button"
              className="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all flex items-center gap-1.5 whitespace-nowrap shadow-md shadow-amber-500/10"
            >
              <span>Tạo AI Roadmap ngay</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}