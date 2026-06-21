import { Heart, Github, Facebook, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-slate-950/50 backdrop-blur-md text-slate-400">
      <div className="page-shell py-10! grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
        {/* Brand */}
        <div>
          <h2 className="font-display text-lg font-bold text-white">
            Smart Recipe
          </h2>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            Hệ sinh thái dinh dưỡng & luyện tập thông minh giúp bạn làm chủ sức khỏe mỗi ngày.
          </p>
        </div>

        {/* Product */}
        <div>
          <h3 className="text-white text-sm font-semibold mb-3 uppercase tracking-wider">Sản phẩm</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer transition-colors">Thực đơn</li>
            <li className="hover:text-white cursor-pointer transition-colors">Workout</li>
            <li className="hover:text-white cursor-pointer transition-colors">Health Center</li>
            <li className="hover:text-white cursor-pointer transition-colors">Analytics</li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-white text-sm font-semibold mb-3 uppercase tracking-wider">Tài nguyên</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer transition-colors">Tài liệu</li>
            <li className="hover:text-white cursor-pointer transition-colors">Video</li>
            <li className="hover:text-white cursor-pointer transition-colors">Blog</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white text-sm font-semibold mb-3 uppercase tracking-wider">Liên hệ</h3>
          <div className="flex items-center gap-2.5 text-sm mb-4">
            <Mail className="w-4 h-4 text-brand-light shrink-0" />
            <span>support@smartrecipe.ai</span>
          </div>
          <div className="flex gap-3">
            <Github className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
            <Facebook className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
        © 2026 Smart Recipe — Made with
        <Heart className="w-3.5 h-3.5 text-brand-light fill-brand-light" />
      </div>
    </footer>
  );
}
