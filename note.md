- [Blog giới thiệu về sản phẩm](#blog-giới-thiệu-về-sản-phẩm)
- [luồng hoạt động](#luồng-hoạt-động)
  - [chức năng đăng ký](#chức-năng-đăng-ký)
  - [chức năng update lên bản trả phí](#chức-năng-update-lên-bản-trả-phí)
  - [luồng chức năng đánh giá AI và dự phóng mục tiêu](#luồng-chức-năng-đánh-giá-ai-và-dự-phóng-mục-tiêu)
- [bổ sung thêm vào giao diện AI](#bổ-sung-thêm-vào-giao-diện-ai)
---
**Tên đề tài: Smart-Recipe: trợ lý ảo dinh dưỡng**
```bash
1. Đăng ký
    - tôi có thể đăng ký tài khoản mới bằng (tên đăng nhập, mật khẩu, số điện thoại)
2. Đăng nhập
    - tôi có thể đăng nhập bằng tài khoản mật khẩu vừa đăng ký.
    - tôi có thể đăng nhập nhanh bằng tài khoản email chỉ bằng một cú click.
3. Docs
    - tôi có thể đọc được tài liệu giới thiệu về website và giới thiệu về những chức năng hiện có của website
4. Quản lý thực đơn (menu)
    - tôi có thể CRUD cho món án trong 1 tuần
    - tôi có thể phân tích chi tiết thực đơn trong vòng 1 ngày bao gồm (lượng calo, dinh dưỡng bao gồm trong món ăn, gợi ý thực đơn tốt hơn, kết luận tổng thể) -> phần này là tích hợp AI hiện đang dùng langchain
5. Phân tích sức khỏe
    - tôi có thể nhập vào các thông số như cân nặng, chiều cao, mức vận động, v.v để AI phân tích chỉ số cơ thể gồm BMI, lượng mỡ, và kết luận ngắn gọn đồng thời đưa ra lời gợi ý
6. trợ lý AI -> AI có thể hiểu dữ liệu người dùng, tích hợp sâu vào hệ thống -> hiện đang dùng langchain
    - tôi có thể hỏi AI về thông tin cơ bản thay vì phải click chuột thì có thể prompt AI luôn bằng ngôn nữ người
    - tôi có thể bảo AI cập nhật thông tin cá nhân thay vì phải click chuột
```
# Blog giới thiệu về sản phẩm
```bash
Tiêu đề: Hành trình từ một sinh viên mệt mỏi đến trợ lý sức khỏe cá nhân: Câu chuyện đằng sau Smart RecipeXin chào bạn, tôi là Lê Đức Thắng — tác giả và là người phát triển Smart Recipe.  Trước khi Smart Recipe trở thành một hệ thống quản lý sức khỏe thông minh, nó vốn bắt đầu từ một cuộc khủng hoảng cá nhân của chính tôi vào năm 2023. Thời điểm đó, tôi là một sinh viên năm nhất sống trong guồng quay công việc và sinh hoạt đảo lộn. Sức khỏe của tôi sụt giảm nhanh chóng, cơ thể gầy gò, mệt mỏi. Tôi bắt đầu hoảng sợ và lao đi tìm giải pháp.  Tôi đã tải rất nhiều ứng dụng. Nhưng nhanh chóng, tôi nhận ra một bài toán muôn thuở: Hầu hết các ứng dụng đều ép chúng ta vào một khuôn khổ quá khắc nghiệt.  Nếu bạn muốn tăng cân hay giảm mỡ, họ bắt bạn tuân theo một thực đơn cố định, những bài tập rập khuôn. Nhưng thực tế thì sao? Chúng ta không thể ăn mãi một vài món khô khốc, cũng khó mà duy trì kỷ luật sắt đá khi cuộc sống luôn biến động. Sự gượng ép đó khiến đa số chúng ta bỏ cuộc giữa chừng.  Vì vậy, tôi tự hỏi: Tại sao không tạo ra một hệ thống xoay quanh con người, thay vì bắt con người gồng mình vừa vặn với hệ thống? Bạn hoàn toàn có quyền ăn những món mình thích. Còn việc điều chỉnh lộ trình luyện tập ra sao, cân bằng năng lượng thế nào để bạn vẫn khỏe mạnh và tự do — hãy để Công nghệ và AI lo.  Đó chính là lý do Smart Recipe ra đời: Lấy con người làm trung tâm, để bạn ăn uống thỏa thích và tập luyện trong niềm vui.  4 Trụ cột trải nghiệm tại Smart Recipe:Tài liệu & Kiến thức chuẩn xác: Bạn không cần đoán mò. Hệ thống cung cấp kiến thức dinh dưỡng thực tế — hiểu đúng về Protein, Calo, cách đọc chỉ số cơ thể để biến kiến thức thành kết quả.  Thực đơn & Trợ lý Dinh dưỡng AI: Thư viện món ăn phong phú giúp bạn theo dõi bữa ăn linh hoạt. Dữ liệu này là "nguyên liệu" để trợ lý AI thấu hiểu thói quen của bạn và đưa ra lời khuyên sát thực tế nhất.  Trung tâm Sức khỏe & Dự báo Machine Learning: Đánh giá các chỉ số cơ thể tự động. Mô hình Học máy (Machine Learning) sẽ dự đoán quỹ đạo cân nặng của bạn theo tuần dựa trên dữ liệu tập - ăn thực tế.  Lộ trình Luyện tập Tùy biến: Tự do cá nhân hóa bài tập từ Cardio đến Strength. AI sẽ tự động đánh giá và tinh chỉnh bài tập dựa trên lượng dinh dưỡng bạn đã nạp.  Diễn đàn Kết nối: Nơi bạn không cô đơn trên hành trình rèn luyện, dễ dàng chia sẻ công thức và truyền động lực cho nhau.  Smart Recipe không dùng các con số vô hồn. Chúng tôi kết hợp Backend tính toán y khoa chuẩn xác cùng Trợ lý AI phân tích hành vi để tạo nên sự đồng hành hoàn hảo.  "Sức khỏe không phải là đích đến, mà là một hành trình rèn luyện mỗi ngày." Cảm ơn bạn đã ở đây, và hãy để Smart Recipe đồng hành cùng bạn!  
```
# luồng hoạt động
## chức năng đăng ký
```bash
user nhập thông tin -> xác thực -> be -> xác thực -> db -> be -> fe -> (1) xác thực thành công
```
## chức năng update lên bản trả phí
```bash
┌────────────────────────────────────────┐
│    Người dùng Đăng nhập thành công      │
└───────────────────┬────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────┐
│ Mặc định: Giao diện gắn Badge "FREE"             │
│ Thấy Button "Nâng cấp Pro" (Góc Header/Profile)  │
└───────────────────┬──────────────────────────────┘
                    │
                    ▼ (User click "Nâng cấp Pro")
┌──────────────────────────────────────────────────┐
│ Popup / Modal: Bảng giá & So sánh Quyền lợi       │
│ [Free vs Pro (AI Co-pilot, Không giới hạn)]     │
└───────────────────┬──────────────────────────────┘
                    │
                    ▼ (User chọn gói Pro & Click "Thanh toán")
┌──────────────────────────────────────────────────┐
│ Popup Thanh toán (Checkout Modal - Mock Data)    │
│ - Mã QR Chuyển khoản (VietQR / Momo / ZaloPay)   │
│ - Mã giao dịch & Thông tin tài khoản mẫu        │
│ - Countdown Timer (15 phút)                      │
└───────────────────┬──────────────────────────────┘
                    │
                    ▼ (User click "Đã hoàn thành chuyển khoản")
┌──────────────────────────────────────────────────┐
│ Simulation / Giả lập xử lý                       │
│ - Toast Loading "Đang kiểm tra giao dịch..."     │
│ - Sau 2-3s: Bật Confetti + Notification thành công│
└───────────────────┬──────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────┐
│ Cập nhật State Frontend:                         │
│ - Badge đổi sang "PRO / VIP" (Màu Vàng / Gradient)│
│ - Mở khóa toàn bộ AI Feature Mock trên UI       │
└──────────────────────────────────────────────────┘
```
## luồng chức năng đánh giá AI và dự phóng mục tiêu
```bash
┌─────────────────────────────────────────────────────────┐
       │ Người dùng bấm "AI Đánh giá Sức khỏe" trên Sidebar      │
       │ (Nằm ngay trên phần "Ăn thông minh · Tập khoa học")     │
       └────────────────────────────┬────────────────────────────┘
                                    │
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │ TAB 1: FORM CUNG CẤP CHỈ SỐ NÂNG CAO (Input Data)       │
       │ - Lấy sẵn: Chiều cao, Cân nặng, Tuổi, Giới tính (DB)   │
       │ - Bổ sung: Số đo 3 vòng, Tạng người, Tần suất vận động, │
       │   Mục tiêu (Tăng/Giảm cân), Lượng mỡ ước tính (% Bodyfat)│
       └────────────────────────────┬────────────────────────────┘
                                    │
                                    ▼ (Bấm "AI Phân tích & Đánh giá")
       ┌─────────────────────────────────────────────────────────┐
       │ TAB 2: KẾT QUẢ ĐÁNH GIÁ SƠ BỘ & DỰ PHÓNG (Dashboard)   │
       │ 1. Bảng Chỉ Số Tổng Quan (BMI, BMR, TDEE, Bodyfat)      │
       │ 2. Đánh giá Tạng Người & Nhận xét Tổng quan từ AI       │
       │ 3. Mốc Thời Gian Thực Hiện (Timeline Milestones)         │
       │    (Ví dụ: Tuần 1 -> Tuần 4 -> Tuần 8 -> Tuần 12)       │
       │ 4. Hướng dẫn Lộ trình Dinh dưỡng & Tập luyện           │
       └─────────────────────────────────────────────────────────┘
```
# bổ sung thêm vào giao diện AI
```bash
AI chatbot hỗ trợ:
    - hỏi đáp trong lĩnh vực sức khỏe và luyện tập 
    - hỗ trợ tra cứu các thông tin cá nhân
    - hỗ trợ tương tác với dữ liệu người dùng trực tiếp
    - dựa vào dữ liệu của người dùng để tự vấn được chính xác với case study của user hơn
    - tự tổng hợp dữ liệu cá nhân để làm báo cáo hàng tuần
```