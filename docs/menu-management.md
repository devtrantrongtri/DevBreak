<div align="center">
  <h1>Menu Management Module</h1>
  <div>
    <a href="#english">English</a> | 
    <a href="#vietnamese">Tiếng Việt</a>
  </div>
</div>

---

<a name="english"></a>
# English Version

## Overview

The Menu Management module provides functionality to manage the application's dynamic menu system. Each menu item is linked to a specific permission, creating a direct relationship between navigation and user access rights.

## Core Features

- **View Menu Structure**: Display menus in both tree and table views
- **Update Menu Names**: Modify menu display names
- **Rebind Menu Permissions**: Change the permission associated with a menu
- **Delete Menus**: Remove menu items with confirmation
- **Add New Menus**: Create new menu items with customizable properties

## Components

### 1. MenuTable Component

Located at `app-ui/src/components/MenuManagement/MenuTable.tsx`

This component displays menus in a tabular format with the following features:
- Sortable columns for name, path, and permission
- Action buttons for editing, permission rebinding, and deletion
- Permission-based rendering of action buttons

**Props:**
```typescript
interface MenuTableProps {
  menus: MenuResponse[];
  permissions: PermissionResponse[];
  loading: boolean;
  canUpdateMenuName: boolean;
  canRebindPermission: boolean;
  canDeleteMenu: boolean;
  onEditMenu: (menu: MenuResponse) => void;
  onRebindPermission: (menu: MenuResponse) => void;
  onDeleteMenu: (menu: MenuResponse) => void;
}
```

### 2. MenuTree Component

Located at `app-ui/src/components/MenuManagement/MenuTree.tsx`

This component visualizes the menu hierarchy in a tree structure:
- Expandable/collapsible menu nodes
- Visual indicators for active/inactive menus
- Action buttons on each node for editing, permission rebinding, and deletion

**Props:**
```typescript
interface MenuTreeProps {
  menus: MenuResponse[];
  expandedKeys: React.Key[];
  onExpand: (keys: React.Key[]) => void;
  canUpdateMenuName: boolean;
  canRebindPermission: boolean;
  canDeleteMenu: boolean;
  onEditMenu: (menu: MenuResponse) => void;
  onRebindPermission: (menu: MenuResponse) => void;
  onDeleteMenu: (menu: MenuResponse) => void;
}
```

### 3. AddMenuModal Component

Located at `app-ui/src/components/MenuManagement/AddMenuModal.tsx`

Modal for creating new menu items with:
- Form fields for name, path, icon, description, etc.
- Icon dropdown with predefined icons
- Parent menu selection
- Permission binding

### 4. EditMenuModal Component

Located at `app-ui/src/components/MenuManagement/EditMenuModal.tsx`

Modal for updating menu names with:
- Pre-filled form with current menu data
- Validation for menu names

### 5. RebindPermissionModal Component

Located at `app-ui/src/components/MenuManagement/RebindPermissionModal.tsx`

Modal for changing the permission associated with a menu:
- Permission dropdown with searchable options
- Warning about the impact of changing permissions

### 6. DeleteMenuModal Component

Located at `app-ui/src/components/MenuManagement/DeleteMenuModal.tsx`

Confirmation modal for deleting menus:
- Displays menu details before deletion
- Warning about the impact of deletion
- Confirmation required to proceed

## API Integration

The Menu Management module interacts with the following API endpoints:

- `GET /menus`: Retrieve all menus (requires `system.menus.manage` permission)
- `PATCH /menus/:id/name`: Update menu name (requires `menu.updateName` permission)
- `PATCH /menus/:id/permission`: Change menu permission binding (requires `menu.rebindPermission` permission)
- `DELETE /menus/:id`: Delete a menu (requires `system.menus.manage` permission)
- `POST /menus`: Create a new menu (requires `system.menus.manage` permission)

## Usage Guidelines

### Adding a New Menu

