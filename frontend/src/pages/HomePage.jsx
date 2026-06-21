import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Salad,
  HeartPulse,
  Dumbbell,
  BarChart3,
  Brain,
  ArrowRight,
  BookOpen,
  PlayCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dock } from "lucide-react"

export default function Home() {
  // =================================================================================
  // ========================= chức năng điều hướng  ================================
  // =================================================================================
  const navigate = useNavigate()
  
  const [centerIndex, setCenterIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  
  const cards = [
    {
      title: "Thực đơn thông minh",
      desc: "Thư viện món ăn đầy đủ calo & macro. Lên kế hoạch Meal Plan khoa học, không lo thiếu chất.",
      icon: Salad,
      route: "/meals"
    },
    {
      title: "Trung Tâm Sức Khỏe",
      desc: "Tính BMI, BMR, TDEE chính xác. Cá nhân hóa khuyến nghị theo chỉ số cơ thể.",
      icon: HeartPulse,
      route: "/health-center",
    },
    {
      title: "Lộ Trình Luyện Tập",
      desc: "Gợi ý bài tập thông minh theo mục tiêu: giảm mỡ, tăng cơ hoặc nâng cao thể lực.",
      icon: Dumbbell,
      route: "/workout-roadmap",
    },
    {
      title: "Thống Kê & Cộng Đồng",
      desc: "Theo dõi tiến trình bằng biểu đồ trực quan và kết nối cộng đồng sống khỏe.",
      icon: BarChart3,
      route: "/platform",
    },
    {
      title: "Tài Liệu Dinh Dưỡng",
      desc: "Kho kiến thức chuyên sâu về calo, macro, dinh dưỡng khoa học và cách tối ưu chế độ ăn.",
      icon: BookOpen,
      route: "/docs",
    },
    {
      title: "Video Hướng Dẫn",
      desc: "Xem video từng bước để hiểu rõ cách sử dụng hệ thống và tận dụng tối đa Smart Recipe.",
      icon: PlayCircle,
      route: "/guide/video",
    },
  ]

  const storyContent = {
  heading: "Một hành trình bắt đầu từ câu hỏi đơn giản",
  
  paragraphs: [
    "Hôm nay ăn gì để khỏe? Tập gì để đẹp? Đây là câu hỏi mà hầu như ai cũng từng tự hỏi, nhưng lại rất khó để trả lời một cách chính xác.",

    "Phần lớn chúng ta hoặc ăn theo cảm tính, hoặc tập theo những bài có sẵn trên mạng mà không thực sự hiểu cơ thể mình cần gì.",

    "Smart Recipe được tạo ra để thay đổi điều đó. Không chỉ là một ứng dụng, mà là một hệ thống giúp bạn hiểu cơ thể, xây dựng chế độ ăn uống và luyện tập một cách khoa học.",

    "Từ căn bếp đến phòng gym, mọi thứ đều được kết nối thành một hành trình liền mạch."
  ],

  closing:
    "Sức khỏe không phải là đích đến, mà là hành trình bạn xây dựng mỗi ngày."
};

  useEffect(() => {
    if (paused) return

    const interval = setInterval(() => {
      setCenterIndex((prev) => (prev + 1) % cards.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [paused]);

  const getIndex = (offset) => {
    return (centerIndex + offset + cards.length) % cards.length;
  };

  return (
    <div className="page-shell space-y-16 sm:space-y-20">
      {/* Hero */}
      <section className="hero-banner">
        <div className="mx-auto space-y-6 ">       
          <span className="badge-brand">Smart Recipe Version 1</span>
          
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-gradient-brand leading-tight">
            Ăn thông minh
            <br />
            Tập khoa học
          </h1>
          
          <p className="text-base sm:text-lg text-slate-300/90 max-w-xl mx-auto leading-relaxed">
            Hệ sinh thái dinh dưỡng & luyện tập tích hợp AI giúp bạn làm chủ sức khỏe
            từ căn bếp đến phòng gym.
          </p>

          <div className="flex gap-5 justify-center">
            <button
              type="button"
              onClick={() => navigate("/health-center")}
              className="btn-primary text-base mt-2"
            >
              Bắt đầu ngay
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => navigate("/docs")}
              className="text-base mt-2 border px-5 py-3 rounded-2xl cursor-pointer hover:bg-gray-600 duration-150 hover:-translate-y-0.5"
            >
              Tài liệu dinh dưỡng
              <Dock className="w-5 h-5 inline-block ml-2"/>
            </button>
          </div>

        </div>
      </section>

      {/* Features intro + slider */}
      <section className="space-y-10">
        <div className="text-center space-y-3">
          <h2 className="section-heading">
            <Sparkles className="w-6 h-6 text-brand-light" />
            Đã sẵn sàng cho bạn
          </h2>
          <p className="section-desc">
            Một hệ sinh thái khép kín giúp bạn trả lời câu hỏi mỗi ngày:
            <span className="font-semibold text-white">
              {" "}“Hôm nay ăn gì để khỏe và tập gì để đẹp?”
            </span>
          </p>
        </div>

        <div
          className="relative w-full flex justify-center items-center h-64 sm:h-72 overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative w-full flex justify-center items-center">
            <AnimatePresence>
              {cards.map((card, index) => {
                const Icon = card.icon;
                const offset = (index - centerIndex + cards.length) % cards.length;

                if (offset > 2 && offset < cards.length - 2) return null;

                let x = 0;
                let scale = 0.7;
                let opacity = 0.3;
                let zIndex = 0;

                if (offset === 0) {
                  x = 0;
                  scale = 1.05;
                  opacity = 1;
                  zIndex = 30;
                } else if (offset === 1) {
                  x = 280;
                  scale = 0.88;
                  opacity = 0.75;
                  zIndex = 20;
                } else if (offset === cards.length - 1) {
                  x = -280;
                  scale = 0.88;
                  opacity = 0.75;
                  zIndex = 20;
                } else if (offset === 2) {
                  x = 500;
                  scale = 0.72;
                  opacity = 0.4;
                } else if (offset === cards.length - 2) {
                  x = -500;
                  scale = 0.72;
                  opacity = 0.4;
                }

                return (
                  <motion.div
                    key={card.title}
                    onClick={() => navigate(card.route)}
                    className="absolute cursor-pointer"
                    animate={{ x, scale, opacity, zIndex }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div
                      className={`
                        w-64 sm:w-72 min-h-[180px] rounded-2xl p-6 text-white
                        border transition-shadow duration-300
                        ${offset === 0
                          ? "glass-card-elevated border-white/20 shadow-2xl"
                          : "glass-card border-white/10 hover:border-white/20"
                        }
                      `}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${offset === 0 ? "bg-brand/20" : "bg-white/10"}`}>
                        <Icon className="w-5 h-5 text-brand-light" />
                      </div>
                      <h3 className="text-base font-semibold font-display">{card.title}</h3>
                      <p className="text-sm text-slate-400 mt-2 leading-relaxed line-clamp-3">
                        {card.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Story */}
        <div className="glass-panel max-w-3xl mx-auto px-8 sm:px-10 py-12 space-y-6">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white leading-snug">
            {storyContent.heading}
          </h2>

          {storyContent.paragraphs.map((text, index) => (
            <p key={index} className="text-slate-300 text-base leading-relaxed">
              {text}
            </p>
          ))}

          <p className="italic text-slate-400 text-base border-l-2 border-brand/50 pl-4">
            "{storyContent.closing}"
          </p>
        </div>

        {/* Difference */}
        <div className="glass-card text-center px-8 sm:px-12 py-12 space-y-5 max-w-3xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-brand/15 flex items-center justify-center mx-auto">
            <Brain className="w-6 h-6 text-brand-light" />
          </div>

          <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
            Smart Recipe khác biệt như thế nào?
          </h3>

          <p className="text-slate-400 text-base leading-relaxed max-w-2xl mx-auto">
            Hybrid Logic: kết hợp tính toán chỉ số y khoa chuẩn,
            hệ thống gợi ý thông minh và giao diện tối giản,
            giúp bạn tập trung hoàn toàn vào hành trình thay đổi.
          </p>

          <p className="italic text-slate-500 text-sm">
            "Sức khỏe không phải là đích đến, mà là hành trình mỗi ngày."
          </p>
        </div>
      </section>
    </div>
  );
}
