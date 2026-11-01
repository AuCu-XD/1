# EduManage Pro - Hệ Thống Quản Lý Giáo Dục & Học Đường Toàn Diện

EduManage Pro là ứng dụng web quản trị giáo dục chuẩn hóa, phục vụ đầy đủ 4 nhóm đối tượng: **Ban Giám Hiệu (Admin)**, **Giáo Viên (Teacher)**, **Học Sinh (Student)** và **Phụ Huynh (Parent)**. Hệ thống giải quyết trọn vẹn bài toán vận hành trường học: quản lý lớp học, quản lý hồ sơ học sinh - giáo viên, sổ điểm điện tử với công thức tính ĐTB chuẩn Bộ Giáo Dục, điểm danh chuyên cần theo ngày, giao bài tập trực tuyến, bảng tin nhà trường và sao lưu cơ sở dữ liệu.

---

## 1. Giới Thiệu Dự Án

- **Mục tiêu:** Cung cấp nền tảng quản trị học đường số hóa đồng bộ, minh bạch, giảm thiểu 90% công tác sổ sách giấy tờ cho giáo viên và tạo cầu nối liên lạc tức thời giữa nhà trường với gia đình học sinh.
- **Đối tượng sử dụng:**
  1. **Admin / BGH:** Xem dashboard thống kê toàn trường, quản lý phân công lớp học, hồ sơ học sinh, giáo viên, sao lưu & khôi phục dữ liệu.
  2. **Giáo viên:** Quản lý lớp chủ nhiệm, điểm danh hàng ngày với 1 cú click, nhập sổ điểm theo từng cột (miệng, 15 phút, 1 tiết, giữa kỳ, cuối kỳ), giao và chấm bài tập.
  3. **Học sinh:** Theo dõi bảng điểm cá nhân, nhận và nộp bài tập về nhà trực tuyến, xem lịch sử điểm danh.
  4. **Phụ huynh:** Sổ liên lạc điện tử xem kết quả học tập của con em, tình hình chuyên cần, liên hệ trực tiếp với GVCN.

---

## 2. Công Nghệ Sử Dụng

- **Frontend Core:** React 19, TypeScript, Vite.
- **Styling & Design System:** Tailwind CSS v4, Font *Plus Jakarta Sans* và *JetBrains Mono* (tuân thủ nguyên tắc Zero-Pill Discipline và Tabular Numerals).
- **Icons:** Lucide React (không dùng emoji thay thế icon hệ thống).
- **Architecture:** Context API + LocalStorage Persistent Storage Service (hỗ trợ Import/Export CSV, JSON Backup, Factory Reset).
- **Backend Ready:** Đặc tả chi tiết PostgreSQL & Supabase Relational Schema với RLS (Row Level Security).

---

## 3. Cấu Trúc Thư Mục Source Code

```text
src/
├── types/
│   └── index.ts                 # Định nghĩa TypeScript Interface (User, Class, Student, Grade, ...)
├── data/
│   └── mockData.ts              # Bộ dữ liệu mẫu chuẩn thực tế cho trường học Việt Nam
├── services/
│   ├── storageService.ts        # Service quản lý lưu trữ LocalStorage, đồng bộ và reset
│   └── exportImportService.ts   # Xử lý xuất CSV (hỗ trợ tiếng Việt UTF-8 BOM) và import CSV có validation
├── utils/
│   └── gradeCalculations.ts     # Công thức tính điểm trung bình môn & xếp loại học lực theo thông tư
├── contexts/
│   └── AppContext.tsx           # Global State, RBAC, CRUD actions và Toast notifications
├── components/
│   ├── common/                  # Modal, ConfirmModal, Toast, EmptyState, MetricCard
│   ├── layout/                  # Sidebar đa vai trò, TopHeader (Top Bar Contract), RoleSwitcherModal
│   ├── dashboard/               # 4 Dashboard chuyên biệt cho Admin, Teacher, Student, Parent
│   ├── classes/                 # Danh sách lớp học, phân công GVCN, tạo/sửa lớp
│   ├── students/                # Hồ sơ học sinh, tìm kiếm, phân trang, import/export CSV, chi tiết học bạ
│   ├── teachers/                # Danh bạ giáo viên, chuyên môn bộ môn
│   ├── gradebook/               # Sổ điểm điện tử, ma trận điểm, tự động tính ĐTB môn
│   ├── attendance/              # Điểm danh ngày, chọn tất cả có mặt, cảnh báo nghỉ học
│   ├── assignments/             # Giao bài tập, nộp bài của học sinh, giáo viên chấm điểm & nhận xét
│   ├── announcements/           # Bản tin trường học, phân luồng đối tượng nhận tin, ghim bài
│   └── system/                  # Quản trị dữ liệu, backup JSON, khôi phục dữ liệu gốc, tài liệu SQL
└── App.tsx                      # Component điều hướng chính
```

