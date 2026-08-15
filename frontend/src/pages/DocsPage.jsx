import { BMIDocs } from "../features/docs/components/BMIDocs";
import { FoodsDocs } from "../features/docs/components/FoodsDocs";
import { BookOpen } from "lucide-react";

export default function Docs() {
  return (
    <div className="page-shell space-y-16 sm:space-y-20 pb-24">
      {/* Hero Section của Docs */}
      <section className="hero-banner pt-12">
        <div className="mx-auto space-y-6 text-center">
          <span className="badge-brand inline-flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Thư Viện Dinh Dưỡng
          </span>

          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight">
            Hiểu cơ thể để <br />
            <span className="text-gradient-brand">làm chủ vóc dáng</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300/90 max-w-2xl mx-auto leading-relaxed">
            Dinh dưỡng không phải là nhịn ăn, mà là ăn uống có khoa học. 
            Tại đây, Smart Recipe cung cấp cho bạn nền tảng kiến thức chuẩn y khoa về 
            các chỉ số cơ thể (BMI, TDEE) và cách phân bổ nhóm chất (Macros) để tự xây dựng lộ trình riêng.
          </p>
        </div>
      </section>

      {/* Nội dung Docs */}
      <div className="space-y-24">
        <BMIDocs />
        <FoodsDocs />
      </div>
    </div>
  );
}