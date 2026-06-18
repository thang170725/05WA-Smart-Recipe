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
import { UploadAvatarApi, UpdateProfile, UpdatePassword } from "../api/ProfileApi"
import { BASE_URL } from "../../../services/JsonApi";

/* ---------------- MOCK DATA ---------------- */
const mockUser = {
  id: "USR-001",
  username: "leduythang",
  role: "Admin",
  fullname: "Lê Đức Thắng",
  address: "Bắc Giang, Việt Nam",
  birth_date: "2000-05-20",
  phone: "0987654321",
  avatar_url: "",
  created_at: "2025-12-12",
  gender: "male",
  email: "thang@example.com",
  activity_level: "moderate",
  target_goal: "gain_muscle",
};

export default function ProfileForm() {
  const [editMode, setEditMode] = useState(false);
  const [editPassword, setEditPassword] = useState(false)

  // USESTATE
  const [profile, setProfile] = useState({
    id: "",
    username: "",
    role: "",
    fullname: "",
    address: "",
    phone: "",
    created_at: "",
    birth_date: "",
    password: "",
    avatar_url: "https://i.pravatar.cc/300",
    gender: "",
    email: "",
    activity_level: "",
    target_goal: "",
  });

  // ATTRIBUTE
  const { user, updateAvatar} = useAuth()

  useEffect(() => {
  if (user) {
    setProfile({
      ...user,
      avatar_url: user.avatar_url || "https://i.pravatar.cc/300",
    });
  } else {
    setProfile(mockUser);
  }
}, [user]);

  // API
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  const handleUpdate = async () => {
  try {
    if (editMode) {
      await UpdateProfile({
        fullname: profile.fullname,
        address: profile.address,
        email: profile.email,
        phone: profile.phone,
        activity_level: profile.activity_level,
        target_goal: profile.target_goal
      });

      setEditMode(false);
    }

    if (editPassword && profile.password.trim() !== "") {
      await UpdatePassword({
        password: profile.password
      });

      setProfile(prev => ({
        ...prev,
        password: ""
      }));

      setEditPassword(false);
    }

    alert("Cập nhật thành công!");
  } catch (err) {
    setEditMode(false)
    setEditPassword(false)
    console.log(err);
    
  }
};

  return (
    <div className="page-shell glass-panel text-slate-200 space-y-10">
      {/* ================= HEADER + AVATAR ================= */}
      <div className="grid grid-cols-3 items-center gap-10">

        {/* LEFT INFO */}
        <div className="space-y-4">
          <InfoPill icon={IdCard} label="User ID" value={profile.id} />
          <InfoPill icon={User} label="Tên tài khoản" value={profile.username} />
          <InfoPill icon={Shield} label="Vai trò" value={profile.role} />
        </div>

        {/* LEFT INFO */}
        <div className="space-y-4">
          <InfoPill icon={CalendarCheck} label="Ngày tạo" value={profile.created_at} />
          <InfoPill icon={Cake} label="Ngày sinh" value={profile.birth_date} />
          <InfoPill icon={VenusAndMars} label="Giới tính" value={profile.gender} />
        </div>

        {/* AVATAR */}
        <div className="relative group w-60 h-60 shrink-0 -right-20">
          <img
            src={profile.avatar_url || "https://i.pravatar.cc/300"}
            alt="avatar"
            className="w-60 h-60 rounded-full object-cover border-4 border-white/10 shadow-xl"
          />

          <label className="absolute bottom-0 left-0 w-full h-1/2 bg-black/60 
            rounded-b-full flex items-center justify-center text-sm
            opacity-0 group-hover:opacity-100 transition cursor-pointer">
            <Upload size={16} className="mr-2" />
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
      <Section title="Thông tin cơ bản" editMode={editMode} setEditMode={setEditMode} handleUpdate={handleUpdate}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputRow
            label="Tên đầy đủ"
            icon={User}
            name="fullname"
            value={profile.fullname}
            disabled={!editMode}
            onChange={handleChange}
          />

          <InputRow
            label="Địa chỉ"
            icon={MapPin}
            name="address"
            value={profile.address}
            disabled={!editMode}
            onChange={handleChange}
          />

          <InputRow
            label="Số điện thoại"
            icon={Phone}
            type="tel"
            name="phone"
            value={profile.phone}
            disabled={!editMode}
            onChange={handleChange}
          />

          <InputRow
            label="Email"
            icon={Mail}
            type="email"
            name="email"
            value={profile.email}
            disabled={!editMode}
            onChange={handleChange}
          />

          {/* Activity Level */}
          <SelectRow
            label="Mức vận động"
            icon={PersonStanding}
            name="activity_level"
            value={profile.activity_level}
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
            value={profile.target_goal}
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
          value={profile.password}
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
    <div className="bg-white/5 px-6 py-3 rounded-full border border-white/10 flex items-center gap-2 text-sm">
      <Icon size={16} />
      <span className="opacity-60">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}