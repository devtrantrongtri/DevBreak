ui
npm run dev


be
npm run start:dev
/api try seed



<div align="center">
  <h1>DevBreak</h1>
  <div>
    <a href="#english">English</a> | 
    <a href="#vietnamese">Tiếng Việt</a>
  </div>
</div>

---

<a name="english"></a>
# English Version

## Introduction

DevBreak is a full-stack application that implements a comprehensive user management system with dynamic menus and role-based access control (RBAC).

## Features

- **User Management**: Create, update, and manage user accounts
- **Role-Based Access Control**: Fine-grained permissions system
- **Dynamic Menus**: Automatically generated based on user permissions
- **Group Management**: Organize users and manage permissions by groups

## Getting Started

1. Clone the repository
2. Set up environment variables:
   ```bash
   cp app-server/.env.example app-server/.env
   cp app-ui/.env.example app-ui/.env
   ```
3. Start the application:
   ```bash
   docker-compose up
   ```
4. Access the application at http://localhost:3000

For detailed documentation, see [DOCUMENTATION.md](DOCUMENTATION.md)

---

<a name="vietnamese"></a>
# Phiên bản Tiếng Việt

## Giới thiệu

DevBreak là một ứng dụng full-stack quản lý người dùng với hệ thống menu động và kiểm soát truy cập dựa trên vai trò (RBAC).

## Tính năng chính

- **Quản lý người dùng**: Tạo, cập nhật và quản lý tài khoản
- **Phân quyền chi tiết**: Hệ thống quản lý quyền hạn linh hoạt
- **Menu động**: Tự động thay đổi theo quyền của người dùng
- **Quản lý nhóm**: Tổ chức người dùng và phân quyền theo nhóm

## Bắt đầu

1. Sao chép kho lưu trữ
2. Cấu hình biến môi trường:
   ```bash
   cp app-server/.env.example app-server/.env
   cp app-ui/.env.example app-ui/.env
   ```
3. Khởi động ứng dụng:
   ```bash
   docker-compose up
   ```
4. Truy cập ứng dụng tại http://localhost:3000

Xem tài liệu chi tiết tại [DOCUMENTATION.md](DOCUMENTATION.md)

## Core Modules

- **Menu Module**: Quản lý menu động
- **Group Module**: Quản lý nhóm người dùng
- **Permission Module**: Quản lý phân quyền
- **User Module**: Quản lý người dùng

* **2 parent menu** duy nhất:

  * **Dashboard** (tổng quan)
  * **Quản lý hệ thống** (chứa: Quản lý người dùng, Quản lý nhóm, Quản lý menu)
* **Mỗi menu = 1 permission**. **Menu cha** là công tắc tổng: nếu cha **không** có → **mọi menu con** coi như **không hiệu lực**.
* Chỉ **quản lý menu** theo nghĩa: **đổi tên** & **đổi quyền gắn với menu** (không đề cập sắp xếp, icon, v.v. ở v1).
* **User có nhiều Group**; Group có nhiều Permission; **Effective Permissions = union** quyền từ các group (sau khi áp quy tắc cha–con).
* **API là hàng rào thật**; FE chỉ ẩn/hiện cho UX.

---

## 2) Thực thể & Quan hệ (mô hình dữ liệu logic)

* **User**: tài khoản đăng nhập.
* **Group**: tập quyền theo đội/nhóm.
* **Permission**: quyền dạng `resource.action` (ở đây: “mỗi menu = 1 quyền” + một số quyền hạt mịn cho hành động).
* **Menu**: node cây điều hướng; **1–1 với Permission**.
* **Mapping**:

  * User ↔ Group (n–n)
  * Group ↔ Permission (n–n)
  * Menu ↔ Permission (1–1) *(mỗi menu gắn đúng 1 quyền)*

---

## 3) Taxonomy Permission (tối thiểu để chạy)

**A. Quyền nhìn/điều hướng (gắn với menu):**

* `dashboard.view` – xem Dashboard
* `system.manage` – xem parent “Quản lý hệ thống”

  * `system.users.manage` – xem menu “Quản lý người dùng”
  * `system.groups.manage` – xem menu “Quản lý nhóm”
  * `system.menus.manage` – xem menu “Quản lý menu”

> Quy tắc cha–con: muốn thấy **bất kỳ** menu con ⇒ **phải có** `system.manage`.

**B. Quyền hành động (bảo vệ thao tác trong trang):**

