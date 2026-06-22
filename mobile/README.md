# Smart Recipe — Mobile App

Ứng dụng mobile React Native (Expo) đồng bộ UI/UX với website `frontend/`.

## Công nghệ

- **Expo SDK 56** + React Native
- **React Navigation** — Bottom tabs + Stack
- **API** — Dùng chung endpoints với `frontend/src/features/*/api/`
- **Design** — Glass morphism, màu brand `#c73e2e`, dark theme giống website

## Cấu trúc

```
mobile/
├── App.js                    # Entry point
├── src/
│   ├── api/                  # API layer (mirror frontend)
│   ├── components/           # UI components dùng chung
│   ├── context/              # AuthContext
│   ├── navigation/           # App / Auth / Tab navigators
│   ├── screens/              # Các màn hình
│   ├── services/             # JsonApi, FormDataApi, storage
│   ├── theme/                # Design tokens
│   └── utils/                # RegExp, Datetime
```

## Màn hình

| Tab / Màn hình | Tương ứng web |
|----------------|---------------|
| Trang chủ | `/` HomePage |
| Thực đơn | `/meals` MealsPage |
| Sức khỏe | `/health-center` + `/workout-roadmap` |
| Thống kê | `/dashboard` DashboardPage |
| Diễn đàn | `/platform` PlatformPage |
| Tài khoản | `/profile`, `/docs`, AI Chat |

## Chạy ứng dụng

```bash
# Cài dependencies
cd mobile && npm install

# Khởi động backend trước (port 3651)
# Từ thư mục gốc dự án

# Chạy Expo
npm start

# Android emulator
npm run android

# iOS simulator (macOS)
npm run ios
```

## Cấu hình API

Mặc định trỏ tới backend giống frontend:

| Platform | Base URL |
|----------|----------|
| Android emulator | `http://10.0.2.2:3651` |
| iOS simulator | `http://127.0.0.1:3651` |
| Thiết bị thật | Đặt biến môi trường `EXPO_PUBLIC_API_URL` |

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.100:3651 npm start
```

## Đồng bộ API với Frontend

API mobile nằm tại `mobile/src/api/` — cùng endpoints với `frontend/src/features/*/api/`.
Khi cập nhật API trên web, cập nhật tương ứng trong `mobile/src/api/`.

Layer HTTP (`JsonApi`, `FormDataApi`) dùng `AsyncStorage` thay cho `localStorage`.
