import HealthProfileForm from "../features/health-profile/components/HealthProfileForm"

export default function HealthProfile() {
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
    </div>
  );
}