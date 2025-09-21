Dung Antd de thiet ke cac component. va dung chung mang hinh 13'
A. UI Primitives (cơ bản, dùng mọi nơi)

AppCard

Dùng: khung nội dung chuẩn (tiêu đề + body), hỗ trợ scroll nội bộ.

Props: title?: string, extra?: ReactNode, maxHeight?: number (mặc định 440), scroll?: boolean.

Tác dụng: đồng bộ layout, tránh tràn trang (đặt overflowY: 'auto' khi scroll).

AppButton

Dùng: nút hành động chính/phụ.

Props: variant?: 'primary'|'secondary'|'ghost', size?: 'sm'|'md'|'lg', loading?: boolean.

Tác dụng: thống nhất màu, kích thước, trạng thái loading/disabled.

AppModal / AppDrawer

Dùng: hiển thị chi tiết task/AC, confirm action.

Props: open, onClose, title, footer?: ReactNode, width?.

Tác dụng: chuẩn hóa overlay, header/footer, thoát bằng ESC.

AppTable

Dùng: bảng dữ liệu (Daily Summary, danh sách task).

Props: columns, data, rowKey, pagination?, emptyText?.

Tác dụng: table nhất quán, kèm empty state & paginations chuẩn.

AppForm (+ FormField, TextInput, TextArea, Select, DatePicker)

Dùng: mọi form (Daily Input, tạo Task/AC).

Props: theo control, kèm rules cho validate.

Tác dụng: chuẩn hóa label, spacing, lỗi, i18n placeholder.

AppTag / AppBadge (tối giản)

Dùng: mức độ ưu tiên, trạng thái gọn nhẹ (hạn chế màu mè).

Props: label, tone?: 'neutral'|'info'|'warn'|'error'.

Tác dụng: nhấn nhá thông tin vừa đủ, không rối mắt.

AppTooltip

Dùng: hover hiển thị tên đầy đủ, mô tả ngắn.

Props: content, placement?.

Tác dụng: tiết kiệm diện tích, cải UX.

AppAvatar

Dùng: ảnh đại diện hoặc chữ cái đầu.

Props: name, src?, size?: 'sm'|'md'|'lg'.

Tác dụng: nhận diện người dùng nhanh trên thẻ task/daily.

AppEmpty / AppSkeleton / AppSpinner

Dùng: trạng thái trống, đang tải.

Props: message? (Empty), lines? (Skeleton).

Tác dụng: UX mượt trong load/thiếu dữ liệu.

AppToast / AppMessage

Dùng: thông báo ngắn gọn (thành công/lỗi).

Props: type: 'success'|'error'|'info', content, duration?.

Tác dụng: phản hồi người dùng tức thời và thống nhất.

B. Layout Blocks (tối ưu “1 màn hình, scroll trong card”)

GridAuto

Dùng: bố cục grid tự giãn (1–2 cột).

Props: minColWidth?: number (mặc định 360), gap?: number.

Tác dụng: linh hoạt trên desktop/mobile mà không vỡ layout.

SectionHeader

Dùng: tiêu đề khối + khu vực actions (button, filter).

Props: title, actions?: ReactNode.

Tác dụng: nhất quán tiêu đề khối trong AppCard.

ScrollableColumn

Dùng: cột có nhiều item (ví dụ 1 cột Kanban).

Props: maxHeight?: number (mặc định 420).

Tác dụng: auto-scroll nội bộ, luôn gọn trong khung.

C. Domain Components (chia sẻ theo nghiệp vụ)

UserAvatarName

Dùng: hiển thị avatar + tên, tooltip đầy đủ.

Props: userId | {name, avatarUrl?}, size?.

Tác dụng: gom hiển thị người dùng nhất quán (task card, daily row).

UserSelect / AssigneeSelect

Dùng: chọn người nhận task.

Props: projectId?, roleFilter?: ('DEV'|'QC'|'BC'|'PM')[], value, onChange.

Tác dụng: lọc người theo project/role, tránh sai assignee.

ProjectSelect

Dùng: chọn project để lọc Hub.

Props: value, onChange, options (fetch sẵn).

Tác dụng: đồng bộ bối cảnh project cho toàn trang.

RichTextEditor (light)

Dùng: mô tả task/daily (Quill/Tiptap giản lược).

Props: value, onChange, minHeight?, maxHeight?.

Tác dụng: nhập rich-text cơ bản, đã sanitize đầu vào.

AcceptanceChecklist

Dùng: AC của task (thêm/đánh dấu met).

Props: items: {id,text,isMet}[], onAdd(text), onToggle(id,isMet).

Tác dụng: thực thi “cổng vào Ready for QC”, tái sử dụng được ở Drawer/Modal.

DailyEditor

Dùng: form “Hôm qua / Hôm nay / Vướng mắc”.

Props: date, values, onSubmit, loading.

Tác dụng: chuẩn hóa UI daily, giảm lặp form.

DailySummaryTable

Dùng: bảng daily theo người (1 ngày + project).

Props: data: {user, yesterday, today, blockers}[].

Tác dụng: PM đọc nhanh, đồng nhất trình bày.

TaskCard

Dùng: thẻ task trong Kanban.

Props: {id, title, assignee, priority, hasAC, status}, onClick.

Tác dụng: item hiển thị thống nhất (ít màu, chủ yếu text + avatar).

KanbanColumn

Dùng: 1 cột Kanban (Todo/Process/Ready for QC/Done).

Props: title, statusKey, items, onDrop(taskId, nextStatus).

Tác dụng: tái sử dụng 4 lần cho 4 cột; tích hợp dnd-kit.

CountersStrip

Dùng: dải tổng số theo cột.

Props: {todo, process, ready, done}.

Tác dụng: PM nhìn tổng quan nhanh.

BlockersList

Dùng: list vướng mắc mới nhất (từ Daily).

Props: items: {user, text}[].

Tác dụng: highlight vấn đề cần PM xử lý trước.

ConfirmAction

Dùng: xác nhận thao tác quan trọng (ví dụ kéo vào “Ready for QC” khi thiếu AC).

Props: title, content, onConfirm.

Tác dụng: đảm bảo tuân thủ rule mà không khó dùng.

D. Utility Hooks (không phải component nhưng dùng chung nhiều nơi)

useI18n(): i18n Tiếng Việt mặc định; t(key) cho label thống nhất.

useApi(): wrap fetch, auto set baseURL/token, chuẩn hóa lỗi.

usePermission(): hasPermission(code) để ẩn/hiện nút + chặn thao tác.

useConfirm(): bật ConfirmAction nhanh từ bất kỳ chỗ nào.

useKanbanDnd(): logic dnd-kit chung (collision, rollback khi BE từ chối).

E. Quy ước sử dụng nhanh

Màn hình Collab Hub: bố cục bằng GridAuto; mỗi khối bọc trong AppCard (scroll = true nếu dài).

Board: 4 KanbanColumn; item là TaskCard; AC hiển thị trong AppDrawer + AcceptanceChecklist.

Daily: nhập bằng DailyEditor, xem bằng DailySummaryTable.

Tổng quan: CountersStrip + BlockersList.

Nhận diện: luôn dùng UserAvatarName trên task/daily.