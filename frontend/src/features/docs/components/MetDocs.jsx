import { Zap, Activity, Dumbbell, Flame, Timer, Info } from "lucide-react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

export function METDocs() {
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
  };

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.15 } }
  };

  return (
    <section className="w-full">
      <div className="w-[90%] max-w-6xl mx-auto space-y-10">

        {/* HEADER */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-center space-y-4">
          <h2 className="section-heading">
            <Zap className="w-6 h-6 text-amber-400 inline-block mr-2 -mt-1" />
            Chỉ Số MET & Tính Calo Out
          </h2>
          <p className="section-desc max-w-2xl mx-auto">
            MET (Metabolic Equivalent of Task) là thước đo chuẩn y khoa dùng để đo lường mức độ tiêu hao năng lượng của các hoạt động thể chất dựa trên trọng lượng cơ thể.
          </p>
        </motion.div>

        {/* CARDS INFO */}
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <Activity className="w-6 h-6 text-amber-400" />,
              title: "1 MET Là Gi?",
              desc: "1 MET = Mức tiêu hao năng lượng khi bạn nghỉ ngơi hoàn toàn (ngồi yên, ngủ). Tương đương xấp xỉ 1 kcal / kg / giờ."
            },
            {
              icon: <Flame className="w-6 h-6 text-orange-500" />,
              title: "Công Thức Tính Calo tiêu hao",
              desc: "Calo tiêu hao = (MET × 3.5 × Cân nặng(kg) ÷ 200) × Thời gian(phút). Giúp đo chính xác lượng calo tiêu tốn cho từng bài tập."
            },
            {
              icon: <Dumbbell className="w-6 h-6 text-emerald-400" />,
              title: "Cường Độ Vận Động",
              desc: "Nhẹ (< 3 METs: Đi dạo), Trung bình (3 - 6 METs: Đi bộ nhanh, đạp xe nhẹ), Mạnh (> 6 METs: Chạy bộ, tập HIIT)."
            }
          ].map((card, index) => (
            <motion.div key={index} variants={fadeUp} className="glass-card p-8 hover:border-brand/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-5 border border-white/10">
                {card.icon}
              </div>
              <h3 className="font-display font-semibold text-lg text-white mb-2">{card.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CHARTS & TABLES IN GLASS PANEL */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-2 gap-8">
          
          {/* CHART MET CÁC HOẠT ĐỘNG */}
          <div className="glass-panel p-8">
            <h4 className="font-display text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Timer className="w-5 h-5 text-brand-light" />
              So Sánh Chỉ Số MET Các Hoạt Động Phổ Biến
            </h4>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: "Đi dạo", met: 2.5, fill: "#94a3b8" },
                  { name: "YoGa", met: 3.3, fill: "#38bdf8" },
                  { name: "Kháng lực", met: 5.0, fill: "#f59e0b" },
                  { name: "Đạp xe", met: 6.8, fill: "#10b981" },
                  { name: "Chạy bộ", met: 9.8, fill: "#ef4444" }
                ]}>
                  <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    formatter={(value) => [`${value} METs`, 'Cường độ']}
                  />
                  <Bar dataKey="met" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* BẢNG BÀI TẬP VÀ VÍ DỤ TÍNH */}
          <div className="glass-panel p-8 flex flex-col justify-between">
            <div>
              <h4 className="font-display text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Info className="w-5 h-5 text-sky-400" />
                Ví Dụ Minh Họa (Người 60kg / 30 phút)
              </h4>
              <div className="space-y-3">
                {[
                  { name: "Đi bộ thư giãn (2.5 METs)", value: "~ 79 Calo", color: "border-slate-500" },
                  { name: "Tập Gym / Cáp / Đạps (5.0 METs)", value: "~ 158 Calo", color: "border-amber-500" },
                  { name: "Đạp xe vừa phải (6.8 METs)", value: "~ 214 Calo", color: "border-emerald-500" },
                  { name: "Chạy bộ 8km/h (8.3 METs)", value: "~ 261 Calo", color: "border-red-500" },
                ].map((item, i) => (
                  <div key={i} className={`flex justify-between items-center p-3.5 bg-white/5 border-l-4 ${item.color} rounded-r-xl`}>
                    <span className="text-slate-300 text-sm font-medium">{item.name}</span>
                    <span className="text-amber-400 font-semibold text-sm">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <p className="mt-6 text-xs text-slate-400 italic">
              *Mẹo: Cân nặng càng lớn thì lượng calo đốt cháy trong cùng một khoảng thời gian tập luyện càng nhiều.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}