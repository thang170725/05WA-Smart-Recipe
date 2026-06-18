import { Beef, Leaf, Flame, Info } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

/* -------------------- DATA -------------------- */

const foodGroups = {
  protein: [
    { name: "Ức gà", calories: 165, protein: 31 },
    { name: "Trứng gà", calories: 155, protein: 13 },
    { name: "Thịt bò", calories: 250, protein: 26 },
    { name: "Cá basa", calories: 120, protein: 18 },
  ],
  carb: [
    { name: "Cơm trắng", calories: 130, carb: 28 },
    { name: "Bún", calories: 110, carb: 25 },
    { name: "Phở", calories: 150, carb: 30 },
    { name: "Khoai lang", calories: 90, carb: 21 },
  ],
  fat: [
    { name: "Thịt ba chỉ", calories: 518, fat: 53 },
    { name: "Bơ", calories: 160, fat: 15 },
    { name: "Đậu phộng", calories: 567, fat: 49 },
  ],
  fiber: [
    { name: "Rau muống", calories: 19, fiber: 2 },
    { name: "Bông cải", calories: 34, fiber: 2.6 },
    { name: "Chuối", calories: 89, fiber: 2.6 },
    { name: "Đu đủ", calories: 43, fiber: 1.7 },
  ],
};

const caloriesChart = [
  { name: "Protein", kcal: 210 },
  { name: "Tinh bột", kcal: 180 },
  { name: "Chất béo", kcal: 420 },
  { name: "Chất xơ", kcal: 60 },
];

/* -------------------- ANIMATION -------------------- */

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.2 },
  },
};

/* -------------------- MAIN COMPONENT -------------------- */

export function FoodsDocs() {
  return (
    <section className="w-full py-24">
      <div className="w-[90%] mx-auto space-y-12">

        {/* HEADER */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="text-center space-y-6"
        >
          <h2 className="text-4xl font-bold text-gray-300">
            Thực phẩm & Dinh dưỡng
          </h2>
          <p className="text-gray-300 text-lg">
            Đồ ăn Việt Nam – nhìn nhanh – hiểu liền
          </p>
        </motion.div>

        {/* INFO CARDS */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-4 gap-8"
        >
          {[
            {
              icon: <Beef className="w-8 h-8 text-emerald-600" />,
              title: "Protein",
              desc: "Xây dựng cơ bắp, no lâu, giữ dáng",
            },
            {
              icon: <Flame className="w-8 h-8 text-sky-600" />,
              title: "Tinh bột",
              desc: "Nguồn năng lượng chính mỗi ngày",
            },
            {
              icon: <Info className="w-8 h-8 text-amber-500" />,
              title: "Chất béo",
              desc: "Hấp thu vitamin, tạo hormone",
            },
            {
              icon: <Leaf className="w-8 h-8 text-lime-600" />,
              title: "Chất xơ",
              desc: "Tiêu hoá tốt, giảm mỡ",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ y: -10 }}
              className="bg-black/50 rounded-3xl p-8 shadow-white shadow-sm hover:shadow-2xl transition-all"
            >
              {item.icon}
              <h4 className="font-semibold text-xl mt-4 text-gray-300">
                {item.title}
              </h4>
              <p className="text-sm text-gray-300 mt-2">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CALORIES CHART + TABLE */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-12"
        >
          <div className="bg-black/50 rounded-3xl shadow-lg p-8 h-100 text-gray-300">
            <h4 className="font-semibold mb-6 text-lg">
              So sánh năng lượng tương đối
            </h4>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={caloriesChart}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="kcal" fill="#fff" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-black/50 rounded-3xl shadow-lg p-8 text-gray-300">
            <h4 className="font-semibold mb-6 text-lg">
              Bảng nhóm dinh dưỡng
            </h4>
            <table className="w-full text-sm">
              <thead className="text-left text-gray-300">
                <tr>
                  <th>Nhóm</th>
                  <th>Mục đích chính</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-2 font-medium">Protein</td>
                  <td>Tăng cơ – giữ dáng</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">Tinh bột</td>
                  <td>Cung cấp năng lượng</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">Chất béo</td>
                  <td>Hormone – vitamin</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">Chất xơ</td>
                  <td>Tiêu hoá – giảm mỡ</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* FOOD GROUP SECTIONS */}
        {Object.entries(foodGroups).map(([key, data]) => (
          <motion.div
            key={key}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="bg-black/50 rounded-3xl shadow-lg p-8 h-96"
          >
            <h4 className="font-semibold text-gray-300 mb-6 text-lg">
              {key === "protein" && "🥩 Giàu Protein (g / 100g)"}
              {key === "carb" && "🍚 Giàu tinh bột (g / 100g)"}
              {key === "fat" && "🥑 Giàu chất béo (g / 100g)"}
              {key === "fiber" && "🥬 Giàu chất xơ (g / 100g)"}
            </h4>

            <ResponsiveContainer width="90%" height="90%">
              <BarChart data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey={key}
                  fill="#fff"
                  radius={[12, 12, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        ))}

        {/* SUGGESTIONS */}
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="rounded-3xl bg-black/50 text-white p-12 shadow-2xl"
        >
          <h3 className="text-2xl font-semibold mb-8">
            Gợi ý dinh dưỡng
          </h3>

          <div className="grid md:grid-cols-3 gap-8 text-sm">
            <div>
              <h5 className="font-semibold mb-2">Muốn tăng cân</h5>
              <p>Cơm + thịt + trứng + chất béo tốt</p>
            </div>
            <div>
              <h5 className="font-semibold mb-2">Muốn giữ dáng</h5>
              <p>Protein nạc + rau + carb vừa phải</p>
            </div>
            <div>
              <h5 className="font-semibold mb-2">Muốn giảm mỡ</h5>
              <p>Protein cao + chất xơ + vận động</p>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}