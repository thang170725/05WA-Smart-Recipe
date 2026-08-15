import { Activity, Droplets, Info, Flame, Scale } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

export function BMIDocs() {
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
            <Scale className="w-6 h-6 text-brand-light inline-block mr-2 -mt-1" />
            Các Chỉ Số Cơ Bản
          </h2>
          <p className="section-desc max-w-2xl mx-auto">
            Những con số này không dùng để phán xét cơ thể bạn. Chúng là tấm bản đồ 
            giúp Smart Recipe định vị bạn đang ở đâu trên hành trình tiến tới mục tiêu.
          </p>
        </motion.div>

        {/* CARDS INFO */}
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <Activity className="w-6 h-6 text-brand-light" />,
              title: "BMI (Body Mass Index)",
              desc: "Chỉ số khối cơ thể dựa trên chiều cao & cân nặng. Giúp phân loại tình trạng dinh dưỡng cơ bản (Gầy, Chuẩn, Thừa cân)."
            },
            {
              icon: <Flame className="w-6 h-6 text-orange-400" />,
              title: "TDEE & BMR",
              desc: "BMR là năng lượng để duy trì sự sống. TDEE là tổng năng lượng tiêu hao/ngày. Đây là gốc rễ để tính calo tăng/giảm cân."
            },
            {
              icon: <Droplets className="w-6 h-6 text-sky-400" />,
              title: "Tỷ lệ mỡ (Body Fat)",
              desc: "Hai người cùng BMI nhưng vóc dáng có thể khác xa nhau. Tỷ lệ mỡ phản ánh chính xác nhất độ săn chắc của cơ thể."
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
          
          <div className="glass-panel p-8">
            <h4 className="font-display text-lg font-semibold text-white mb-6">Biểu Đồ Phân Loại BMI Chuẩn WHO</h4>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: "Thiếu cân", bmi: 18.5, fill: "#94a3b8" },
                  { name: "Chuẩn", bmi: 24.9, fill: "#10b981" },
                  { name: "Thừa cân", bmi: 29.9, fill: "#f59e0b" },
                  { name: "Béo phì", bmi: 35, fill: "#ef4444" }
                ]}>
                  <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  />
                  <Bar dataKey="bmi" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel p-8 flex flex-col justify-center">
            <h4 className="font-display text-lg font-semibold text-white mb-6">Bảng Tra Cứu Chỉ Số</h4>
            <div className="space-y-3">
              {[
                { name: "Thiếu cân (Gầy)", value: "Dưới 18.5", color: "border-slate-500" },
                { name: "Bình thường (Chuẩn)", value: "18.5 – 24.9", color: "border-emerald-500" },
                { name: "Tiền béo phì (Thừa cân)", value: "25.0 – 29.9", color: "border-amber-500" },
                { name: "Béo phì", value: "Trên 30.0", color: "border-red-500" },
              ].map((item, i) => (
                <div key={i} className={`flex justify-between items-center p-4 bg-white/5 border-l-4 ${item.color} rounded-r-xl`}>
                  <span className="text-slate-300 font-medium">{item.name}</span>
                  <span className="text-brand-light font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-slate-400 italic">
              *Lưu ý: BMI có thể không phản ánh đúng với vận động viên hoặc người có lượng cơ bắp lớn.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}