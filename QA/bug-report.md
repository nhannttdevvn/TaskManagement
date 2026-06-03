# Bug Report - TaskManagement

Tester: Huyền  
Environment:
- URL: https://taskmanagement-production-2cc5.up.railway.app/
- Browser: Chrome
- Device: MacBook
- Test type: Manual UI Testing

---

## BUG-001: Dashboard không hiển thị card/project/task/chart trong phần Analytics

Environment:
- Page: Dashboard
- Browser: Chrome
- Device: MacBook
- Account/Role: Current user

Steps to reproduce:
1. Truy cập trang login.
2. Đăng nhập bằng tài khoản hợp lệ.
3. Quan sát màn hình Dashboard.
4. Kiểm tra khu vực Analytics/card/project/task/chart.

Actual result:
- Dashboard load thành công.
- Sidebar và header hiển thị đúng.
- Tuy nhiên các card/project/task/chart không hiển thị ở phần Analytics.
- Không có lỗi trắng màn hình.
- Không thấy lỗi đỏ nghiêm trọng trong Console.

Expected result:
- Dashboard phải hiển thị đầy đủ dữ liệu tổng quan.
- Các card/project/task/chart phải xuất hiện đúng vị trí.
- Không được để trống khu vực Analytics nếu hệ thống có dữ liệu.

Severity: High  
Priority: High  

Screenshot/Video:
- Attached if available.

---

## BUG-002: Workspace bị tạo trùng và biến mất sau khi chuyển tab

Environment:
- Page: Workspace
- Browser: Chrome
- Device: MacBook
- Account/Role: Current user

Steps to reproduce:
1. Đăng nhập vào hệ thống.
2. Vào màn hình Workspace.
3. Bấm Create Workspace.
4. Nhập tên workspace hợp lệ.
5. Bấm Save/Create.
6. Quan sát workspace mới trên giao diện.
7. Chuyển sang tab/màn hình khác.
8. Quay lại kiểm tra danh sách workspace.

Actual result:
- Tạo Workspace thành công.
- Workspace mới xuất hiện trên giao diện.
- Không cần reload trang vẫn thấy workspace mới.
- Tuy nhiên hệ thống bị tạo trùng workspace.
- Sau khi ấn tab khác thì tất cả workspace biến mất.

Expected result:
- Workspace chỉ được tạo 1 lần.
- Không được tạo trùng workspace.
- Danh sách workspace phải được giữ lại sau khi chuyển tab/màn hình khác.

Severity: Critical  
Priority: High  

Screenshot/Video:
- Attached if available.

---

## BUG-003: Tạo task mới nhưng task không hiển thị trên Kanban Board

Environment:
- Page: Task/Kanban Board
- Browser: Chrome
- Device: MacBook
- Account/Role: Current user

Steps to reproduce:
1. Đăng nhập vào hệ thống.
2. Vào Project/Kanban Board.
3. Bấm thêm task.
4. Nhập Title hợp lệ.
5. Chọn thông tin cần thiết nếu có.
6. Bấm Create/Save.
7. Quan sát Kanban Board.

Actual result:
- Hệ thống cho tạo task mới.
- Sau khi tạo, task không hiển thị trên Kanban Board.

Expected result:
- Task phải được tạo thành công.
- Task mới phải xuất hiện ở cột To Do.
- Người dùng không cần reload trang vẫn phải nhìn thấy task mới.

Severity: High  
Priority: High  

Screenshot/Video:
- Attached if available.

---

## BUG-004: Button Invite Member hiển thị vài giây rồi biến mất

Environment:
- Page: Team/Member
- Browser: Chrome
- Device: MacBook
- Account/Role: Current user

Steps to reproduce:
1. Đăng nhập vào hệ thống.
2. Vào tab Team/Member.
3. Quan sát button Invite Member.

Actual result:
- Khi ấn vào tab Team, button Invite Member chỉ hiển thị vài giây rồi biến mất.
- Sau đó màn hình chỉ hiển thị số lượng member.
- Người dùng không thể invite thêm thành viên.

Expected result:
- Button Invite Member phải hiển thị ổn định nếu user có quyền invite.
- Nếu user không có quyền invite, button nên bị ẩn ngay từ đầu hoặc hiển thị thông báo phân quyền rõ ràng.
- Không nên có hiện tượng button xuất hiện rồi biến mất.

Severity: High  
Priority: High  

Screenshot/Video:
- Attached if available.

---

## BUG-005: Light mode bị lỗi màu chữ, chữ trắng bị chìm màu

Environment:
- Page: UI Theme
- Browser: Chrome
- Device: MacBook
- Account/Role: Current user

Steps to reproduce:
1. Đăng nhập vào hệ thống.
2. Bấm nút chuyển Dark/Light mode.
3. Chuyển sang Light mode.
4. Quan sát text, button, sidebar và các thành phần trên giao diện.

Actual result:
- Giao diện không đổi theme thành công.
- Khi chuyển sang Light mode, chữ chuyển sang màu trắng và bị chìm màu.
- Người dùng khó đọc nội dung.

Expected result:
- Khi chuyển sang Light mode, màu nền và màu chữ phải tương phản rõ ràng.
- Text, button, icon phải dễ đọc.
- Layout không bị vỡ sau khi đổi theme.

Severity: Medium  
Priority: Medium  

Screenshot/Video:
- Attached if available.