* Users: `user.create`, `user.update`, `user.delete`
* Groups: `group.create`, `group.update`, `group.delete`, `group.assignPermissions`
* Menus: `menu.updateName`, `menu.rebindPermission`
* (Tuỳ chọn v2) `audit.read` cho nhật ký

> Hành động cần **quyền menu tương ứng + quyền hành động**. Ví dụ tạo user cần **`system.users.manage`** + **`user.create`**.

---

## 4) Cấu trúc Menu (2 parent)

* **Dashboard** (`dashboard.view`)
* **Quản lý hệ thống** (`system.manage`)

  * **Quản lý người dùng** (`system.users.manage`)
  * **Quản lý nhóm** (`system.groups.manage`)
  * **Quản lý menu** (`system.menus.manage`)

**Hiển thị 1 item menu** khi:

1. User có **quyền của item đó**, **và**
2. User có **quyền của toàn bộ tổ tiên** (cha/ông…) của item.

---

## 5) Trang màn hình (pages)

### 5.1 Dashboard

* Thấy khi có `dashboard.view`.
* Nội dung: tổng số users, groups; hoạt động gần đây (nếu bật audit v2).

### 5.2 Quản lý người dùng

* Thấy khi có `system.manage` + `system.users.manage`.
* Chức năng:

  * Danh sách users; tìm/lọc cơ bản.
  * Tạo/Sửa/Xoá tùy quyền: `user.create`/`user.update`/`user.delete`.
  * Gán user vào group (nằm trong “Sửa”): yêu cầu `group.update`.

### 5.3 Quản lý nhóm

* Thấy khi có `system.manage` + `system.groups.manage`.
* Chức năng:

  * Danh sách groups; tạo/sửa/xoá: `group.create`/`group.update`/`group.delete`.
  * Gán **permissions** cho group: `group.assignPermissions`.
  * Thêm/bớt users trong group: `group.update`.

### 5.4 Quản lý menu

* Thấy khi có `system.manage` + `system.menus.manage`.
* Chức năng:

  * **Cập nhật tên menu**: `menu.updateName`.
  * **Đổi permission gắn với menu**: `menu.rebindPermission`.
    *Ghi chú: đổi permission của menu thay đổi **quyền điều hướng** nên cần xác nhận rõ ràng.*

---

## 6) Bảo vệ Route & Hành vi quyền

### 6.1 Kiểm tra điều hướng (menu)

* Backend trả về **cây menu đã lọc** theo quyền hiệu lực (áp quy tắc cha–con).
* FE chỉ render những node được phép (UX); **API vẫn kiểm quyền thật**.

### 6.2 Kiểm tra API (bắt buộc)

* **Nguyên tắc**: để truy cập tính năng thuộc một menu con X:

  1. Có quyền **menu X**
  2. Có quyền **tất cả cha của X** (ví dụ `system.manage`)
  3. Có **quyền hành động** nếu thao tác thay đổi dữ liệu (create/update/delete…)

* **Ví dụ**: gọi API tạo user
  → cần `system.users.manage` + `system.manage` + `user.create`.

---

## 7) Modules (chia theo nghiệp vụ, không code)

* **Auth Module**: đăng nhập/refresh, xuất thông tin user + effective permissions.
* **Users Module**: CRUD users; gán group.
* **Groups Module**: CRUD groups; gán/bỏ gán permissions cho group; quản users trong group.
* **Permissions Module**: liệt kê permission (tham chiếu); **không** cho tạo tuỳ tiện ở v1 (tránh loạn).
* **Menus Module**: liệt kê menu; **đổi tên**; **đổi permission gắn**.
* **RBAC Core**: tính **effective permissions**, áp quy tắc **cha–con**, cache ngắn hạn; middleware/guard kiểm quyền.
* **Audit Module (v2)**: ghi nhật ký thay đổi nhạy cảm (gán quyền, đổi binding menu, xóa user…).

---

## 8) API Design (chỉ liệt kê, không code)

> Quy tắc tiền kiểm: mọi endpoint thuộc menu nào → yêu cầu **quyền menu đó + quyền cha**. Nếu là thao tác dữ liệu → thêm quyền hành động.

**Auth**

* `POST /auth/login` → token + profile + effectivePermissions
* `GET /me` → profile + effectivePermissions
* `GET /menus/me` → cây menu đã lọc theo quyền (áp cha–con)

**Users**

