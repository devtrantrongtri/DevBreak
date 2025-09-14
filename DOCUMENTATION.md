<div align="center">
  <h1>DevBreak - Application Documentation</h1>
  <div>
    <a href="#english">English</a> | 
    <a href="#vietnamese">Tiếng Việt</a>
  </div>
</div>

---

<a name="english"></a>
# English Version

## Introduction

DevBreak is a full-stack application that implements a comprehensive user management system with dynamic menus and role-based access control (RBAC). This document provides an overview of the application structure and links to detailed documentation for each module.

## Quick Start

1. Clone the repository
2. Set up environment variables:
   ```bash
   cp app-server/.env.example app-server/.env
   cp app-ui/.env.example app-ui/.env
   ```
3. Start the application using Docker Compose:
   ```bash
   docker-compose up
   ```
4. Access the application at http://localhost:3000

## Core Modules

The application consists of several core modules:

1. **User Management**: Handles user accounts, profiles, and group assignments
2. **Permission System**: Implements role-based access control with hierarchical permissions
3. **Menu Management**: Provides dynamic menu generation based on user permissions
4. **Authentication**: Manages user authentication, authorization, and session handling

## Detailed Documentation

For detailed information about each module, please refer to:

- [Main Documentation](./docs/README.md)
- [Menu Management](./docs/menu-management.md)
- [Permission System](./docs/permission-system.md)
- [User Management](./docs/user-management.md)
- [Authentication](./docs/authentication.md)
- [Development Guidelines](./docs/development-guidelines.md)

## Key Features

- **Dynamic Menu System**: Menu items are linked to permissions and displayed based on user access rights
- **Hierarchical Permissions**: Parent-child permission structure with inheritance rules
- **Group-Based Access Control**: Users inherit permissions from their assigned groups
- **Responsive UI**: Modern interface built with Ant Design and Next.js
- **Secure API**: NestJS backend with comprehensive permission checks

## Architecture

- **Frontend**: Next.js, React, TypeScript, Ant Design
- **Backend**: NestJS, TypeORM, PostgreSQL
- **Authentication**: JWT-based authentication
- **Deployment**: Docker and Docker Compose

## Development

For development guidelines and best practices, see the [Development Guidelines](./docs/development-guidelines.md) document.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<a name="vietnamese"></a>
# Phiên bản Tiếng Việt

## Giới thiệu

DevBreak là một ứng dụng full-stack triển khai hệ thống quản lý người dùng toàn diện với menu động và kiểm soát truy cập dựa trên vai trò (RBAC). Tài liệu này cung cấp tổng quan về cấu trúc ứng dụng và liên kết đến tài liệu chi tiết cho từng module.

## Bắt đầu nhanh

1. Sao chép kho lưu trữ
2. Cấu hình biến môi trường:
   ```bash
   cp app-server/.env.example app-server/.env
   cp app-ui/.env.example app-ui/.env
   ```
3. Khởi động ứng dụng bằng Docker Compose:
   ```bash
   docker-compose up
   ```
4. Truy cập ứng dụng tại http://localhost:3000

## Các Module Chính

Ứng dụng bao gồm các module chính sau:

1. **Quản lý Người dùng**: Xử lý tài khoản người dùng, hồ sơ và phân công nhóm
2. **Hệ thống Phân quyền**: Triển khai kiểm soát truy cập dựa trên vai trò với quyền hạn phân cấp
3. **Quản lý Menu**: Cung cấp tạo menu động dựa trên quyền của người dùng
4. **Xác thực**: Quản lý xác thực người dùng, phân quyền và xử lý phiên làm việc

## Tài liệu Chi tiết

Để biết thêm thông tin chi tiết về từng module, vui lòng tham khảo:

- [Tài liệu Chính](./docs/README.md)
- [Quản lý Menu](./docs/menu-management.md)
- [Hệ thống Phân quyền](./docs/permission-system.md)
- [Quản lý Người dùng](./docs/user-management.md)
- [Xác thực](./docs/authentication.md)
- [Hướng dẫn Phát triển](./docs/development-guidelines.md)

## Tính năng Chính

- **Hệ thống Menu Động**: Các mục menu được liên kết với quyền và hiển thị dựa trên quyền truy cập của người dùng
- **Quyền Phân cấp**: Cấu trúc quyền cha-con với các quy tắc kế thừa
- **Kiểm soát Truy cập Dựa trên Nhóm**: Người dùng kế thừa quyền từ các nhóm được gán
- **Giao diện Người dùng Linh hoạt**: Giao diện hiện đại được xây dựng với Ant Design và Next.js
- **API Bảo mật**: Backend NestJS với kiểm tra quyền toàn diện

## Kiến trúc

- **Frontend**: Next.js, React, TypeScript, Ant Design
- **Backend**: NestJS, TypeORM, PostgreSQL
- **Xác thực**: Xác thực dựa trên JWT
- **Triển khai**: Docker và Docker Compose

## Phát triển

Để biết hướng dẫn và các thông lệ tốt nhất cho phát triển, xem tài liệu [Hướng dẫn Phát triển](./docs/development-guidelines.md).

## Giấy phép

Dự án này được cấp phép theo Giấy phép MIT - xem file LICENSE để biết chi tiết.
