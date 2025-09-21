Bạn là chuyên gia UI/UX. Tôi cần bạn thiết kế nhanh giao diện web/app flow theo  theo mô tả va cach code o du an nay
Nguyên tắc:
- UI **tối giản, rõ ràng**, tránh màu mè.
- Responsive mang hinh 13'.
- Mỗi block dài thì nằm trong **card** với `max-height` và scroll nội bộ.
- Ngôn ngữ hiển thị: **Tiếng Việt**.

Hãy thiết kế layout, bố cục, component chính (không cần chi tiết code). 
Mỗi màn hình trả về: 
- **Tên màn hình**
- **Mục tiêu** (người dùng sẽ làm gì)
- **Bố cục** (grid, cột, card)
- **Thành phần UI** (form, bảng, nút, input, avatar…)
- **Luồng chính** (người dùng thao tác gì, kết quả hiển thị gì)

---

## Giao diện cần thiết kế

1. **Trang Collab Hub (Dashboard)**
   - Mục tiêu: hiển thị tổng quan daily và task cho 1 dự án.
   - Bố cục: 1–2 cột responsive.
   - Thành phần UI:
     - Daily Input Card (form hôm qua/hôm nay/vướng mắc + nút lưu).
     - Daily Summary Card (bảng tổng hợp daily theo người).
     - Blockers Card (list vướng mắc).
     - Task Counters Card (4 ô số liệu: Todo, In Process, Ready for QC, Done).
   - Luồng chính: user nhập daily → lưu → PM xem summary + blockers + counters.

2. **Trang Project Management**
   - Mục tiêu: quản lý danh sách dự án, thêm/sửa thành viên.
   - Bố cục: bảng chính + modal form.
   - Thành phần UI:
     - Bảng dự án (tên, mô tả, trạng thái).
     - Nút “Tạo dự án”.
     - Modal form (tên, mô tả, trạng thái).
     - Bảng thành viên dự án (user, role).
   - Luồng chính: PM tạo/cập nhật project, thêm thành viên.

3. **Trang Task Board**
   - Mục tiêu: quản lý task theo 4 cột cố định.
   - Bố cục: 4 cột Kanban trong 1 màn hình.
   - Thành phần UI:
     - Cột Todo, In Process, Ready for QC, Done.
     - Card task: tiêu đề, assignee avatar, priority, due date.
     - Drawer hiển thị chi tiết task (description, AC checklist).
   - Luồng chính: kéo task giữa các cột → update status; mở card → xem/sửa AC.

---

Hãy tạo bản thiết kế UI sơ khai dựa trên mô tả trên.
