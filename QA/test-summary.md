# Test Summary - TaskManagement

Date: 03/06/2026  
Tester: Huyền  
Branch: test/quality-assurance  

## Test Environment
- URL: https://taskmanagement-production-2cc5.up.railway.app/
- Browser: Chrome
- Device: MacBook
- Test type: Manual UI Testing

## Scope tested
- Authentication
- Dashboard
- Workspace
- Project
- Task/Kanban
- Invitation
- UI/UX
- Security basic

## Test result

Total test cases: 21  
Passed: 4  
Failed: 11  
Blocked: 6  
Not run: 0  

## Passed test cases
1. TC-AUTH-001: Đăng nhập thành công
2. TC-AUTH-002: Đăng nhập sai mật khẩu
3. TC-TASK-002: Không cho tạo Task khi bỏ trống Title
4. TC-SEC-001: Chưa đăng nhập không được vào Dashboard

## Failed test cases
1. TC-DASH-001: Dashboard hiển thị đúng
2. TC-WS-001: Tạo Workspace thành công
3. TC-TASK-001: Tạo Task thành công
4. TC-INV-001: Invite Member với email hợp lệ
5. TC-UI-001: Chuyển Dark mode / Light mode
6. TC-SET-001: Cập nhật Preferences thành công
7. TC-SET-002: Cập nhật Profile thành công
8. TC-SET-003: Đổi mật khẩu thành công
9. TC-FILE-001: Truy cập tab Files
10. TC-UPD-001: Truy cập tab All Updates
11. TC-NAV-001: Truy cập về trang chủ TaskFlow sau khi đăng xuất

## Blocked test cases
1. TC-PRJ-001: Tạo Project thành công
   - Không thấy chức năng tạo Project trong Workspace.

2. TC-PRJ-002: Member không được xóa Project
   - Chưa có tài khoản Member riêng để kiểm tra đúng phân quyền.

3. TC-KANBAN-001: Kéo task từ To Do sang In Progress
   - Không có task hiển thị trên Kanban nên chưa thể test kéo thả.

4. TC-KANBAN-002: Member không được kéo task từ Done về In Progress
   - Không có task ở cột Done và chưa có tài khoản Member riêng.

5. TC-INV-002: Invite với email sai format
   - Không hiển thị button Invite nên chưa thể nhập email sai format để kiểm tra validation.

6. TC-SEC-002: Không thực thi script trong Task Title
   - Task tạo mới không hiển thị nên chưa thể quan sát script trên task card.

## Bugs found
1. BUG-001: Dashboard không hiển thị card/project/task/chart trong phần Analytics.
2. BUG-002: Workspace bị tạo trùng và biến mất sau khi chuyển tab.
3. BUG-003: Tạo task mới nhưng task không hiển thị trên Kanban Board.
4. BUG-004: Button Invite Member hiển thị vài giây rồi biến mất.
5. BUG-005: Light mode bị lỗi màu chữ, chữ trắng bị chìm màu.
6. BUG-006: Preferences hiển thị đã lưu nhưng thay đổi không được áp dụng.
7. BUG-007: Profile hiển thị cập nhật thành công nhưng dữ liệu không thay đổi.
8. BUG-008: Đổi mật khẩu báo thành công nhưng vẫn đăng nhập bằng mật khẩu cũ.
9. BUG-009: Tab Files chưa hoạt động đúng.
10. BUG-010: Tab All Updates không truy cập được.
11. BUG-011: Bấm Về trang chủ TaskFlow sau khi đăng xuất hiển thị màn hình xám/lỗi.

## Notes
- Một số test case bị blocked do thiếu tài khoản role riêng như Owner/Manager/Member/Viewer.
- Một số test case bị blocked do dữ liệu Task không hiển thị trên Kanban Board.
- Chưa kiểm tra trực tiếp database production vì tester chưa có quyền truy cập database.
- Cần dev kiểm tra lại API hoặc state management ở các phần Workspace, Task, Dashboard và Team.
- Phát hiện thêm nhiều lỗi ở Settings/Profile/Preferences: hệ thống hiển thị lưu thành công nhưng dữ liệu không được cập nhật thực tế.
- Lỗi đổi mật khẩu là lỗi nghiêm trọng vì hệ thống báo thành công nhưng người dùng vẫn đăng nhập bằng mật khẩu cũ.
- Tab Files và All Updates cần được kiểm tra lại vì chưa hoạt động đúng hoặc không truy cập được.
- Navigation sau logout bị lỗi khi bấm về trang chủ TaskFlow.