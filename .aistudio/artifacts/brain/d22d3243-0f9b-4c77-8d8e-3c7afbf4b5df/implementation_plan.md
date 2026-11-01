# Kế Hoạch Triển Khai 4 Phương Thức Nhập Câu Hỏi Trong Ngân Hàng Câu Hỏi

Xây dựng modal / phân hệ thêm câu hỏi đa năng đạt chuẩn cao cấp trong **Ngân Hàng Câu Hỏi** với 4 tab phương thức nhập liệu toàn diện, tích hợp trí tuệ nhân tạo Gemini, xử lý tài liệu đa định dạng, nhận diện OCR ảnh hai cột đối chiếu, và biểu mẫu thủ công chuẩn xác 5 dạng câu hỏi theo đúng ảnh mẫu.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Căn cứ theo kết quả phản hồi câu hỏi làm rõ của bạn:
> - **Tab 1 (Import tài liệu)**: Cung cấp sẵn các **nút tải file mẫu Excel (.xlsx) và Word (.docx)** được định dạng chuẩn để giáo viên tải về máy, điền câu hỏi và tải lên lại nhanh chóng.
> - **Tab 2 (Trích xuất file bằng Gemini AI)**: Tự động phân tích toàn bộ giáo án, giáo trình, file PDF, PPTX và **trích xuất tự động toàn bộ câu hỏi** tìm thấy; nếu file trống chữ hoặc thông tin chưa chuẩn xác sẽ phản hồi thông báo bắt đầu bằng `"1 số file..."` hoặc `"đã có file..."`.
> - **Tab 3 (Trích xuất ảnh thông minh)**: Giao diện sau trích xuất được thiết kế **chia đôi màn hình (Side-by-side)**: bên trái hiển thị ảnh gốc người dùng đã tải lên, bên phải là khung soạn thảo văn bản trích xuất trực tiếp; nếu ảnh mờ/không rõ sẽ hiển thị cảnh báo với 2 lựa chọn (Đổi ảnh khác - chỉ cho chọn file ảnh, hoặc Tiếp tục trích xuất với ký tự mờ/lỗi được cảnh báo).
> - **Tab 4 (Thủ công theo ảnh mẫu)**: Hỗ trợ đúng 5 dạng câu hỏi (Pick One, Pick Many, Đúng/Sai, Điền khuyết, Tự luận có AI tra cứu và thẩm định ý đúng/sai).
> - **Phân quyền nghiêm ngặt**: Chỉ tài khoản **Giáo viên** và **Quản trị viên** mới được mở modal tạo/nhập câu hỏi.

---

### 1. Tổng Quan & Cấu Trúc 4 Tab Nhập Câu Hỏi

```
┌────────────────────────────────────────────────────────────────────────┐
│               MODAL NHẬP CÂU HỎI VÀO NGÂN HÀNG (4 TABS)                │
├───────────────┬────────────────────────────────────────────────────────┤
│ Tab 1         │ IMPORT TẬP TIN (Excel, Word .docx, CSV, TXT)          │
│               │ - Tải file mẫu chuẩn Excel / Word                      │
│               │ - Kéo thả tệp dữ liệu và xem trước danh sách câu hỏi   │
├───────────────┼────────────────────────────────────────────────────────┤
│ Tab 2         │ GEMINI AI XỬ LÝ GIÁO ÁN & TÀI LIỆU (PDF, PPT, DOC,...) │
│               │ - Tải giáo án, bài giảng trình chiếu, tài liệu chuyên đề│
│               │ - Tự động trích xuất toàn bộ câu hỏi sang ngân hàng    │
│               │ - Báo lỗi "1 số file..." hoặc "đã có file..." nếu lỗi  │
├───────────────┼────────────────────────────────────────────────────────┤
│ Tab 3         │ SIÊU TIỆN LỢI - TRÍCH XUẤT TỪ ẢNH (OCR AI)             │
│               │ - Tải ảnh chụp đề thi/sách giáo khoa                   │
│               │ - Cảnh báo ảnh mờ kèm 2 lựa chọn: Đổi ảnh / Tiếp tục   │
│               │ - Chia đôi màn hình: Ảnh gốc (trái) - Soạn thảo (phải) │
├───────────────┼────────────────────────────────────────────────────────┤
│ Tab 4         │ THỦ CÔNG (Giao diện chuẩn xác 100% theo ảnh đính kèm)  │
│               │ 1. Trắc nghiệm - Pick One (1 đáp án đúng)              │
│               │ 2. Nhiều đáp án - Pick Many (Chọn nhiều hộp kiểm A,B,C)│
│               │ 3. Đúng / Sai (True / False)                           │
│               │ 4. Điền khuyết (Nhập từ còn thiếu trong câu)           │
│               │ 5. Tự luận (AI tra cứu thẩm định câu trả lời học sinh) │
└───────────────┴────────────────────────────────────────────────────────┘
```

