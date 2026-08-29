import { useState, useEffect, useRef, useMemo } from "react"
import { Play, Pause, Volume2, ArrowRight, CheckCircle2, Quote } from "lucide-react"

// Đảm bảo file audio_introduction.mp3 đã nằm trong thư mục public/audio/
const AUDIO_SRC = "/audio/audio_introduction.mp3"

// 1. CHIA CẤU TRÚC BÀI VIẾT ĐỂ FORMAT ĐẸP MẮT MÀ VẪN GIỮ ĐƯỢC THỨ TỰ TỪ
const storyBlocks = [
  { type: "title", text: "Hành trình từ một sinh viên mệt mỏi đến trợ lý sức khỏe cá nhân: Câu chuyện đằng sau Smart Recipe" },
  { type: "greeting", text: "Xin chào bạn, tôi là Lê Đức Thắng — tác giả và là người phát triển Smart Recipe." },
  { type: "paragraph", text: "Trước khi Smart Recipe trở thành một hệ thống quản lý sức khỏe thông minh, nó vốn bắt đầu từ một cuộc khủng hoảng cá nhân của chính tôi vào năm 2023. Thời điểm đó, tôi là một sinh viên năm nhất sống trong guồng quay công việc và sinh hoạt đảo lộn. Sức khỏe của tôi sụt giảm nhanh chóng, cơ thể gầy gò, mệt mỏi. Tôi bắt đầu hoảng sợ và lao đi tìm giải pháp." },
  { type: "paragraph", text: "Tôi đã tải rất nhiều ứng dụng. Nhưng nhanh chóng, tôi nhận ra một bài toán muôn thuở: Hầu hết các ứng dụng đều ép chúng ta vào một khuôn khổ quá khắc nghiệt." },
  { type: "paragraph", text: "Nếu bạn muốn tăng cân hay giảm mỡ, họ bắt bạn tuân theo một thực đơn cố định, những bài tập rập khuôn. Nhưng thực tế thì sao? Chúng ta không thể ăn mãi một vài món khô khốc, cũng khó mà duy trì kỷ luật sắt đá khi cuộc sống luôn biến động. Sự gượng ép đó khiến đa số chúng ta bỏ cuộc giữa chừng." },
  { type: "paragraph", text: "Vì vậy, tôi tự hỏi: Tại sao không tạo ra một hệ thống xoay quanh con người, thay vì bắt con người gồng mình vừa vặn với hệ thống? Bạn hoàn toàn có quyền ăn những món mình thích. Còn việc điều chỉnh lộ trình luyện tập ra sao, cân bằng năng lượng thế nào để bạn vẫn khỏe mạnh và tự do — hãy để Công nghệ và AI lo." },
  { type: "paragraph", text: "Đó chính là lý do Smart Recipe ra đời: Lấy con người làm trung tâm, để bạn ăn uống thỏa thích và tập luyện trong niềm vui." },
  { type: "subtitle", text: "4 Trụ cột trải nghiệm tại Smart Recipe:" },
  { type: "bullet", text: "Tài liệu & Kiến thức chuẩn xác: Bạn không cần đoán mò. Hệ thống cung cấp kiến thức dinh dưỡng thực tế — hiểu đúng về Protein, Calo, cách đọc chỉ số cơ thể để biến kiến thức thành kết quả." },
  { type: "bullet", text: "Thực đơn & Trợ lý Dinh dưỡng AI: Thư viện món ăn phong phú giúp bạn theo dõi bữa ăn linh hoạt. Dữ liệu này là \"nguyên liệu\" để trợ lý AI thấu hiểu thói quen của bạn và đưa ra lời khuyên sát thực tế nhất." },
  { type: "bullet", text: "Trung tâm Sức khỏe & Dự báo Machine Learning: Đánh giá các chỉ số cơ thể tự động. Mô hình Học máy (Machine Learning) sẽ dự đoán quỹ đạo cân nặng của bạn theo tuần dựa trên dữ liệu tập - ăn thực tế." },
  { type: "bullet", text: "Lộ trình Luyện tập Tùy biến: Tự do cá nhân hóa bài tập từ Cardio đến Strength. AI sẽ tự động đánh giá và tinh chỉnh bài tập dựa trên lượng dinh dưỡng bạn đã nạp." },
  { type: "bullet", text: "Diễn đàn Kết nối: Nơi bạn không cô đơn trên hành trình rèn luyện, dễ dàng chia sẻ công thức và truyền động lực cho nhau." },
  { type: "paragraph", text: "Smart Recipe không dùng các con số vô hồn. Chúng tôi kết hợp Backend tính toán y khoa chuẩn xác cùng Trợ lý AI phân tích hành vi để tạo nên sự đồng hành hoàn hảo." },
  { type: "quote", text: "\"Sức khỏe không phải là đích đến, mà là một hành trình rèn luyện mỗi ngày.\"" },
  { type: "footer", text: "Cảm ơn bạn đã ở đây, và hãy để Smart Recipe đồng hành cùng bạn!" }
]

