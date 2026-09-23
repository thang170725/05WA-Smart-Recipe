#!/bin/bash

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

cleanup() {
    echo ""
    echo "Stopping Selected Services..."

    [-n "$BACKEND_PID"] && kill $BACKEND_PID 2>/dev/null || true
    [-n "$FRONTEND_PID"] && kill $FRONTEND_PID 2>/dev/null || true
    [-n "$FRONTEND_ADMIN_PID"] && kill $FRONTEND_ADMIN_PID 2>/dev/null || true
    [-n "$MOBILE_PID"] && kill $MOBILE_PID 2>/dev/null || true

    [-n "$BACKEND_PID"] && wait $BACKEND_PID 2>/dev/null || true
    [-n "$FRONTEND_PID"] && wait $FRONTEND_PID 2>/dev/null || true
    [-n "$FRONTEND_ADMIN_PID"] && wait $FRONTEND_ADMIN_PID 2>/dev/null || true
    [-n "$MOBILE_PID"] && wait $MOBILE_PID 2>/dev/null || true

    echo "Done."
}

trap cleanup SIGINT SIGTERM EXIT

# Hiển thị vùng menu lựa chọn
echo "============================================================"
echo "============= SMART-RECIPE LAUNCHER ========================"
echo "============================================================"
echo "Chọn các dịch vụ muốn chạy (Ví dụ: gõ '1 2' hoặc '1 3 4')"
echo "  [1] Backend FastAPI (port 3651)"
echo "  [2] Frontend User Web"
echo "  [3] Frontend Admin Web"
echo "  [4] Mobile App (Expo)"
echo "  [a] Chạy TOÀN BỘ (All)"
echo "=========================================================="
read -p "Lựa chọn của bạn: " -a CHOICES

# Nếu nhập 'a' hoặc không nhập gì thì mặc định chọn tất cả
if [[ "${CHOICES[0]}" == "a" || "${CHOICES[0]}" == "A" || ${#CHOICES[@]} -eq 0 ]]; then
    CHOICES=(1 2 3 4)
fi

# Chuyển mảng lựa chọn thành chuỗi để dễ so sánh
SELECTED_STRING=" ${CHOICES[*]} "

echo ""
echo "--- Đang khởi động các dịch vụ đã chọn ---"

# 1. Backend
if [[ $SELECTED_STRING =~ " 1 " ]]; then
    echo "-> Starting Backend..."
    cd "$ROOT_DIR"
    uvicorn backend.app:app --reload --port 3651 &
    BACKEND_PID=$!
fi

# 2. Frontend User
if [[ $SELECTED_STRING =~ " 2 " ]]; then
    echo "-> Starting Frontend Web..."
    cd "$ROOT_DIR/frontend"
    npm run dev &
    FRONTEND_PID=$!
fi

# 3. Frontend Admin
if [[ $SELECTED_STRING =~ " 3 " ]]; then
    echo "-> Starting Frontend Admin..."
    cd "$ROOT_DIR/frontend_admin"
    npm run dev &
    FRONTEND_ADMIN_PID=$!
fi

# 4. Mobile
if [[ $SELECTED_STRING =~ " 4 " ]]; then
    echo "-> Starting Mobile App (Expo)..."
    cd "$ROOT_DIR/mobile"
    npm run start &
    MOBILE_PID=$!
fi

echo ""
echo "=========================================================="
echo " Dịch vụ đang chạy:"
[ -n "$BACKEND_PID" ]        && echo "  • Backend:        http://localhost:3651"
[ -n "$FRONTEND_PID" ]       && echo "  • Frontend Web:   http://localhost:5173"
[ -n "$FRONTEND_ADMIN_PID" ] && echo "  • Frontend Admin: http://localhost:5174"
[ -n "$MOBILE_PID" ]         && echo "  • Mobile App:     Expo dev server"
echo "=========================================================="
echo "Nhấn Ctrl+C để dừng tất cả dịch vụ đang chạy."

# Giữ script luôn lắng nghe trừ khi chưa chọn dịch vụ nào
if [ -n "$BACKEND_PID" ] || [ -n "$FRONTEND_PID" ] || [ -n "$FRONTEND_ADMIN_PID" ] || [ -n "$MOBILE_PID" ]; then
    wait
else
    echo "Không có dịch vụ nào được chọn để chạy."
fi

# Cách sử dụng:
# 1. Chạy file bash như bình thường: ./run.sh
# 2. Màn hình sẽ hiện menu chọn:
#   - Nếu muốn làm việc trên Admin + Backend, gõ: 1 3 rồi bấm Enter.
#   - Nếu làm Mobile + Backend, gõ: 1 4 rồi bấm Enter.
#   - Nếu làm Frontend Web + Backend, gõ: 1 2 rồi bấm Enter.
#   - Nếu muốn chạy hết, chỉ cần gõ a (hoặc ấn Enter thẳng).