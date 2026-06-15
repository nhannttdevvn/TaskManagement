# Test Summary - TaskManagement

Date: 15/06/2026  
Tester: Huyền  
Branch: develop (test/quality-assurance verified)  

## Test Environment
- URL: https://taskmanagement-production-2cc5.up.railway.app/
- Browser: Chrome
- Device: MacBook
- Test type: Manual UI Testing & Django Automated Unit Testing

## Scope tested
- Authentication
- Dashboard
- Workspace
- Project
- Task/Kanban
- Invitation
- UI/UX
- Security basic
- Settings (Profile, Preferences, Password Change)
- Files
- Updates

## Test result

Total test cases: 21  
Passed: 21  
Failed: 0  
Blocked: 0  
Not run: 0  

## Passed test cases
1. TC-AUTH-001: Đăng nhập thành công
2. TC-AUTH-002: Đăng nhập sai mật khẩu
3. TC-DASH-001: Dashboard hiển thị đúng
4. TC-WS-001: Tạo Workspace thành công
5. TC-PRJ-001: Tạo Project thành công
6. TC-PRJ-002: Member không được xóa Project
7. TC-TASK-001: Tạo Task thành công
8. TC-TASK-002: Không cho tạo Task khi bỏ trống Title
9. TC-KANBAN-001: Kéo task từ To Do sang In Progress
10. TC-KANBAN-002: Member không được kéo task từ Done về In Progress
11. TC-INV-001: Invite Member với email hợp lệ
12. TC-INV-002: Invite với email sai format
13. TC-UI-001: Chuyển Dark mode / Light mode
14. TC-SEC-001: Chưa đăng nhập không được vào Dashboard
15. TC-SEC-002: Không thực thi script trong Task Title
16. TC-SET-001: Cập nhật Preferences thành công
17. TC-SET-002: Cập nhật Profile thành công
18. TC-SET-003: Đổi mật khẩu thành công
19. TC-FILE-001: Truy cập tab Files
20. TC-UPD-001: Truy cập tab All Updates
21. TC-NAV-001: Truy cập về trang chủ TaskFlow sau khi đăng xuất

## Failed test cases
None

## Blocked test cases
None

## Bugs found
All resolved:
1. BUG-001: Dashboard không hiển thị card/project/task/chart trong phần Analytics (Resolved)
2. BUG-002: Workspace bị tạo trùng và biến mất sau khi chuyển tab (Resolved)
3. BUG-003: Tạo task mới nhưng task không hiển thị trên Kanban Board (Resolved)
4. BUG-004: Button Invite Member hiển thị vài giây rồi biến mất (Resolved - Script loading paths fixed in team template)
5. BUG-005: Light mode bị lỗi màu chữ, chữ trắng bị chìm màu (Resolved)
6. BUG-006: Preferences hiển thị đã lưu nhưng thay đổi không được áp dụng (Resolved)
7. BUG-007: Profile hiển thị cập nhật thành công nhưng dữ liệu không thay đổi (Resolved)
8. BUG-008: Đổi mật khẩu báo thành công nhưng vẫn đăng nhập bằng mật khẩu cũ (Resolved)
9. BUG-009: Tab Files chưa hoạt động đúng (Resolved)
10. BUG-010: Tab All Updates không truy cập được (Resolved)
11. BUG-011: Bấm Về trang chủ TaskFlow sau khi đăng xuất hiển thị màn hình xám/lỗi (Resolved)

## Notes
- All git merge and template conflicts have been resolved successfully.
- Django automated unit test suite (21 tests total) executes with 100% pass rate.
- Frontend templates compile cleanly without any Django template engine syntax errors.
- Script paths on the Team Collaboration template are corrected (loading js/pages/team/api.js and js/pages/team.js instead of js/team.js).
