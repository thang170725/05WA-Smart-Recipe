// Mock Data cho hệ thống Smart-Recipe Admin Dashboard

// 1. Thống kê tổng quan Doanh thu & Tăng trưởng
export const mockAnalytics = {
    totalRevenue: 18450000, // 18.450.000 VNĐ
    revenueThisMonth: 5200000,
    activeUsers: 1240,
    proUsersCount: 186,
    totalAiRequests: 8920,
    aiCostsUSD: 14.85, // $14.85 chi phí LLM Token
    monthlyRevenueChart: [
      { month: "Tháng 4", revenue: 2100000, users: 450 },
      { month: "Tháng 5", revenue: 3400000, users: 680 },
      { month: "Tháng 6", revenue: 4200000, users: 890 },
      { month: "Tháng 7", revenue: 4800000, users: 1050 },
      { month: "Tháng 8", revenue: 5200000, users: 1240 },
    ],
  };
  
  // 2. Danh sách Người dùng (User Management)
  export const initialUsers = [
    {
      id: "USR-001",
      name: "Lê Đức Thắng",
      email: "thang.le@example.com",
      role: "PRO",
      status: "ACTIVE",
      joinedDate: "2026-05-10",
      height: 172,
      weight: 68,
      goal: "Tăng cơ giảm mỡ",
      proExpiredAt: "2027-05-10",
    },
    {
      id: "USR-002",
      name: "Nguyễn Văn An",
      email: "an.nguyen@example.com",
      role: "FREE",
      status: "ACTIVE",
      joinedDate: "2026-06-15",
      height: 168,
      weight: 75,
      goal: "Giảm cân",
      proExpiredAt: null,
    },
    {
      id: "USR-003",
      name: "Trần Thị Mai",
      email: "mai.tran@example.com",
      role: "PRO",
      status: "ACTIVE",
      joinedDate: "2026-07-01",
      height: 158,
      weight: 50,
      goal: "Duy trì vóc dáng",
      proExpiredAt: "2026-10-01",
    },
    {
      id: "USR-004",
      name: "Phạm Minh Hoàng",
      email: "hoang.pham@example.com",
      role: "FREE",
      status: "BANNED",
      joinedDate: "2026-08-02",
      height: 175,
      weight: 82,
      goal: "Tăng thể lực",
      proExpiredAt: null,
    },
  ];
  
  // 3. Yêu cầu Duyệt Gói Pro / Nạp tiền Chờ xử lý (Transactions)
  export const initialTransactions = [
    {
      id: "TX-9981",
      userId: "USR-002",
      userName: "Nguyễn Văn An",
      userEmail: "an.nguyen@example.com",
      planName: "Gói Pro 1 Năm",
      amount: 399000,
      transferCode: "SMARTRECIPE AN PRO1Y",
      paymentMethod: "MOMO / QR VietQR",
      createdAt: "2026-09-01 14:20",
      status: "PENDING", // PENDING, APPROVED, REJECTED
    },
    {
      id: "TX-9980",
      userId: "USR-003",
      userName: "Trần Thị Mai",
      userEmail: "mai.tran@example.com",
      planName: "Gói Pro 3 Tháng",
      amount: 149000,
      transferCode: "SMARTRECIPE MAI PRO3M",
      paymentMethod: "Chuyển khoản VCB",
      createdAt: "2026-08-30 09:15",
      status: "APPROVED",
    },
    {
      id: "TX-9979",
      userId: "USR-004",
      userName: "Phạm Minh Hoàng",
      userEmail: "hoang.pham@example.com",
      planName: "Gói Pro 1 Tháng",
      amount: 59000,
      transferCode: "HOANG NAP PRO",
      paymentMethod: "Chuyển khoản MBBank",
      createdAt: "2026-08-28 18:45",
      status: "REJECTED",
    },
  ];
  
  // 4. Cấu hình AI Node & System Prompts
  export const initialAiConfig = {
    activeNode1Model: "Qwen/Qwen2.5-7B-Instruct",
    activeNode2Model: "GPT-4o-mini",
    node1Prompt: `Bạn là AI Query Rewriter cho hệ thống Smart-Recipe. Nhiệm vụ của bạn là đọc câu hỏi ngắn gọn của người dùng, kết hợp với chỉ số sinh học (TDEE, Chiều cao, Cân nặng, Mục tiêu) để biến đổi thành một Prompt đầy đủ ngữ cảnh cho AI chuyên gia.`,
    node2Prompt: `Bạn là Bác sĩ & Chuyên gia Dinh dưỡng Thể hình. Hãy phân tích ngữ cảnh câu hỏi đã qua tối ưu để lập lộ trình ăn uống và bài tập chính xác theo calo mục tiêu.`,
    temperature: 0.7,
    maxTokens: 512,
  };