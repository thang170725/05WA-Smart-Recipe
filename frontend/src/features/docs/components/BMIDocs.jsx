import { Activity, Droplets, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

export function BMIDocs() {

  const fadeUp = {
    hidden: { opacity: 0, y: 60 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const stagger = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const splitText = {
    hidden: { opacity: 0, x: 0 },
    showLeft: {
      opacity: 1,
      x: -40,
      transition: { duration: 0.8 }
    },
    showRight: {
      opacity: 1,
      x: 40,
      transition: { duration: 0.8 }
    }
  };

  return (
    <section className="w-full py-24">
      <div className="w-[90%] mx-auto space-y-12">

        {/* HEADER */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center space-y-6"
        >
          <div className="flex justify-center items-center gap-4 text-4xl font-bold text-gray-300 overflow-hidden">
            <motion.span variants={splitText} initial="hidden" whileInView="showLeft" className="relative left-20">
              BMI
            </motion.span>
            <motion.span variants={splitText} initial="hidden" whileInView="showRight">
              & Cơ thể
            </motion.span>
          </div>

          <p className="text-gray-300 text-lg">
            Ít chữ – nhiều trực quan – cuộn xuống để khám phá
          </p>
        </motion.div>

        {/* CARDS */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-3 gap-8"
        >
          {[{
            icon: <Activity className="w-8 h-8 text-blue-500" />,
            title: "BMI là gì?",
            desc: "BMI = Cân nặng / Chiều cao²"
          },
          {
            icon: <Droplets className="w-8 h-8 text-rose-500" />,
            title: "Chỉ số mỡ",
            desc: "Đánh giá chính xác hơn với người tập luyện"
          },
          {
            icon: <Info className="w-8 h-8 text-emerald-500" />,
            title: "Vì sao quan trọng?",
            desc: "Giúp kiểm soát sức khoẻ dài hạn"
          }].map((card, index) => (
            <motion.div
              key={index}
              variants={fadeUp}
              className="bg-black/50 rounded-3xl p-8 shadow-white shadow-sm hover:shadow-2xl transition-all duration-500"
              whileHover={{ y: -10 }}
            >
              {card.icon}
              <h3 className="font-semibold text-xl mt-4 mb-2 text-gray-300">
                {card.title}
              </h3>
              <p className="text-gray-300">{card.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CHART SECTION */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-12"
        >
          <motion.div
            whileInView={{ scale: [0.9, 1] }}
            transition={{ duration: 0.6 }}
            className="bg-black/50 rounded-3xl shadow-lg p-8 h-96"
          >
            <h4 className="font-semibold mb-6 text-lg text-gray-300">
              Phân loại BMI
            </h4>

            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: "Gầy", bmi: 18 },
                { name: "Chuẩn", bmi: 22 },
                { name: "Thừa", bmi: 27 },
                { name: "Béo", bmi: 32 }
              ]}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bmi" radius={[12, 12, 0, 0]} fill="#fff" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="bg-black/50 rounded-3xl shadow-lg p-8 text-gray-300"
          >
            <h4 className="font-semibold mb-6 text-lg">
              Bảng chỉ số
            </h4>

            {[
              { name: "Gầy", value: "< 18.5" },
              { name: "Bình thường", value: "18.5 – 24.9" },
              { name: "Thừa cân", value: "25 – 29.9" },
              { name: "Béo phì", value: "≥ 30" },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03 }}
                className="flex justify-between p-4 mb-3 bg-gray-300/20 rounded-xl"
              >
                <span>{item.name}</span>
                <span className="text-gray-300">{item.value}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* SUGGESTIONS */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="rounded-3xl bg-black/50 text-gray-300 p-12 shadow-2xl"
        >
          <h3 className="text-2xl font-semibold mb-8">
            Gợi ý cải thiện
          </h3>

          <div className="grid md:grid-cols-4 gap-8">
            {["BMI thấp", "BMI cao", "Mỡ cao", "Mỡ thấp"].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8 }}
              >
                <h5 className="font-semibold mb-2">{item}</h5>
                <p className="text-sm opacity-80">
                  Điều chỉnh ăn uống và vận động hợp lý.
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}