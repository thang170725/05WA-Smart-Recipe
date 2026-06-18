import HealthProfileForm from "../features/health-profile/components/HealthProfileForm"
import HealthCenter from "../features/health-profile/components/HealthCenter"
import {useMemo} from "react"
export default function HealthProfile() {
    // ===== MOCK USER =====
  const USER_DB = {
    fullname: "Nguyễn Văn A",
    height: 170,
    weight: 80,
    target_goal: "lose_weight",
  };

  const metrics = useMemo(() => {
    const bmi = (USER_DB.weight / ((USER_DB.height / 100) ** 2)).toFixed(1);
    const healthStatus =
      bmi < 18.5 ? "Thiếu cân" :
      bmi < 25 ? "Bình thường" :
      bmi < 30 ? "Thừa cân" : "Béo phì";

    return {
      bmi,
      tdee: 2400,
      healthStatus,
    };
  }, []);

  return (    
    <div className="page-shell space-y-8">
      <div className="space-y-2">
        <span className="badge-brand">Health Center</span>
        <h1 className="page-title">
          Trung tâm phân tích sức khỏe
        </h1>
        <p className="page-subtitle">
          Báo cáo cá nhân hóa dựa trên dữ liệu cơ thể của bạn
        </p>
      </div>

      <HealthProfileForm/>
      
            <HealthCenter user={USER_DB} metrics={metrics} />
        </div>
    );
}