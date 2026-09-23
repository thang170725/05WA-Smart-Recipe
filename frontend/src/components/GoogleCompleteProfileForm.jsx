import { useState } from "react"
import { CompleteGoogleRegisterApi } from "../features/account/api/LoginGoogleApi"
import { useAuth } from "../context/AuthContext"
import { CalcAge } from "../components/Datetime"
import { PhoneRegExp } from "../components/RegExp"
import Loading from "../components/Loading"

export function GoogleCompleteProfileForm({ registrationToken, email, name, onDone, onCancel }) {
  const { setUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    fullname: name || "",
    birth_date: "",
    age: 0,
    phone: "",
    gender: "",
    address: "",
    current_height: "",
    current_weight: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === "birth_date") {
      setForm(prev => ({ ...prev, birth_date: value, age: CalcAge(value) }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      if (!form.fullname.trim()) throw new Error("Tên không được để trống")
      if (!form.birth_date) throw new Error("Ngày sinh không được để trống")
      if (!PhoneRegExp().test(form.phone)) throw new Error("Số điện thoại không hợp lệ")
      if (!form.gender) throw new Error("Vui lòng chọn giới tính")
      if (!form.current_height || !form.current_weight) throw new Error("Vui lòng nhập chiều cao / cân nặng")

      const res = await CompleteGoogleRegisterApi({
        registration_token: registrationToken,
        fullname: form.fullname,
        birth_date: form.birth_date,
        phone: form.phone,
        gender: form.gender,
        address: form.address,
        current_height: Number(form.current_height),
        current_weight: Number(form.current_weight),
      })

      localStorage.setItem("token", res.access_token)
      setUser(res.user)
      onDone()
    } catch (err) {
      setError(err.message || "Đăng ký thất bại")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <p className="text-sm text-slate-500">
        Hoàn tất tạo tài khoản cho <b>{email}</b>
      </p>

      {/* fullname, birth_date, phone, gender, address, current_height, current_weight
          — layout giống RegisterForm, bỏ email + password */}

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onCancel} className="btn-ghost">Thoát</button>
        <button type="submit" disabled={loading} className="btn-primary py-2.5!">
          {loading ? <Loading /> : "Hoàn tất"}
        </button>
      </div>
    </form>
  )
}