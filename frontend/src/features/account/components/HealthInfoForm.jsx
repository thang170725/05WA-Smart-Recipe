import Loading from "../../../components/Loading"
import { 
    Ruler, Weight, Activity, Target
} from "lucide-react"

export function HealthInfoForm({
  form,
  handleChange,
  onBack,
  onSubmit,
  loading,
  agreements,
  handleAgreementChange,
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-5">
        {/* CHIỀU CAO */}
        <div className="col-span-1">
          <label className="label-light">
            Chiều cao hiện tại (cm) <span className="text-red-700">(*)</span>
          </label>
          <div className="relative mt-1">
            <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              name="height"
              value={form.height}
              onChange={handleChange}
              type="number"
              placeholder="170"
              className="input-light pl-10"
            />
          </div>
        </div>

        {/* CÂN NẶNG */}
        <div className="col-span-1">
          <label className="label-light">
            Cân nặng (kg) <span className="text-red-700">(*)</span>
          </label>
          <div className="relative mt-1">
            <Weight className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              name="weight"
              value={form.weight}
              onChange={handleChange}
              type="number"
              placeholder="65"
              className="input-light pl-10"
            />
          </div>
        </div>

        {/* MỨC ĐỘ VẬN ĐỘNG */}
        <div className="col-span-2">
          <label className="label-light">
            Mức độ vận động <span className="text-red-700">(*)</span>
          </label>
          <div className="relative mt-1">
            <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select
              name="activity_level"
              value={form.activity_level}
              onChange={handleChange}
              className="input-light pl-10"
            >
              <option value="">Chọn mức độ vận động</option>
              <option value="sedentary">Ít vận động (Văn phòng, không tập)</option>
              <option value="light">Vận động nhẹ (1-3 ngày/tuần)</option>
              <option value="moderate">Vận động vừa (3-5 ngày/tuần)</option>
              <option value="active">Vận động nhiều (6-7 ngày/tuần)</option>
              <option value="very_active">Vận động rất nhiều (2 lần/ngày)</option>
            </select>
          </div>
        </div>

        {/* MỤC TIÊU */}
        <div className="col-span-2">
          <label className="label-light">
            Mục tiêu cá nhân <span className="text-red-700">(*)</span>
          </label>
          <div className="relative mt-1">
            <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select
              name="target_goal"
              value={form.target_goal}
              onChange={handleChange}
              className="input-light pl-10"
            >
              <option value="">Chọn mục tiêu</option>
              <option value="lose_weight">Giảm cân</option>
              <option value="maintenain">Duy trì vóc dáng</option>
              <option value="gain_muscle">Tăng cơ</option>
            </select>
          </div>
        </div>
      </div>

      {/* ===== phần chính sách nội bộ của website ==== */}
      <div className="space-y-3 pt-2">

  {/* Điều khoản sử dụng */}
  <label className="flex items-start gap-3 text-sm text-slate-600">
    <input
      type="checkbox"
      name="terms"
      checked={agreements.terms}
      onChange={handleAgreementChange}
      className="mt-1"
    />

    <span>
      Tôi đồng ý với{" "}
      <a
        href="/terms"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        Điều khoản sử dụng
      </a>
      {" "}của website.
      <span className="text-red-700"> *</span>
    </span>
  </label>

  {/* Chính sách bảo mật */}
  <label className="flex items-start gap-3 text-sm text-slate-600">
    <input
      type="checkbox"
      name="privacy"
      checked={agreements.privacy}
      onChange={handleAgreementChange}
      className="mt-1"
    />

    <span>
      Tôi đã đọc và đồng ý với{" "}
      <a
        href="/privacy"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        Chính sách bảo mật
      </a>
      {" "}của website.
      <span className="text-red-700"> *</span>
    </span>
  </label>

  {/* Miễn trừ trách nhiệm sức khỏe */}
  <label className="flex items-start gap-3 text-sm text-slate-600">
    <input
      type="checkbox"
      name="healthDisclaimer"
      checked={agreements.healthDisclaimer}
      onChange={handleAgreementChange}
      className="mt-1"
    />

    <span>
      Tôi hiểu rằng các thông tin và đề xuất về dinh dưỡng, luyện tập
      trên website chỉ nhằm mục đích tham khảo và không thay thế
      tư vấn của bác sĩ hoặc chuyên gia y tế.
    </span>
  </label>

  {/* Marketing - KHÔNG bắt buộc */}
  <label className="flex items-start gap-3 text-sm text-slate-600">
    <input
      type="checkbox"
      name="marketing"
      checked={agreements.marketing}
      onChange={handleAgreementChange}
      className="mt-1"
    />

    <span>
      Tôi đồng ý nhận thông tin về sản phẩm, chương trình ưu đãi
      và nội dung hữu ích từ website.
    </span>
  </label>

</div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="btn-ghost text-slate-600 hover:text-slate-800 hover:bg-slate-100"
        >
          Quay lại
        </button>

        <button
          type="button"
          onClick={onSubmit} // Chỉ gọi onSubmit, bỏ logic show Story ở đây
          disabled={loading}
          className="btn-primary py-2.5! disabled:opacity-60"
        >
          {loading ? <Loading /> : "Tạo tài khoản"}
        </button>
      </div>
    </div>
  )
}