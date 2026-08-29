import { useState, useEffect } from "react";
import {
  User,
  Shield,
  Phone,
  MapPin,
  Cake,
  Lock,
  Save,
  Pencil,
  X,
  Upload,
  IdCard,
  CalendarCheck,
  VenusAndMars,
  PersonStanding,
  Mail,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext"
import { UploadAvatarApi, UpdateProfileApi, UpdatePassword,
  GetAllProfile
 } from "../api/ProfileApi"
import { BASE_URL } from "../../../services/JsonApi";

/* ---------------- MOCK DATA ---------------- */

export default function ProfileForm({ devMode }) {
  const [editMode, setEditMode] = useState(false);
  const [editPassword, setEditPassword] = useState(false)

  // ============================================================
  // ==== chức năng lấy thông tin user + height, weight ========
  // ============================================================
  const { _ , updateAvatar} = useAuth()
  const [user, setUser] = useState({
    id: "",
    role: "",
    email: "",
    created_at: "",
    avatar_url: "",
    fullname: "",
    address: "",
    phone: "",
    birth_date: "",   
    gender: "",
    activity_level: "",
    target_goal: "",
    height: "",
    weight: "",
    password: ""
  })
  // API 
  useEffect(() => {
    const loadApi = async () => {
      const res = await GetAllProfile()

      setUser(res)
    }
    
    loadApi()
  }, [])

  // ============================================================
  // ==== chức năng update thông tin cơ bản user ========
  // ============================================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  // API update info
  const handleUpdate = async () => {
    try {
      if (editMode) {
        await UpdateProfileApi(devMode, user);

        setEditMode(false);
      }

      alert("Cập nhật thành công!");
    } catch (err) {
      setEditMode(false)
      setEditPassword(false)
      console.log(err);
    }
  };
  
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return

    console.log(file)

    // PREVIEW NOW
    const previewURL = URL.createObjectURL(file);
    setProfile((prev) => ({
      ...prev,
      avatar_url: previewURL,
    }));

    // SEND SERVER
    const formData = new FormData()
    formData.append("avatar_url", file)

    for (let [key, value] of formData.entries()) {
    console.log("FORM DATA:", key, value);
  }

    try {
      const res = await UploadAvatarApi(formData)

      updateAvatar(res.avatar_url)
    } catch (err) {
      console.log("upload failed: ", err)
    }
  };
  
  

  return (
    <div className="page-shell glass-panel text-slate-200 space-y-10 my-15">
      {/* ================= HEADER + AVATAR ================= */}
      <div className="w-[85%] flex justify-between items-center gap-10">

        {/* LEFT INFO */}
        <div className="space-y-4">
          <InfoPill icon={IdCard} label="User ID" value={user.id} />
          <InfoPill icon={User} label="Tên tài khoản (email)" value={user.email} />
        </div>

        <div className="space-y-4">
          <InfoPill icon={CalendarCheck} label="Ngày tạo" value={user.created_at} />
          <InfoPill icon={Shield} label="Vai trò" value={user.role} />
        </div>

        {/* AVATAR */}
        <div className="relative group w-50 h-60 shrink-0 -right-20">
          <img
            src={
              user?.avatar_url
                ? `${BASE_URL}${user.avatar_url}` 
                : "https://i.pravatar.cc/300"}
            alt="avatar"
            className="absolute top-5 w-50 h-50 rounded-full object-cover border-4 border-white/10 shadow-xl"
          />

          <label className="absolute bottom-5 left-0 w-full h-1/2 bg-black/60 
            rounded-b-full flex items-center justify-center text-sm
            opacity-0 group-hover:opacity-100 transition cursor-pointer">
            <Upload size={8} className="mr-2" />
            Tải lên
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleAvatarUpload}
            />
          </label>
        </div>
      </div>

      {/* ================= THÔNG TIN CƠ BẢN ================= */}
      <Section title="Thông tin cơ bản" editMode={editMode} setEditMode={setEditMode} handleUpdate={handleUpdate}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputRow
            label="Tên đầy đủ"
            icon={User}
            name="fullname"
            value={user?.fullname}
            disabled={!editMode}
            onChange={handleChange}
          />

          <InputRow
            label="Địa chỉ"
            icon={MapPin}
            name="address"
            value={user?.address}
            disabled={!editMode}
            onChange={handleChange}
          />

          <InputRow
            label="Số điện thoại"
            icon={Phone}
            type="tel"
            name="phone"
            value={user?.phone}
            disabled={!editMode}
            onChange={handleChange}
          />

          <InputRow
            label="Ngày sinh (MM/DD/YYYY)"
            icon={Mail}
            type="date"
            name="birth_date"
            value={user?.birth_date}
            disabled={!editMode}
            onChange={handleChange}
          />

          <SelectRow
            label="Giới tính"
            icon={PersonStanding}
            name="gender"
            value={user?.gender}
            disabled={!editMode}
            onChange={handleChange}
            options={[
              { value: "male", label: "Nam" },
              { value: "female", label: "Nữ" },
            ]}
          />

          <InputRow
            label="Cân nặng hiện tại (50)"
            icon={Mail}
            type="number"
            name="weight"
            value={user?.weight}
            disabled={!editMode}
            onChange={handleChange}
          />

          <InputRow
            label="Chiều cao hiện tại"
            icon={Mail}
            type="number"
            name="height"
            value={user?.height}
            disabled={!editMode}
            onChange={handleChange}
          />

          {/* Activity Level */}
          <SelectRow
            label="Mức vận động"
            icon={PersonStanding}
            name="activity_level"
            value={user?.activity_level}
            disabled={!editMode}
            onChange={handleChange}
            options={[
              { value: "sedentary", label: "Không vận động" },
              { value: "light", label: "Vận động nhẹ" },
              { value: "moderate", label: "Vận động thường xuyên" },
              { value: "active", label: "Vận động mạnh" },
              { value: "very_active", label: "Vận động viên" },
            ]}
          />

          {/* Target Goal */}
          <SelectRow
            label="Mục tiêu tập luyện"
            icon={User}
            name="target_goal"
            value={user?.target_goal}
            disabled={!editMode}
            onChange={handleChange}
            options={[
              { value: "lose_weight", label: "Giảm cân" },
              { value: "gain_muscle", label: "Tăng cơ" },
              { value: "maintenance", label: "Giữ dáng" },
            ]}
          />
        </div>
      </Section>

      {/* ================= ĐỔI MẬT KHẨU ================= */}
      <Section title="Đổi mật khẩu" editMode={editPassword} setEditMode={setEditPassword} handleUpdate={handleUpdate}>
        <InputRow
          label="Mật khẩu mới"
          icon={Lock}
          type="password"
          name="password"
          value={user.password}
          onChange={handleChange}  
          disabled={!editPassword}
        />
      </Section>
    </div>
  );
}