* `GET /users` → yêu cầu `system.users.manage` + `system.manage` + `user.read` *(ngầm hiểu read)*
* `POST /users` → + `user.create`
* `GET /users/:id` → + `user.read`
* `PATCH /users/:id` → + `user.update`
* `DELETE /users/:id` → + `user.delete`
* `POST /users/:id/groups` (gán/bỏ) → + `group.update`

**Groups**

* `GET /groups` → `system.groups.manage` + `system.manage`
* `POST /groups` → + `group.create`
* `PATCH /groups/:id` → + `group.update`
* `DELETE /groups/:id` → + `group.delete`
* `POST /groups/:id/permissions` (assign/unassign) → + `group.assignPermissions`
* `POST /groups/:id/users` (add/remove) → + `group.update`

**Menus**

* `GET /menus` → `system.menus.manage` + `system.manage`
* `PATCH /menus/:id/name` → + `menu.updateName`
* `PATCH /menus/:id/permission` → + `menu.rebindPermission`

**(Tuỳ chọn) Audit**

* `GET /audit` → `audit.read`

---

## 9) DTO (mô tả nội dung, không code)

**Users**

* CreateUserDTO: email, displayName, password, isActive?
* UpdateUserDTO: displayName?, isActive?, password?
* AssignGroupsDTO: userId, groupIds\[]

**Groups**

* CreateGroupDTO: code, name, isActive?
* UpdateGroupDTO: name?, isActive?
* AssignPermissionsDTO: groupId, permissionCodes\[]
* UpsertGroupUsersDTO: groupId, addUserIds\[], removeUserIds\[]

**Menus**

* UpdateMenuNameDTO: menuId, newName
* RebindMenuPermissionDTO: menuId, permissionCode

**Auth**

* LoginDTO: email, password
* (trả) MeResponse: userProfile, effectivePermissions\[], menuTree\[]

---

## 10) Quy tắc xử lý “cha–con” (trọng yếu)

1. **Tính Effective Permissions (union từ các group)**
2. **Chuẩn hóa theo cây**: một quyền con **chỉ hợp lệ** nếu **tất cả tổ tiên** đều có mặt. Nếu thiếu cha → **loại bỏ con** khỏi effective.
3. **Hiển thị menu & cho phép API** chỉ dựa trên **effective đã chuẩn hóa**.

**Giao diện gán quyền (admin):**

* Cây quyền = cây menu.
* Check cha → tự check toàn bộ con.
* Uncheck cha → gỡ toàn bộ con.
* Check con khi cha chưa có → tự bật cha (indeterminate nếu cần).

---

## 11) Cache & Đồng bộ

* Cache **effectivePermissions** theo user (TTL 5–15 phút).
* Cache **menuTree** theo hash permissions (tuỳ).
* **Bắt buộc** xoá/invalid cache khi:

  * Gán/bỏ permission cho group
  * Sửa tên/đổi permission của menu
  * Thêm/bớt user vào group

---

## 12) Quy trình vận hành (Admin)

* Onboarding: tạo group → gán quyền (tick theo cây) → thêm user vào group → kiểm tra “menu như user”.
* Thường nhật: không gán quyền trực tiếp cho user (v1); review định kỳ matrix User × Group × Permission.
* Audit (v2): log mọi thao tác gán quyền, đổi binding menu, xóa người dùng.

---

## 13) KPI để chốt v1

* Thay đổi quyền → user thấy khác trong **< 1 phút**.
* Render menu p95 **< 100ms** sau login.
* 403 do **thiếu quyền cha** \~ **0** (FE đã ẩn đúng; BE vẫn chặn).
* Không có “quyền mồ côi” (con không có cha) trong báo cáo review.

---

## 14) Lộ trình triển khai

* **Sprint 1**: Auth + tính effective permissions + `/menus/me`; Users (list/create/update/delete), Groups (list/create/update/delete).
* **Sprint 2**: Assign users↔groups, Assign groups↔permissions (UI cây); Menus (đổi tên, đổi permission).
* **Sprint 3**: Route-guard chuẩn, cache/clear, “Preview as User”, báo cáo review cơ bản.
* **Sprint 4 (tuỳ)**: Audit logs, export CSV, chính sách deny trội, scope hạt mịn.

---

### One-liner kết luận

> **2 parent (“Dashboard”, “Quản lý hệ thống”), mỗi menu đúng 1 quyền; quyền của cha là công tắc tổng cho con; API kiểm quyền theo menu + cha + hành động; Group là nơi duy nhất gán quyền; cache ngắn hạn; quản trị bằng cây tick/untick.**