export function AuthorStoryDialog({ onClose }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  
  const audioRef = useRef(null)
  const scrollContainerRef = useRef(null)

  // 2. DUYỆT QUA CÁC BLOCK ĐỂ GÁN INDEX CHO TỪNG TỪ MỘT CÁCH LIÊN TỤC
  const { parsedContent, totalWords } = useMemo(() => {
    let globalWordIndex = 0;
    
    const parsed = storyBlocks.map(block => {
       const words = block.text.split(/([ ]+)/);
       const tokens = [];
       
       words.forEach(word => {
         if (word) {
           const isSpace = /^[ ]+$/.test(word);
           tokens.push({
             text: word,
             wordIndex: isSpace ? -1 : globalWordIndex,
             isSpace: isSpace
           });
           if (!isSpace) globalWordIndex++;
         }
       });
       return { ...block, tokens };
    });

    return { parsedContent: parsed, totalWords: globalWordIndex };
  }, []);

  // 3. TÍNH TOÁN TỪ ĐANG ĐƯỢC ĐỌC THEO THỜI GIAN AUDIO
  const activeWordIndex = useMemo(() => {
    if (!duration || duration === 0 || !isPlaying) return -1;
    // Tính toán tiến trình theo % thời gian
    const progress = currentTime / duration;
    return Math.floor(progress * totalWords);
  }, [currentTime, duration, totalWords, isPlaying]);

  // 4. AUTO-SCROLL: TỰ ĐỘNG CUỘN ĐẾN TỪ ĐANG HIGHLIGHT
  useEffect(() => {
    if (activeWordIndex >= 0 && isPlaying) {
      const activeElement = document.getElementById(`word-${activeWordIndex}`);
      if (activeElement && scrollContainerRef.current) {
        // Cuộn mượt mà sao cho phần tử đang đọc luôn ở giữa khung nhìn
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [activeWordIndex, isPlaying]);

  const handleTogglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(err => console.log("Lỗi play audio:", err))
    }
  }

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(err => console.log(err))
    }
  }, [])

  return (
    <div className="flex flex-col">
      <audio
        ref={audioRef}
        src={AUDIO_SRC}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false)
          setCurrentTime(0)
        }}
      />

      {/* Trình phát Audio */}
      <div className="px-5 py-3.5 bg-emerald-500 text-white rounded-2xl flex items-center justify-between shadow-md mb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleTogglePlay}
            className="w-10 h-10 rounded-full bg-white text-emerald-600 flex items-center justify-center hover:bg-emerald-50 transition-all shadow-md active:scale-95"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
          </button>
          <div>
            <p className="text-sm font-bold leading-tight">
              {isPlaying ? "Đang phát bài giới thiệu MP3..." : "Tạm dừng audio"}
            </p>
            <p className="text-[11px] text-emerald-100 mt-0.5 flex items-center gap-1">
              <Volume2 size={12} /> Giọng đọc gốc từ Tác giả
            </p>
          </div>
        </div>
        {isPlaying && (
          <div className="flex items-center gap-1 pr-2">
            <span className="w-1.5 h-4 bg-white animate-[bounce_1s_infinite] rounded-full" />
            <span className="w-1.5 h-6 bg-white animate-[bounce_1s_infinite_0.2s] rounded-full" />
            <span className="w-1.5 h-3 bg-white animate-[bounce_1s_infinite_0.4s] rounded-full" />
          </div>
        )}
      </div>

      {/* Khu vực chứa Nội dung (CÓ AUTO-SCROLL) */}
      <div 
        ref={scrollContainerRef}
        className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 overflow-y-auto max-h-[55vh] text-[15px] leading-relaxed custom-scrollbar scroll-smooth"
      >
        {parsedContent.map((block, blockIdx) => {
          // XỬ LÝ GIAO DIỆN LINH HOẠT CHO TỪNG LOẠI BLOCK
          let blockClasses = "mb-4 text-slate-700"; // Mặc định là paragraph
          let PrefixIcon = null;

          if (block.type === "title") {
            blockClasses = "text-xl font-extrabold text-emerald-800 mb-6 text-center leading-snug";
          } else if (block.type === "greeting") {
            blockClasses = "font-bold text-slate-800 mb-5";
          } else if (block.type === "subtitle") {
            blockClasses = "font-bold text-slate-800 mt-6 mb-3 text-[16px] border-b border-slate-200 pb-2";
          } else if (block.type === "bullet") {
            blockClasses = "flex gap-3 mb-3 text-slate-700 items-start";
            PrefixIcon = <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />;
          } else if (block.type === "quote") {
            blockClasses = "flex flex-col items-center italic font-semibold text-emerald-800 text-[16px] my-6 bg-emerald-100/50 p-5 rounded-2xl border-l-4 border-emerald-500 shadow-sm";
            PrefixIcon = <Quote className="w-6 h-6 text-emerald-400 mb-2 opacity-50" />;
          } else if (block.type === "footer") {
            blockClasses = "text-center font-medium text-amber-700 mt-6 bg-amber-50 py-3 rounded-xl";
          }

          return (
            <div key={blockIdx} className={blockClasses}>
              {PrefixIcon && PrefixIcon}
              <div className={block.type === "bullet" ? "flex-1" : ""}>
                {block.tokens.map((token, i) => {
                  if (token.isSpace) return <span key={i}> </span>;
                  
                  const isActive = isPlaying && token.wordIndex === activeWordIndex;

                  return (
                    <span
                      key={i}
                      id={`word-${token.wordIndex}`} // Đánh ID để gọi hàm cuộn
                      className={`transition-colors duration-150 rounded-[4px] px-[1px] py-[2px] ${
                        isActive ? "bg-amber-300 text-amber-950 font-bold shadow-sm" : ""
                      }`}
                    >
                      {token.text}
                    </span>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end">
        <button
          type="button"
          onClick={() => {
            if (audioRef.current) audioRef.current.pause()
            onClose()
          }}
          className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2 rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <span>Bắt đầu trải nghiệm ngay</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}