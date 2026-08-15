import { Beef, Wheat, Droplet, Leaf, Apple } from "lucide-react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion } from "framer-motion";

const foodGroups = {
  protein: [
    { name: "Ức gà", calories: 165, value: 31 },
    { name: "Trứng", calories: 155, value: 13 },
    { name: "Thịt bò nạc", calories: 250, value: 26 },
    { name: "Cá basa", calories: 120, value: 18 },
  ],
  carb: [
    { name: "Cơm trắng", calories: 130, value: 28 },
    { name: "Bún/Phở", calories: 110, value: 25 },
    { name: "Khoai lang", calories: 90, value: 21 },
    { name: "Yến mạch", calories: 389, value: 66 },
  ]
};

export function FoodsDocs() {
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
            <Apple className="w-6 h-6 text-brand-light inline-block mr-2 -mt-1" />
            Nền Tảng Dinh Dưỡng
          </h2>
          <p className="section-desc max-w-2xl mx-auto">
            Không có thực phẩm nào hoàn toàn tốt hay xấu. Chìa khóa nằm ở việc cân bằng 
            4 nhóm chất đa lượng (Macros) phù hợp với mục tiêu của cơ thể bạn.
          </p>
        </motion.div>

        {/* MACROS INFO CARDS */}
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-4 gap-4 sm:gap-6">
          {[
            {
              icon: <Beef className="w-7 h-7 text-rose-400" />,
              title: "Chất Đạm (Protein)",
              desc: "Viên gạch xây dựng cơ bắp, hỗ trợ phục hồi và giúp no lâu. Rất quan trọng khi tập luyện.",
              kcal: "1g = 4 Kcal"
            },
            {
              icon: <Wheat className="w-7 h-7 text-amber-400" />,
              title: "Tinh Bột (Carbs)",
              desc: "Nguồn nhiên liệu chính cho não bộ và vận động. Ưu tiên tinh bột chậm (khoai lang, yến mạch).",
              kcal: "1g = 4 Kcal"
            },
            {
              icon: <Droplet className="w-7 h-7 text-sky-400" />,
              title: "Chất Béo (Fats)",
              desc: "Hòa tan vitamin, điều hòa hormone. Lượng calo đậm đặc nhất, cần kiểm soát kỹ.",
              kcal: "1g = 9 Kcal"
            },
            {
              icon: <Leaf className="w-7 h-7 text-emerald-400" />,
              title: "Chất Xơ (Fiber)",
              desc: "Hỗ trợ tiêu hóa, làm chậm hấp thu đường, giúp dạ dày no lâu mà không chứa năng lượng thừa.",
              kcal: "Giảm mỡ hiệu quả"
            },
          ].map((item, i) => (
            <motion.div key={i} variants={fadeUp} className="glass-card p-6 flex flex-col h-full hover:border-white/20">
              <div className="mb-4">{item.icon}</div>
              <h4 className="font-display font-semibold text-lg text-white mb-2">{item.title}</h4>
              <p className="text-sm text-slate-400 flex-1 leading-relaxed">{item.desc}</p>
              <div className="mt-4 pt-4 border-t border-white/10 text-brand-light text-sm font-medium">
                {item.kcal}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CHARTS: THỰC PHẨM VIỆT NAM QUEN THUỘC */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-2 gap-8">
          
          {/* Chart Protein */}
          <div className="glass-panel p-8">
            <h4 className="font-display text-lg font-semibold text-white mb-1">Nguồn Protein phổ biến</h4>
            <p className="text-xs text-slate-400 mb-6">Hàm lượng Đạm (g) trên 100g thực phẩm</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={foodGroups.protein} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {foodGroups.protein.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#fb7185" /> 
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart Carb */}
          <div className="glass-panel p-8">
            <h4 className="font-display text-lg font-semibold text-white mb-1">Nguồn Tinh Bột quen thuộc</h4>
            <p className="text-xs text-slate-400 mb-6">Hàm lượng Tinh Bột (g) trên 100g thực phẩm</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={foodGroups.carb} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {foodGroups.carb.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#fbbf24" /> 
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* SMART RECIPE SUGGESTIONS PANEL */}
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="glass-panel p-8 sm:p-10 border-l-4 border-l-brand">
          <h3 className="font-display text-2xl font-bold text-white mb-6">
            Lời Khuyên Từ <span className="text-gradient-brand">Smart Recipe</span>
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h5 className="font-semibold text-white flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand"></div> Mục tiêu Tăng Cân
              </h5>
              <p className="text-sm text-slate-400 leading-relaxed">
                Nạp dư Calo (Surplus). Tăng cường tinh bột sạch và chất béo tốt (bơ, các loại hạt) để đủ calo mà không phải ăn quá no. Không bỏ qua tập kháng lực để tăng cơ.
              </p>
            </div>
            <div className="space-y-2">
              <h5 className="font-semibold text-white flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div> Mục tiêu Giữ Dáng
              </h5>
              <p className="text-sm text-slate-400 leading-relaxed">
                Ăn bằng TDEE (Maintenance). Tập trung vào bữa ăn đa dạng, đủ màu sắc. Duy trì thói quen vận động nhẹ nhàng và ngủ đủ giấc.
              </p>
            </div>
            <div className="space-y-2">
              <h5 className="font-semibold text-white flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-400"></div> Mục tiêu Giảm Mỡ
              </h5>
              <p className="text-sm text-slate-400 leading-relaxed">
                Thâm hụt Calo (Deficit) nhưng <strong className="text-slate-200">giữ Protein cao</strong> để không mất cơ. Ăn nhiều rau xanh để tạo cảm giác no ảo. Tránh calo lỏng (trà sữa, nước ngọt).
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}