---

### 2. Chi Tiết Trải Nghiệm Người Dùng (UX) & Thiết Kế Giao Diện

#### Tab 1: Nhập Bằng Cách Import (Excel, Word...)
- **Tải file mẫu**: Có 2 nút tải file mẫu nhanh:
  - `Tải file mẫu Excel (.xlsx)`: Chứa các cột Môn, Khối, Dạng câu hỏi, Mức độ, Nội dung, Đáp án A-B-C-D, Đáp án đúng, Lời giải.
  - `Tải file mẫu Word (.docx)`: Trình bày theo mẫu đề thi chuẩn của Bộ GD&ĐT.
- **Khu vực kéo thả**: Nhận diện các định dạng `.xlsx`, `.xls`, `.docx`, `.doc`, `.csv`, `.txt`.
- **Xem trước & Xác nhận**: Sau khi chọn file, hệ thống phân tích và hiển thị danh sách các câu hỏi đã bóc tách được để giáo viên duyệt trước khi lưu vào ngân hàng.

#### Tab 2: Trích Xuất Bằng Gemini AI Từ Giáo Án / Giáo Trình (PDF, PPT, Tài liệu)
- **Tải tệp**: Hỗ trợ đính kèm bài giảng PowerPoint (`.pptx`, `.ppt`), file giáo án Word (`.docx`), file tài liệu chuyên đề (`.pdf`), hoặc văn bản tổng hợp.
- **Xử lý AI thông minh**:
  - Gemini AI phân tích cấu trúc bài học, các đề mục kiến thức, các ví dụ minh họa và tự động sinh ra toàn bộ các câu hỏi trắc nghiệm và vận dụng tương ứng.
  - **Cơ chế phản hồi khi file lỗi/thiếu chữ**: Nếu tài liệu đính kèm là tệp rỗng, ảnh scan không có text layer, hoặc nội dung thông tin chưa chính xác/chưa hợp lệ, AI sẽ hiển thị thông báo với cấu trúc mở đầu chuẩn mực:
    - `"1 số file đính kèm hiện không phát hiện được nội dung văn bản hợp lệ hoặc dữ liệu câu hỏi chưa đầy đủ..."`
    - `"đã có file được tải lên nhưng thiếu nội dung học thuật chính xác để trích xuất câu hỏi..."`

