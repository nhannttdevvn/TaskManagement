# Task Management System

Một ứng dụng quản lý công việc được phát triển bằng Django (Backend) và các mẫu giao diện HTML/Bootstrap (Frontend).

## Cấu trúc thư mục dự án

Sau khi dọn dẹp các tệp và thư mục trùng lặp, cấu trúc dự án hiện tại là:

*   **`backend/`**: Chứa toàn bộ mã nguồn Django (cấu hình dự án, ứng dụng `tasks`, middleware, APIs, v.v.).
*   **`frontend/`**: Chứa các tệp giao diện tĩnh (`static`) và các mẫu HTML (`templates`).
*   **`db.sqlite3`**: Cơ sở dữ liệu SQLite chính của ứng dụng (được lưu ở thư mục gốc).
*   **`tmds_env/`**: Môi trường ảo Python (Virtual Environment) cho dự án.

## Hướng dẫn chạy và debug dự án

Để chạy ứng dụng mà không gặp lỗi trùng lặp cấu hình, bạn cần thao tác trong thư mục `backend`:

1.  **Kích hoạt môi trường ảo (Virtual Environment):**
    ```powershell
    # Trên Windows (PowerShell):
    .\tmds_env\Scripts\activate
    ```

2.  **Di chuyển vào thư mục `backend`:**
    ```powershell
    cd backend
    ```

3.  **Chạy server phát triển (Development Server):**
    ```powershell
    python manage.py runserver
    ```

4.  **Chạy các lệnh quản trị khác (nếu cần):**
    *   Tạo migrations mới: `python manage.py makemigrations`
    *   Áp dụng các thay đổi cơ sở dữ liệu: `python manage.py migrate`
    *   Tạo tài khoản quản trị (Superuser): `python manage.py createsuperuser`
