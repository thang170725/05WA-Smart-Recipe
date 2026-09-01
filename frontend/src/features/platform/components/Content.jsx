import { useState, useEffect } from "react";
import { CreatePostApi, GetPostApi } from "../api/PlatformApi";
import {
  Search,
  MessageSquare,
  Heart,
  Plus,
  TrendingUp,
  Hash,
  Activity,
  User,
  Send,
  MoreHorizontal
} from "lucide-react";

// =========================================================
// ================= COMPONENT POPUP =======================
// =========================================================
export function Popup({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Nền đen mờ */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Khung nội dung */}
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8 animate-scale-in">
        <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Activity className="text-emerald-500" size={20} />
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 -mr-2 text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

// =========================================================
// ================= COMPONENT CONTENT =====================
// =========================================================
export function Content({ devMode }) {
  const [open, setOpen] = useState(false);

  // ======== Tạo bài viết ==============
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  
  const handleCreatePost = () => {
    if (!newPost.title || !newPost.content) return;

    const loadApi = async () => {
      const response = await CreatePostApi(newPost);
      if (response) {
        alert("Tạo bài đăng thành công");
      }
    };

    loadApi();
    setNewPost({ title: "", content: "" });
    setOpen(false);
  };

  // ======== Lấy danh sách bài đăng ==============
  const [listPost, setListPost] = useState([]);
  
  useEffect(() => {
    const loadApi = async () => {
      const res = await GetPostApi(devMode);
      setListPost(res);
    };
    loadApi();
  }, [devMode]);

  return (
    <div className="min-h-screen text-zinc-300 mx-5 my-5">
      
      {/* HEADER SECTION */}
      <div className="border-b border-zinc-800 bg-[#171c2c]/50 sticky top-0 z-40 backdrop-blur-md rounded-4xl">
        <div className="max-w-8xl mx-auto px-6 py-6 lg:py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-xs uppercase tracking-wider px-2.5 py-1 rounded-md">
                  Community
                </div>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mt-2">
                Diễn đàn Fitness & Dinh dưỡng
              </h1>
              <p className="text-zinc-400 text-sm mt-1">
                Nơi những người đam mê thể thao chia sẻ kiến thức và lộ trình
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="bg-emerald-600 text-white font-medium px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/20 cursor-pointer"
            >
              <Plus size={18} />
              Tạo bài viết
            </button>
          </div>

          {/* SEARCH BAR */}
          <div className="relative mt-6 max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input
              placeholder="Tìm kiếm kinh nghiệm giảm cân, tăng cơ..."
              className="w-full bg-[#171c2c]/50 border border-zinc-800 text-zinc-200 placeholder-zinc-500 py-3 pl-12 pr-4 rounded-xl focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-sm"
            />
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="px-6 py-8 bg-[#171c2c]/50 border border-zinc-800 rounded-2xl my-5">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* =========== FEED BÀI VIẾT (CỘT TRÁI) =========== */}
          <div className="lg:col-span-8 space-y-6">
            {listPost.map((item, index) => (
              <div
                key={index}
                className="bg-[#171c2c]/50 border border-zinc-800 rounded-2xl p-5 sm:p-6 hover:border-zinc-700 transition-colors shadow-sm shadow-amber-50"
              >
                {/* Header Bài viết */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-[#171c2c]/50 flex items-center justify-center border border-zinc-700">
                      <User className="text-zinc-400" size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-zinc-100 text-sm">
                        {item.user_post_name}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {item.post_created_at}
                      </p>
                    </div>
                  </div>
                  <button className="text-zinc-500 hover:text-zinc-300">
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                {/* Nội dung bài viết */}
                <h2 className="text-xl font-bold text-zinc-100 mb-2">
                  {item.title}
                </h2>
                <p className="text-zinc-300 text-sm leading-relaxed mb-5">
                  {item.content}
                </p>

                {/* Thanh tương tác */}
                <div className="flex items-center gap-6 text-sm text-zinc-400 border-t border-zinc-800/50 pt-4 mb-4 ">
                  <button className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors group">
                    <Heart size={18} className="group-hover:fill-emerald-400/20" />
                    <span>{item.rating_count}</span>
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors">
                    <MessageSquare size={18} />
                    <span>{item.number_comment} Bình luận</span>
                  </button>
                  {/* Rating avg giả lập giao diện sao */}
                  <span className="flex items-center gap-1 text-yellow-500/80 bg-yellow-500/10 px-2 py-0.5 rounded text-xs ml-auto">
                    ⭐ {item.rating_avg}
                  </span>
                </div>

                {/* Khu vực Comment (Thụt lề) */}
                <div className="ml-4 pl-4 border-l-2 border-zinc-800 space-y-4">
                  {/* Single Comment */}
                  <div className="group">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-zinc-200 text-sm">
                        {item.user_comment_name}
                      </span>
                      <span className="text-xs text-zinc-600">• {item.comment_created_at}</span>
                    </div>
                    <p className="text-zinc-400 text-sm">
                      {item.user_comment}
                    </p>
                  </div>

                  {/* Input nhập Comment */}
                  <div className="flex gap-3 pt-2">
                    <input
                      placeholder="Thêm bình luận..."
                      className="flex-1 bg-[#171c2c]/50 border border-zinc-800 text-zinc-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                    <button className="bg-[#171c2c]/50 hover:bg-emerald-600 text-zinc-300 hover:text-white px-4 rounded-xl transition-colors flex items-center justify-center cursor-pointer">
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* =========== SIDEBAR (CỘT PHẢI) =========== */}
          <div className="lg:col-span-4 space-y-6 ">
            
            {/* Widget Trending */}
            <div className="bg-[#171c2c]/50 border border-zinc-800 rounded-2xl p-6 shadow-sm shadow-amber-50">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp size={18} className="text-emerald-500" />
                <h3 className="font-bold text-zinc-100">Đang thịnh hành</h3>
              </div>

              <div className="space-y-4">
                {[
                  { title: "Meal Prep 7 ngày cho người bận rộn", rating: "4.9" },
                  { title: "Lịch tập Push Pull Legs chi tiết", rating: "4.8" },
                  { title: "Cách tính Macros để giảm mỡ chuẩn", rating: "4.7" },
                ].map((trend, i) => (
                  <div key={i} className="flex gap-3 group cursor-pointer">
                    <span className="text-zinc-600 font-bold text-lg">{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-zinc-300 group-hover:text-emerald-400 transition-colors">
                        {trend.title}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">⭐ {trend.rating} điểm</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget Topics */}
            <div className="bg-[#171c2c]/50 border border-zinc-800 rounded-2xl p-6 shadow-sm shadow-amber-50">
              <div className="flex items-center gap-2 mb-5">
                <Hash size={18} className="text-emerald-500" />
                <h3 className="font-bold text-zinc-100">Chủ đề nổi bật</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Dinh dưỡng", "Tăng cơ", "Giảm mỡ", "Cardio", "Whey Protein", "Chấn thương"].map(
                  (tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-zinc-800 text-zinc-400 text-xs rounded-lg hover:bg-emerald-500 hover:text-zinc-950 font-medium transition-colors cursor-pointer"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Widget Stats */}
            <div className="bg-[#171c2c]/50 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden shadow-sm shadow-amber-50">
              <h3 className="font-bold text-zinc-100 mb-4">Cộng đồng</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-zinc-950 rounded-xl p-3 border border-zinc-800">
                  <p className="text-xl font-bold text-emerald-400">1.2K</p>
                  <p className="text-xs text-zinc-500 mt-1">Bài viết</p>
                </div>
                <div className="bg-zinc-950 rounded-xl p-3 border border-zinc-800">
                  <p className="text-xl font-bold text-emerald-400">8.4K</p>
                  <p className="text-xs text-zinc-500 mt-1">Bình luận</p>
                </div>
                <div className="bg-zinc-950 rounded-xl p-3 border border-zinc-800 col-span-2 flex items-center justify-center gap-3">
                  <span className="text-2xl">⭐</span>
                  <div>
                    <p className="text-lg font-bold text-emerald-400">14.5K</p>
                    <p className="text-xs text-zinc-500">Lượt đánh giá hữu ích</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nút cộng trôi nổi cho Mobile */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-emerald-600 shadow-xl shadow-emerald-900/40 flex items-center justify-center hover:scale-105 transition-transform z-40 text-white"
      >
        <Plus size={28} />
      </button>

      {/* ================= MODAL TẠO BÀI VIẾT ================= */}
      <Popup
        open={open}
        onClose={() => setOpen(false)}
        title="Tạo chủ đề mới"
      >
        <div className="space-y-4 w-full">
          <div>
            <input
              type="text"
              placeholder="Tiêu đề bài viết..."
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
            />
          </div>

          <div>
            <textarea
              placeholder="Kinh nghiệm hoặc câu hỏi của bạn là gì?..."
              value={newPost.content}
              onChange={(e) =>
                setNewPost({ ...newPost, content: e.target.value })
              }
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl px-4 py-3 text-sm min-h-[160px] resize-y focus:outline-none focus:border-emerald-500/50 transition-all"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleCreatePost}
              className="w-full sm:w-auto bg-emerald-600 text-white font-medium px-6 py-2.5 rounded-xl hover:bg-emerald-500 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Send size={16} /> Đăng bài
            </button>
          </div>
        </div>
      </Popup>
    </div>
  );
}