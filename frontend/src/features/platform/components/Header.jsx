import { Search, Bell, MessageCircle } from "lucide-react";
import { useState } from "react"
import { CreatePostApi } from "../api/PlatformApi";

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
          <h2 className="font-display text-xl font-bold text-slate-800">{title}</h2>
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

export default function Header({
  devMode
}) {
  // USESTATE
  const [open, setOpen] = useState(false) // để đóng mở popup
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

  return (
    <>
      <header className="text-white space-y-6 pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-emerald-600/90 text-white font-bold text-sm px-3 py-1.5 rounded-lg shadow-lg shadow-emerald-900/30">
            DevForum
          </div>
          <span className="font-display text-2xl font-semibold text-white">
            Cộng đồng
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div className="hidden md:flex items-center relative flex-1 max-w-md">
            <Search className="absolute left-4 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm chủ đề..."
              className="input-glass w-full pl-10 pr-4 py-2.5 rounded-full"
            />
          </div>

          <button
              type="button"
              onClick={() => setOpen(true)}
              className="btn-primary !bg-emerald-600 hover:!from-emerald-600 hover:!to-emerald-500 shrink-0">
              + Tạo chủ đề mới
          </button>
        </div>
      </header>

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
            onChange={(e) =>
              setNewPost({ ...newPost, title: e.target.value })
            }
            className="input-light !pl-4 w-full"
          />

          <textarea
            placeholder="Viết nội dung ..."
            value={newPost.content}
            onChange={(e) =>
              setNewPost({ ...newPost, content: e.target.value })
            }
            className="input-light !pl-4 w-full min-h-[120px] resize-y"
          />

          <button
            type="button"
            onClick={handleCreatePost}
            className="btn-primary w-full sm:w-auto !bg-emerald-600"
          >
            Đăng bài
          </button>
        </div>
      </Popup>
    </>  
  );
}