#### Tab 3: Siêu Tiện Lợi - Trích Xuất Ảnh Chụp (OCR & Soạn Thảo Đối Chiếu)
- **Tải ảnh**: Chấp nhận các tệp hình ảnh `.jpg`, `.png`, `.webp`, `.jpeg`.
- **Kiểm tra độ nét của ảnh (Blur/Clarity Detection)**:
  - Nếu ảnh bị mờ, rung, độ tương phản kém hoặc chữ khó nhận diện:
    - Bật ngay cửa sổ thông báo: `"Văn bản không rõ hoặc chưa hợp lệ để trích xuất, vui lòng đổi ảnh khác rõ nét văn bản hơn hoặc tiếp tục"`.
    - Lựa chọn 1: **Đổi ảnh khác** -> Mở hộp thoại chọn tệp của hệ điều hành và **CHỈ cho phép chọn file ảnh** (`accept="image/*"`).
    - Lựa chọn 2: **Tiếp tục** -> Hệ thống tiến hành trích xuất văn bản từ ảnh đó nhưng các đoạn bị mờ sẽ được đánh dấu `[...]` hoặc ký tự lỗi mô phỏng để người dùng nhận diện và sửa.
- **Giao diện chia đôi màn hình (Side-by-side Layout)**:
  - **Cột bên trái (50%)**: Hiển thị ảnh gốc với khả năng phóng to, thu nhỏ để giáo viên dễ quan sát từng dòng chữ.
  - **Cột bên phải (50%)**: Khung soạn thảo văn bản trích xuất trực tiếp, chia theo từng câu hỏi (Nội dung, các lựa chọn A, B, C, D, đáp án đúng) cho phép chỉnh sửa từng ký tự.

#### Tab 4: Thủ Công (Chuẩn Xác 100% Theo Ảnh Thiết Kế Đính Kèm)
Mô phỏng chính xác giao diện Dark theme đẳng cấp từ ảnh người dùng:
- **Hàng 1**: Môn học dropdown (`Toán học`, `Vật lý`, `Hóa học`, `Sinh học`, `Ngữ văn`, `Tiếng Anh`...) + Khối lớp dropdown (`Khối 10`, `Khối 11`, `Khối 12`).
- **Hàng 2**:
  - **Dạng câu hỏi** (Dropdown với 5 loại):
    1. `Trắc nghiệm - Pick One (1 đáp án)`: Chỉ cho phép chọn duy nhất 1 đáp án đúng (Radio).
    2. `Nhiều đáp án - Pick Many`: Cho phép bấm chọn nhiều đáp án đúng cùng lúc với các nút hộp kiểm `[✓ A]`, `[✓ B]`, `[✓ C]`, `[✓ D]` viền xanh lá chuẩn ảnh mẫu!
    3. `Đúng / Sai`: Chuyển 4 lựa chọn thành 2 trạng thái `True (Đúng)` và `False (Sai)`.
    4. `Điền khuyết`: Cho phép người dùng nhập từ/cụm từ cần điền vào chỗ trống `[...]`.
    5. `Tự luận`: Nhập câu hỏi tự luận và đáp án gợi ý. Tích hợp AI thẩm định: Khi nhập câu trả lời mẫu, AI sẽ tra cứu và thẩm định ý nghĩa; nếu đáp án có ý đúng sẽ hiện trạng thái `Correct (Đúng)`, ngược lại là `False (Sai)`; nếu thông tin câu hỏi và kết quả tra cứu chưa rõ ràng hoặc mơ hồ, hệ thống báo ngay cảnh báo đỏ trong form trước khi lưu.
  - **Mức độ** dropdown: `Nhận biết`, `Thông hiểu`, `Vận dụng`, `Vận dụng cao`.
  - **Chủ đề bài học** input: Ví dụ: *Hàm số bậc hai*.
- **Hàng 3**: Nội dung câu hỏi (hỗ trợ LaTeX/công thức toán học): Textarea rộng rãi.
- **Hàng 4**: 4 ô nhập Đáp án A, Đáp án B, Đáp án C, Đáp án D (khi ở dạng Pick One / Pick Many).
- **Hàng 5**: Khu vực chọn đáp án đúng:
  - Nếu Pick Many: Hiển thị 4 nút checkbox bo tròn viền xanh lục `A`, `B`, `C`, `D` chọn đa điểm chuẩn như khung khoanh đỏ của bạn.
  - Nếu Pick One: Nút chọn 1 phương án duy nhất.
  - Nếu Đúng / Sai: Nút chuyển True / False.
  - Nếu Điền khuyết: Ô nhập đáp án chính xác hoặc từ đồng nghĩa.
  - Nếu Tự luận: Ô nhập barem điểm và nút "AI Tra Cứu & Thẩm Định Tính Hợp Lý".