---

## 4. Cài Đặt

Yêu cầu máy tính cài đặt Node.js phiên bản 18+ trở lên.

```bash
# Clone repository hoặc mở thư mục dự án
cd edumanage-pro

# Cài đặt dependencies
npm install
```

---

## 5. Chạy Môi Trường Development

```bash
npm run dev
```

Ứng dụng sẽ chạy tại địa chỉ: `http://localhost:3000` (hoặc cổng hiển thị trên Terminal).

---

## 6. Build Production

```bash
npm run build
```

Các file tối ưu hóa sẽ được xuất ra thư mục `dist/`.

---

## 7. Cấu Hình Biến Môi Trường (Environment Variables)

Tạo file `.env` dựa trên file `.env.example`:

```env
# URL ứng dụng
APP_URL="http://localhost:3000"

# Cấu hình Supabase (nếu kết nối cloud database)
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key-here"
```

---

## 8. Cấu Hình Supabase (PostgreSQL & Row Level Security)

Hệ thống đã có sẵn bản thiết kế cơ sở dữ liệu quan hệ hoàn chỉnh tại tab **"Dữ liệu & Cấu hình"** trong ứng dụng:

1. Đăng ký dự án tại [Supabase](https://supabase.com).
2. Vào **SQL Editor** trong bảng điều khiển Supabase.
3. Sao chép đoạn mã SQL DDL từ tab **"Dữ liệu & Cấu hình"** của EduManage Pro và chạy truy vấn:
   - Tạo bảng `classes`, `students`, `teachers`, `grades`, `attendance`, `assignments`, `announcements`.
   - Bật RLS và gán chính sách truy cập phân quyền.
4. Điền `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` vào file `.env`.

---

## 9. Hướng Dẫn Deploy

### Deploy lên Vercel:
1. Đẩy code lên GitHub repository.
2. Truy cập [Vercel](https://vercel.com) và chọn **Add New Project**.
3. Import repository, chọn framework **Vite**, thiết lập root directory.
4. Nhấn **Deploy**.

### Deploy lên Netlify:
1. Kéo thả thư mục `dist` sau khi chạy `npm run build` vào giao diện Netlify Drop.
2. Hoặc kết nối Git repository với Build command: `npm run build` và Publish directory: `dist`.

---

## 10. Tài Khoản Test (Có Sẵn Trong Giao Diện Đổi Vai Trò)

Nhấn vào nút **"Đổi vai trò"** ở góc trên cùng bên phải giao diện để chuyển đổi tức thì:

1. **Admin (Ban Giám Hiệu):**
   - Tên: *Thầy Nguyễn Minh Quang*
   - Mã: `BGH-01`
   - Quyền hạn: Quản trị toàn quyền, xem toàn bộ lớp học, học sinh, giáo viên, cấu hình dữ liệu.
2. **Giáo Viên (Bộ môn & GVCN):**
   - Tên: *Thầy Nguyễn Văn An*
   - Mã: `GV-101`
   - Quyền hạn: Chủ nhiệm lớp 10A1, dạy môn Toán, nhập điểm, điểm danh hàng ngày, giao bài và chấm bài.
3. **Học Sinh:**
   - Tên: *Em Trần Minh Khang*
   - Mã: `HS-2024-001` (Lớp 10A1)
   - Quyền hạn: Xem điểm cá nhân, xem bài tập được giao, nộp bài làm, theo dõi chuyên cần.
4. **Phụ Huynh:**
   - Tên: *Ông Trần Đức Hưng*
   - Mã: `PH-001` (Phụ huynh em Trần Minh Khang)
   - Quyền hạn: Xem kết quả rèn luyện của con, lịch sử đi học, thông tin liên lạc GVCN.

---

## 11. Ghi Chú Về Dữ Liệu

- Ứng dụng tích hợp bộ lưu trữ `StorageService` trên trình duyệt với dữ liệu khởi tạo phong phú, thực tế (5 lớp học, học sinh với thông tin phụ huynh thật, bảng điểm có tính toán trọng số, chuyên cần nhiều ngày).
- Mọi thao tác Thêm / Sửa / Xóa / Điểm danh / Nhập điểm / Giao bài / Nộp bài đều được lưu trữ trực tiếp và cập nhật giao diện ngay lập tức.
- Bạn có thể nhấn **"Khôi phục dữ liệu gốc"** bất cứ lúc nào trong tab **Dữ liệu & Cấu hình** để hoàn nguyên về trạng thái chuẩn ban đầu.
