import { useState, useEffect } from "react"
import { 
  CreatePostApi,
  GetPostApi
} from "../api/PlatformApi";
import {
  Search,
  MessageCircle,
  Star,
  Plus,
  TrendingUp,
  Dumbbell,
} from "lucide-react";

// component pop up
export function Popup({ open, onClose, title, children }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center ">
      <div
        className="z-10 absolute w-full h-screen inset-0 bg-black/40"
        onClick={onClose}
      />

      <div className="relative z-50 bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 sm:p-8 animate-fade-in">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
          <h2 className="font-display text-2xl font-bold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 cursor-pointer" 
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}

export function Content({devMode}) {
  // USESTATE
  const [open, setOpen] = useState(false) // để đóng mở popup
  

  // ===============================================
  // ======== chức năng tạo bài viết ==============
  // ===============================================
  const [newPost, setNewPost] = useState({ title: "", content: "" }); // tạo bài post mới
  // API tạo bài post mới
  const handleCreatePost = () => {
    if (!newPost.title || !newPost.content) return;

    const loadApi = async () => {
      const response = await CreatePostApi(newPost)

      if (response) {
        alert("Tạo bài đăng thành công")
      }
    }

    loadApi()
    setNewPost({ title: "", content: "" });
  };
  
  // =========================================================
  // ======== chức năng lấy danh sách bài đăng ==============
  // =========================================================
  const [listPost, setListPost] = useState([]) // chứa danh sách bài đăng
  useEffect(() => {
    const loadApi = async () => {
      const res = await GetPostApi(devMode)

      setListPost(res)
    }

    loadApi()
  }, [])

  return (
    <div className="min-h-screen text-white">
      {/* HEADER */}
      <div className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex gap-3">
                <div className="bg-linear-0 from-[#D04635] to-[#DE5442] text-white font-bold text-md px-3 py-1.5 rounded-lg shadow-lg shadow-emerald-900/30">
                  DevForum
                </div>
                <h1 className="text-4xl font-bold flex center">
                  Cộng đồng - Fitness Community
                </h1>
              </div>
              
              <p className="text-zinc-400 mt-2">
                Chia sẻ kinh nghiệm dinh dưỡng và luyện tập
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className=" bg-linear-0 from-[#D04635] to-[#DE5442] font-bold
              px-5
              py-3
              rounded-2xl
              flex
              items-center
              gap-2
              "
            >
              <Plus size={18} />
              Tạo bài viết
            </button>
          </div>

          {/* SEARCH */}
          <div className="relative mt-8">
            <Search
              className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-zinc-500
              "
            />

            <input
              placeholder="Tìm kiếm bài viết..."
              className="input-glass w-full border py-4 pl-12 pr-4 rounded-2xl"
            />
          </div>

        </div>
      </div>

      {/* MAIN */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* POSTS */}
          <div className="lg:col-span-8 space-y-6">

            {listPost.map((item) => (
              <div
                key={item}
                className="
                input-glass
                shadow-2xl
                rounded-3xl
                p-6
                "
              >
                {/* USER */}
                <div className="flex justify-between">
                  <div className="flex gap-4">
                    <div
                      className="
                      w-12
                      h-12
                      rounded-full
                      bg-emerald-600
                      "
                    />
                    <div>
                      <h3 className="font-semibold">
                        {item.user_post_name}
                      </h3>

                      <p className="text-sm text-zinc-500">{item.post_created_at}</p>
                    </div>
                  </div>
                </div>

                {/* TITLLE */}
                <h2 className="text-2xl font-bold mt-5">
                  {item.title}
                </h2>

                {/* CONTENT */}
                <p className="mt-4 text-zinc-300 leading-relaxed">
                  {item.content}
                </p>

                {/* FOOTER */}
                <div
                  className="
                  flex
                  items-center
                  gap-8
                  mt-6
                  pt-6
                  border-t
                  border-zinc-800
                  "
                >
                  <div className="flex items-center gap-2">
                    <Star
                      size={18}
                      className="text-yellow-400"
                    />
                    {item.rating_count}
                  </div>

                  <div className="flex items-center gap-2">
                    <MessageCircle size={18} />
                    {item.rating_avg}
                  </div>

                  <div className="flex items-center gap-2">
                    <MessageCircle size={18} />
                    {item.number_comment}
                  </div>
                </div>

                {/* USER COMMENTS */}
                <div className="mt-6 space-y-3">
                  <div
                    className="
                    input-glass
                    rounded-2xl
                    p-4
                    "
                  >
                    <p className="font-medium">
                      {item.user_comment_name}
                    </p>

                    <p className="font-medium text-sm">
                      {item.comment_created_at}
                    </p>

                    <p className="text-zinc-300 mt-1">
                      {item.user_comment}
                    </p>
                  </div>

                  <div
                    className="
                    flex
                    gap-3
                    mt-4
                    "
                  >
                    <input
                      placeholder="Viết bình luận..."
                      className="
                      flex-1
                      bg-zinc-800
                      rounded-2xl
                      px-4
                      py-3
                      "
                    />

                    <button
                      className="
                      bg-emerald-600
                      px-6
                      rounded-2xl
                      "
                    >
                      Gửi
                    </button>
                  </div>

                </div>

              </div>
            ))}

          </div>

          {/* SIDEBAR */}

          <div className="lg:col-span-4 space-y-6">

            {/* TRENDING */}

            <div
              className="
              bg-zinc-900
              border
              border-zinc-800
              rounded-3xl
              p-6
              "
            >
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp />
                <h3 className="font-bold">
                  Trending
                </h3>
              </div>

              <div className="space-y-4">

                <div>
                  <p className="font-medium">
                    Meal Prep cho người bận rộn
                  </p>

                  <p className="text-sm text-zinc-500">
                    ⭐ 4.9
                  </p>
                </div>

                <div>
                  <p className="font-medium">
                    Cardio hay HIIT hiệu quả hơn?
                  </p>

                  <p className="text-sm text-zinc-500">
                    ⭐ 4.8
                  </p>
                </div>

                <div>
                  <p className="font-medium">
                    Giảm 10kg trong 4 tháng
                  </p>

                  <p className="text-sm text-zinc-500">
                    ⭐ 4.7
                  </p>
                </div>

              </div>
            </div>

            {/* CATEGORIES */}

            <div
              className="
              bg-zinc-900
              border
              border-zinc-800
              rounded-3xl
              p-6
              "
            >
              <div className="flex items-center gap-2 mb-5">
                <Dumbbell />
                <h3 className="font-bold">
                  Chủ đề
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">

                <span className="px-3 py-2 bg-zinc-800 rounded-xl">
                  Dinh dưỡng
                </span>

                <span className="px-3 py-2 bg-zinc-800 rounded-xl">
                  Tăng cơ
                </span>

                <span className="px-3 py-2 bg-zinc-800 rounded-xl">
                  Giảm cân
                </span>

                <span className="px-3 py-2 bg-zinc-800 rounded-xl">
                  Cardio
                </span>

                <span className="px-3 py-2 bg-zinc-800 rounded-xl">
                  Meal Prep
                </span>

              </div>
            </div>

            {/* STATS */}

            <div
              className="
              bg-gradient-to-br
              from-emerald-600
              to-emerald-800
              rounded-3xl
              p-6
              "
            >
              <h3 className="font-bold text-xl">
                Cộng đồng
              </h3>

              <div className="mt-4 space-y-3">

                <div>
                  📄 1.245 bài viết
                </div>

                <div>
                  💬 8.392 bình luận
                </div>

                <div>
                  ⭐ 14.520 đánh giá
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>

      {/* FLOAT BUTTON */}

      <button
        className="
        fixed
        bottom-8
        right-8
        w-16
        h-16
        rounded-full
        bg-emerald-600
        shadow-xl
        flex
        items-center
        justify-center
        hover:scale-105
        transition
        "
      >
        <Plus size={24} />
      </button>

      <Popup
        open={open}
        onClose={() => setOpen(false)}
        title="+ Tạo chủ đề mới"
      >
        {/* CREATE POST */}
        <div className="space-y-4 w-full min-w-[320px] sm:min-w-[400px]">
          <input
            type="text"
            placeholder="Tiêu đề ..."
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            className="input-light pl-4! w-full"
          />

          <textarea
            placeholder="Viết nội dung ..."
            value={newPost.content}
            onChange={(e) =>
              setNewPost({ ...newPost, content: e.target.value })
            }
            className="input-light pl-4! w-full min-h-[120px] resize-y"
          />

          <button
            type="button"
            onClick={handleCreatePost}
            className="btn-primary w-full sm:w-auto bg-red-700!"
          >
            Đăng bài
          </button>
        </div>
      </Popup>
    </div>
  );
}