/* ================= COMPONENTS ================= */
function Section({ title, children, editMode, setEditMode, handleUpdate }) {
  return (
    <div className="border border-white/10 rounded-2xl p-6 bg-white/5 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{title}</h2>

        {setEditMode &&
          (!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg hover:bg-green-500 hover:text-black transition"
            >
              <Pencil size={16} />
              Chỉnh sửa
            </button>
          ) : (
            <div className="flex gap-2">
              <button 
                className="flex items-center gap-2 bg-green-500 px-4 py-2 rounded-lg text-black"
                onClick={handleUpdate}
              >
                <Save size={16} />
                Lưu
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="flex items-center gap-2 border border-white/20 px-4 py-2 rounded-lg"
              >
                <X size={16} />
                Hủy
              </button>
            </div>
          ))}
      </div>
      {children}
    </div>
  );
}

function InputRow({ label, icon: Icon, name, value, disabled, onChange, type = "text" }) {
  return (
    <div>
      <label className="text-sm opacity-70">{label}</label>
      <div
        className={`mt-1 flex items-center gap-2 px-3 py-2 rounded-xl border
        ${disabled ? "bg-black/40 border-white/10" : "bg-black/40 border-green-400"}`}
      >
        <Icon size={16} />
        <input
          type={type}
          name={name}
          value={value || ""}
          disabled={disabled}
          onChange={onChange}
          className="w-full bg-transparent outline-none text-sm"
        />
      </div>
    </div>
  );
}

function SelectRow({ label, icon: Icon, name, value, disabled, onChange, options }) {
  return (
    <div>
      <label className="text-sm opacity-70">{label}</label>
      <div
        className={`mt-1 flex items-center gap-2 px-3 py-2 rounded-xl border
        ${disabled ? "bg-black/40 border-white/10" : "bg-black/40 border-green-400"}`}
      >
        <Icon size={16} />
        <select
          name={name}
          value={value || ""}
          disabled={disabled}
          onChange={onChange}
          className="w-full bg-transparent outline-none text-sm"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="text-black">
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function InfoPill({ icon: Icon, label, value }) {
  return (
    <div className="bg-white/5 px-10 py-4 rounded-full border border-white/10 flex items-center gap-2 text-md">
      <Icon size={16} />
      <span className="opacity-60">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}