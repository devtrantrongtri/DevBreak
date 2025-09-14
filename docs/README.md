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

This documentation provides a comprehensive guide to the DevBreak application, its architecture, modules, and how to use and extend it.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Module Documentation](#module-documentation)
4. [Getting Started](#getting-started)
5. [Development Guidelines](#development-guidelines)

## Project Overview

DevBreak is a full-stack application built with:

- **Frontend**: Next.js, React, TypeScript, Ant Design
- **Backend**: NestJS, TypeORM, PostgreSQL
- **Authentication**: JWT-based authentication

The core functionality revolves around:

- User Management (Users, Groups, Permissions)
- Dynamic Menu System (each menu linked to a permission)
- RBAC (Role-Based Access Control)

## Architecture

The application follows a microservice-like architecture with:

- **app-ui**: Next.js frontend application
- **app-server**: NestJS backend application
- **PostgreSQL database**: Data persistence

### Key Design Principles

1. **Permission Hierarchy**: Parent-child relationship in permissions where a child permission is only effective if all its ancestors are present
2. **Menu-Permission Binding**: Each menu is linked to exactly one permission
3. **Group-based Access Control**: Users have permissions through group membership (not direct assignment)
4. **API as the Real Gatekeeper**: Frontend only handles UI rendering based on permissions, but the API enforces all security rules

## Module Documentation

For detailed documentation on each module, please refer to:

- [User Management](./user-management.md)
- [Permission System](./permission-system.md)
- [Menu Management](./menu-management.md)
- [Authentication](./authentication.md)

## Getting Started

### Prerequisites

- Node.js (v18+)
- Docker and Docker Compose
- PostgreSQL (if running without Docker)

### Installation

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

### Development Setup

For local development:

1. Start the database:
   ```bash
   docker-compose up db
   ```
2. Start the backend:
   ```bash
   cd app-server
   npm install
   npm run start:dev
   ```
3. Start the frontend:
   ```bash
   cd app-ui
   npm install
   npm run dev
   ```

## Development Guidelines

When extending or modifying the application, please follow these guidelines:

1. **Permission Naming**: Use the format `resource.action` (e.g., `user.create`, `menu.update`)
2. **Component Organization**: Keep components modular and organized by feature
3. **API Security**: Always implement permission checks on API endpoints
4. **UI Permission Handling**: Use the AuthContext to check permissions before rendering UI elements

For more detailed guidelines, see [Development Guidelines](./development-guidelines.md)

---

<a name="vietnamese"></a>
# Phiên bản Tiếng Việt

Tài liệu này cung cấp hướng dẫn toàn diện về ứng dụng DevBreak, kiến trúc, các module và cách sử dụng và mở rộng nó.

## Mục lục

1. [Tổng quan Dự án](#project-overview)
2. [Kiến trúc](#architecture)
3. [Tài liệu Module](#module-documentation)
4. [Bắt đầu](#getting-started)
5. [Hướng dẫn Phát triển](#development-guidelines)

## Tổng quan Dự án

DevBreak là một ứng dụng full-stack được xây dựng với:

- **Frontend**: Next.js, React, TypeScript, Ant Design
- **Backend**: NestJS, TypeORM, PostgreSQL
- **Xác thực**: Xác thực dựa trên JWT

Các chức năng cốt lõi bao gồm:

- Quản lý Người dùng (Người dùng, Nhóm, Quyền)
- Hệ thống Menu Động (mỗi menu liên kết với một quyền)
- RBAC (Kiểm soát Truy cập Dựa trên Vai trò)

## Kiến trúc

Ứng dụng tuân theo kiến trúc giống microservice với:

- **app-ui**: Ứng dụng frontend Next.js
- **app-server**: Ứng dụng backend NestJS
- **Cơ sở dữ liệu PostgreSQL**: Lưu trữ dữ liệu

### Nguyên tắc Thiết kế Chính

1. **Phân cấp Quyền**: Mối quan hệ cha-con trong quyền, trong đó quyền con chỉ có hiệu lực nếu tất cả các quyền tổ tiên đều có mặt
2. **Liên kết Menu-Quyền**: Mỗi menu được liên kết với đúng một quyền
3. **Kiểm soát Truy cập Dựa trên Nhóm**: Người dùng có quyền thông qua thành viên nhóm (không gán trực tiếp)
4. **API là Hàng rào Thật**: Frontend chỉ xử lý hiển thị UI dựa trên quyền, nhưng API thực thi tất cả các quy tắc bảo mật

## Tài liệu Module

Để xem tài liệu chi tiết về từng module, vui lòng tham khảo:

- [Quản lý Người dùng](./user-management.md)
- [Hệ thống Phân quyền](./permission-system.md)
- [Quản lý Menu](./menu-management.md)
- [Xác thực](./authentication.md)

## Bắt đầu

### Yêu cầu tiên quyết

- Node.js (v18+)
- Docker và Docker Compose
- PostgreSQL (nếu chạy không dùng Docker)

### Cài đặt

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

### Cài đặt cho Phát triển

Để phát triển cục bộ:

1. Khởi động cơ sở dữ liệu:
   ```bash
   docker-compose up db
   ```
2. Khởi động backend:
   ```bash
   cd app-server
   npm install
   npm run start:dev
   ```
3. Khởi động frontend:
   ```bash
   cd app-ui
   npm install
   npm run dev
   ```

## Hướng dẫn Phát triển

Khi mở rộng hoặc chỉnh sửa ứng dụng, vui lòng tuân theo các hướng dẫn sau:

1. **Đặt tên Quyền**: Sử dụng định dạng `resource.action` (ví dụ: `user.create`, `menu.update`)
2. **Tổ chức Component**: Giữ các component theo module và được tổ chức theo tính năng
3. **Bảo mật API**: Luôn thực hiện kiểm tra quyền trên các endpoint API
4. **Xử lý Quyền trên UI**: Sử dụng AuthContext để kiểm tra quyền trước khi hiển thị các phần tử UI

Để xem hướng dẫn chi tiết hơn, xem [Hướng dẫn Phát triển](./development-guidelines.md)