When adding a new menu:
1. Ensure the path is unique and follows the pattern `/dashboard/[path]`
2. Select an appropriate parent menu if it's a submenu
3. Choose a permission that accurately reflects the access requirements
4. Set the correct order for proper positioning in the menu tree

### Changing Menu Permissions

When rebinding a menu's permission:
1. Be aware that this directly affects who can access the menu
2. Ensure the new permission is appropriate for the menu's functionality
3. Remember that parent menu permissions act as "master switches" for child menus

### Menu Hierarchy Rules

1. A menu item is only visible if the user has the permission for that menu AND all its ancestors
2. Parent menus with children should expand/collapse on click rather than navigate
3. The menu system follows a strict parent-child relationship that mirrors the permission hierarchy

## Troubleshooting

### Common Issues

1. **Menu not appearing in sidebar**: Check if the user has permissions for both the menu and all its parent menus
2. **Duplicate menus in tree view**: This can occur due to key conflicts; ensure each menu has a unique ID
3. **Parent menu navigation issues**: Parent menus with children should toggle expansion rather than navigate

### Known Limitations

1. The current implementation does not support drag-and-drop reordering of menus
2. Icon selection is limited to predefined Ant Design icons
3. Menu paths cannot be edited after creation to maintain system integrity

---

<a name="vietnamese"></a>
# Phiên bản Tiếng Việt

## Tổng quan

Module Quản lý Menu cung cấp chức năng quản lý hệ thống menu động của ứng dụng. Mỗi mục menu được liên kết với một quyền cụ thể, tạo mối quan hệ trực tiếp giữa điều hướng và quyền truy cập của người dùng.

## Tính năng Chính

- **Xem Cấu trúc Menu**: Hiển thị menu dưới dạng cây và bảng
- **Cập nhật Tên Menu**: Chỉnh sửa tên hiển thị của menu
- **Gán lại Quyền Menu**: Thay đổi quyền được gắn với menu
- **Xóa Menu**: Loại bỏ các mục menu với xác nhận
- **Thêm Menu Mới**: Tạo các mục menu mới với các thuộc tính tùy chỉnh

## Các Component

### 1. Component MenuTable

Vị trí tại `app-ui/src/components/MenuManagement/MenuTable.tsx`

Component này hiển thị menu dưới dạng bảng với các tính năng sau:
- Các cột có thể sắp xếp cho tên, đường dẫn và quyền
- Các nút hành động để chỉnh sửa, gán lại quyền và xóa
- Hiển thị các nút hành động dựa trên quyền

**Props:**
```typescript
interface MenuTableProps {
  menus: MenuResponse[];
  permissions: PermissionResponse[];
  loading: boolean;
  canUpdateMenuName: boolean;
  canRebindPermission: boolean;
  canDeleteMenu: boolean;
  onEditMenu: (menu: MenuResponse) => void;
  onRebindPermission: (menu: MenuResponse) => void;
  onDeleteMenu: (menu: MenuResponse) => void;
}
```

### 2. Component MenuTree

Vị trí tại `app-ui/src/components/MenuManagement/MenuTree.tsx`

Component này hiển thị cấu trúc phân cấp menu dưới dạng cây:
- Các nút menu có thể mở rộng/thu gọn
- Chỉ báo trực quan cho menu hoạt động/không hoạt động
- Các nút hành động trên mỗi nút để chỉnh sửa, gán lại quyền và xóa

**Props:**
```typescript
interface MenuTreeProps {
  menus: MenuResponse[];
  expandedKeys: React.Key[];
  onExpand: (keys: React.Key[]) => void;
  canUpdateMenuName: boolean;
  canRebindPermission: boolean;
  canDeleteMenu: boolean;
  onEditMenu: (menu: MenuResponse) => void;
  onRebindPermission: (menu: MenuResponse) => void;
  onDeleteMenu: (menu: MenuResponse) => void;
}
```

### 3. Component AddMenuModal

Vị trí tại `app-ui/src/components/MenuManagement/AddMenuModal.tsx`