- **Hàng 6**: Lời giải chi tiết textarea.

---

### 3. Kiến Trúc Kỹ Thuật & Cấu Trúc Dữ Liệu Mở Rộng

Mở rộng `QuestionItem` trong `QuestionBankModule.tsx`:

```typescript
export type QuestionType =
  | 'pick_one'     // Trắc nghiệm - Pick One (1 đáp án)
  | 'pick_many'    // Nhiều đáp án - Pick Many
  | 'true_false'   // Đúng / Sai
  | 'fill_blank'   // Điền khuyết
  | 'essay';       // Tự luận (AI Thẩm định)

export interface QuestionItem {
  id: string;
  subject: string;
  grade: number;
  type: QuestionType;
  difficulty: 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';
  chapter: string;
  content: string;
  options: string[];
  correctAnswers: number[]; // Mảng các đáp án đúng cho Pick Many hoặc [index] cho Pick One
  correctTextAnswer?: string; // Dành cho Điền khuyết hoặc Tự luận
  explanation: string;
  aiVerificationStatus?: 'verified' | 'uncertain' | 'invalid';
  aiFeedback?: string;
}
```

---

### 4. Kế Hoạch Triển Khai Chi Tiết

1. **Khởi tạo Component Modal Thêm Câu Hỏi Mới Đa Năng (`AddQuestionModal.tsx`)**:
   - Xây dựng thanh điều hướng 4 Tab trực quan: `Import tệp tin`, `Gemini AI trích xuất`, `Trích xuất từ ảnh`, `Tạo thủ công`.
2. **Triển khai Tab 1 (Import)**:
   - Viết hàm tạo file mẫu Excel (.xlsx) và Word (.docx) tải về tự động qua Blob.
   - Trình xử lý đọc tệp tin tải lên và phân tích câu hỏi hàng loạt.
3. **Triển khai Tab 2 (Gemini AI xử lý file giáo án/PDF/PPT)**:
   - Trình tải file đa định dạng (`.pdf`, `.pptx`, `.docx`).
   - Tích hợp hàm mô phỏng trích xuất câu hỏi học thuật từ văn bản bài giảng.
   - Xử lý thông báo lỗi chuẩn câu từ `"1 số file..."` và `"đã có file..."` khi file rỗng/lỗi chữ.
4. **Triển khai Tab 3 (Trích xuất ảnh OCR)**:
   - Trình tải ảnh chỉ chấp nhận ảnh.
   - Bộ lọc phát hiện ảnh mờ/kém nét với popup cảnh báo 2 nút bấm: `Đổi ảnh khác` (chỉ mở file ảnh) và `Tiếp tục` (trích xuất với ký tự lỗi hiển thị).
   - Thiết kế giao diện chia đôi 50/50: Bên trái xem ảnh gốc, bên phải trình chỉnh sửa văn bản.
5. **Triển khai Tab 4 (Thủ công chuẩn 100% ảnh người dùng gửi)**:
   - Tái hiện chính xác dropdown dạng câu hỏi (5 dạng) và các nút đáp án đúng xanh lục đa chọn `Pick Many` như ảnh đính kèm.
   - Tích hợp chế độ AI thẩm định câu hỏi tự luận trước khi lưu vào ngân hàng.
6. **Kiểm thử và Hoàn thiện**:
   - Xác minh phân quyền (Chỉ Giáo viên & Admin mới mở được modal này).
   - Chạy `lint_applet` và `compile_applet` đảm bảo 100% không có lỗi.