Modal để tạo các mục menu mới với:
- Các trường form cho tên, đường dẫn, biểu tượng, mô tả, v.v.
- Dropdown biểu tượng với các biểu tượng định nghĩa trước
- Lựa chọn menu cha
- Gán quyền

### 4. Component EditMenuModal

Vị trí tại `app-ui/src/components/MenuManagement/EditMenuModal.tsx`

Modal để cập nhật tên menu với:
- Form đã điền sẵn với dữ liệu menu hiện tại
- Xác thực cho tên menu

### 5. Component RebindPermissionModal

Vị trí tại `app-ui/src/components/MenuManagement/RebindPermissionModal.tsx`

Modal để thay đổi quyền được gắn với menu:
- Dropdown quyền với các tùy chọn có thể tìm kiếm
- Cảnh báo về tác động của việc thay đổi quyền

### 6. Component DeleteMenuModal

Vị trí tại `app-ui/src/components/MenuManagement/DeleteMenuModal.tsx`

Modal xác nhận để xóa menu:
- Hiển thị chi tiết menu trước khi xóa
- Cảnh báo về tác động của việc xóa
- Yêu cầu xác nhận để tiếp tục

## Tích hợp API

Module Quản lý Menu tương tác với các endpoint API sau:

- `GET /menus`: Lấy tất cả menu (yêu cầu quyền `system.menus.manage`)
- `PATCH /menus/:id/name`: Cập nhật tên menu (yêu cầu quyền `menu.updateName`)
- `PATCH /menus/:id/permission`: Thay đổi gán quyền menu (yêu cầu quyền `menu.rebindPermission`)
- `DELETE /menus/:id`: Xóa menu (yêu cầu quyền `system.menus.manage`)
- `POST /menus`: Tạo menu mới (yêu cầu quyền `system.menus.manage`)

## Hướng dẫn Sử dụng

### Thêm Menu Mới

Khi thêm menu mới:
1. Đảm bảo đường dẫn là duy nhất và tuân theo mẫu `/dashboard/[path]`
2. Chọn menu cha phù hợp nếu đó là menu con
3. Chọn quyền phản ánh chính xác các yêu cầu truy cập
4. Đặt thứ tự chính xác để định vị trí phù hợp trong cây menu

### Thay đổi Quyền Menu

Khi gán lại quyền của menu:
1. Lưu ý rằng điều này ảnh hưởng trực tiếp đến việc ai có thể truy cập menu
2. Đảm bảo quyền mới phù hợp với chức năng của menu
3. Nhớ rằng quyền menu cha hoạt động như "công tắc tổng" cho các menu con

### Quy tắc Phân cấp Menu

1. Một mục menu chỉ hiển thị nếu người dùng có quyền cho menu đó VÀ tất cả các menu tổ tiên
2. Menu cha có các menu con nên mở rộng/thu gọn khi nhấp thay vì điều hướng
3. Hệ thống menu tuân theo mối quan hệ cha-con nghiêm ngặt phản ánh cấu trúc phân cấp quyền

## Xử lý Sự cố

### Vấn đề Thường gặp

1. **Menu không xuất hiện trong thanh bên**: Kiểm tra xem người dùng có quyền cho cả menu và tất cả các menu cha của nó không
2. **Menu trùng lặp trong chế độ xem cây**: Điều này có thể xảy ra do xung đột khóa; đảm bảo mỗi menu có ID duy nhất
3. **Vấn đề điều hướng menu cha**: Menu cha có các menu con nên chuyển đổi mở rộng thay vì điều hướng

### Hạn chế Đã biết

1. Cài đặt hiện tại không hỗ trợ kéo và thả để sắp xếp lại menu
2. Lựa chọn biểu tượng bị giới hạn ở các biểu tượng Ant Design định nghĩa trước
3. Đường dẫn menu không thể chỉnh sửa sau khi tạo để duy trì tính toàn vẹn của hệ thống
