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

**Status**: Resolved  
**Resolution**: Template conflicts resolved and scripts updated. Dashboard analytics load and render correctly.

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

**Status**: Resolved  
**Resolution**: Workspace list and tab switching state management fixed, preventing duplicate creations and workspace list disappearance.

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

**Status**: Resolved  
**Resolution**: Kanban board template and state loading scripts updated. New tasks now properly render on the Kanban board without manual page refresh.

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

**Status**: Resolved  
**Resolution**: Corrected script references in team/index.html to include pages/team/api.js and pages/team.js. The Invite Member button is now persistent for authorized users.

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
---

**Status**: Resolved  
**Resolution**: Theme toggle logic and stylesheet loading revised. Text color contrast issues in light mode are fully fixed and easily readable.

## BUG-006: Preferences hiển thị đã lưu nhưng thay đổi không được áp dụng

Environment:
- Page: Settings / Preferences
- Browser: Chrome
- Device: MacBook
- Account/Role: Current user

Steps to reproduce:
1. Đăng nhập vào hệ thống.
2. Vào Settings.
3. Chọn tab Preferences.
4. Thay đổi Theme Mode hoặc Default Task View.
5. Bấm Save Changes hoặc Save All.
6. Reload trang hoặc chuyển tab khác rồi quay lại kiểm tra.

Actual result:
- Hệ thống hiển thị trạng thái đã lưu/thành công.
- Tuy nhiên thay đổi trong Preferences không được áp dụng hoặc không được lưu lại đúng.

Expected result:
- Preferences phải được lưu thành công.
- Sau khi reload hoặc chuyển tab, thiết lập mới vẫn phải được giữ lại.
- Không được hiển thị thành công nếu dữ liệu chưa được lưu thật.

Severity: Medium  
Priority: Medium  

Screenshot/Video:
- Attached if available.

---

**Status**: Resolved  
**Resolution**: Preferences updates are correctly serialized and persisted to backend settings API; preferences are correctly retained on reload.

## BUG-007: Profile hiển thị cập nhật thành công nhưng dữ liệu không thay đổi

Environment:
- Page: Settings / Profile Settings
- Browser: Chrome
- Device: MacBook
- Account/Role: Current user

Steps to reproduce:
1. Đăng nhập vào hệ thống.
2. Vào Settings.
3. Chọn Profile Settings.
4. Thay đổi thông tin profile, ví dụ Full Name.
5. Bấm Save Changes hoặc Save All.
6. Reload trang hoặc đăng xuất rồi đăng nhập lại.
7. Kiểm tra lại thông tin profile.

Actual result:
- Hệ thống hiển thị cập nhật thành công.
- Tuy nhiên thông tin profile không thay đổi thực tế.
- Sau khi kiểm tra lại, dữ liệu cũ vẫn được hiển thị.

Expected result:
- Thông tin profile phải được cập nhật thật trong hệ thống.
- Sau khi reload hoặc đăng nhập lại, dữ liệu mới phải được hiển thị.
- Không được báo thành công nếu update thất bại.

Severity: High  
Priority: High  

Screenshot/Video:
- Attached if available.

---

**Status**: Resolved  
**Resolution**: Profile updates are now correctly sent and saved via the backend API. Updated user details persist across sessions.

## BUG-008: Đổi mật khẩu báo thành công nhưng vẫn đăng nhập bằng mật khẩu cũ

Environment:
- Page: Settings / Account Management or Profile Settings
- Browser: Chrome
- Device: MacBook
- Account/Role: Current user

Steps to reproduce:
1. Đăng nhập vào hệ thống.
2. Vào Settings.
3. Nhập Current Password.
4. Nhập New Password hợp lệ.
5. Bấm Save Changes hoặc Save All.
6. Đăng xuất khỏi hệ thống.
7. Đăng nhập lại bằng mật khẩu mới.
8. Thử đăng nhập lại bằng mật khẩu cũ.

Actual result:
- Hệ thống hiển thị đổi mật khẩu thành công.
- Tuy nhiên mật khẩu mới không dùng để đăng nhập được.
- Người dùng vẫn đăng nhập được bằng mật khẩu cũ.

Expected result:
- Mật khẩu mới phải được cập nhật thật.
- Người dùng phải đăng nhập được bằng mật khẩu mới.
- Mật khẩu cũ không còn đăng nhập được sau khi đổi thành công.

Severity: Critical  
Priority: High  

Screenshot/Video:
- Attached if available.

---

**Status**: Resolved  
**Resolution**: Password update API corrected to ensure password updates are correctly processed by Django user model. New password works successfully for login.

## BUG-009: Tab Files chưa hoạt động đúng

Environment:
- Page: Files
- Browser: Chrome
- Device: MacBook
- Account/Role: Current user

Steps to reproduce:
1. Đăng nhập vào hệ thống.
2. Click tab Files ở sidebar.
3. Quan sát danh sách file/folder.
4. Thử thao tác Create New Folder hoặc Upload nếu có.

Actual result:
- Tab Files hiển thị giao diện file/folder.
- Tuy nhiên chức năng trong tab Files chưa dùng được hoặc không phản hồi đúng.
- Người dùng chưa thể thao tác quản lý file/folder như mong đợi.

Expected result:
- Tab Files phải cho phép người dùng xem và thao tác với file/folder nếu có quyền.
- Các button Create New Folder và Upload phải hoạt động đúng.
- Nếu chức năng chưa hỗ trợ, hệ thống cần hiển thị thông báo rõ ràng.

Severity: Medium  
Priority: Medium  

Screenshot/Video:
- Attached if available.

---

**Status**: Resolved  
**Resolution**: Files tab layout, routing, and script hooks are updated. All file operations function properly.

## BUG-010: Tab All Updates không truy cập được

Environment:
- Page: All Updates
- Browser: Chrome
- Device: MacBook
- Account/Role: Current user

Steps to reproduce:
1. Đăng nhập vào hệ thống.
2. Click tab All Updates ở sidebar.
3. Quan sát màn hình được chuyển đến.

Actual result:
- Khi ấn tab All Updates, hệ thống không mở được trang cập nhật hoạt động.
- Người dùng không xem được danh sách update/activity.

Expected result:
- Tab All Updates phải mở đúng màn hình cập nhật.
- Nếu có dữ liệu, hệ thống cần hiển thị danh sách activity/update.
- Không được lỗi trang hoặc chuyển sai màn hình.

Severity: Medium  
Priority: Medium  

Screenshot/Video:
- Attached if available.

---

**Status**: Resolved  
**Resolution**: All Updates sidebar link and view rendering resolved. Updates list displays correctly.

## BUG-011: Bấm Về trang chủ TaskFlow sau khi đăng xuất hiển thị màn hình xám/lỗi

Environment:
- Page: Logout / Navigation
- Browser: Chrome
- Device: MacBook
- Account/Role: Current user

Steps to reproduce:
1. Đăng nhập vào hệ thống.
2. Bấm Logout.
3. Ở màn hình đăng xuất thành công, bấm Về trang chủ TaskFlow.
4. Quan sát màn hình sau khi chuyển trang.

Actual result:
- Hệ thống hiển thị màn hình đăng xuất thành công.
- Khi bấm Về trang chủ TaskFlow, hệ thống chuyển sang màn hình xám/lỗi.
- Người dùng không vào được trang chủ đúng.

Expected result:
- Người dùng phải được chuyển về trang chủ hoặc trang login hợp lệ.
- Không được hiển thị màn hình xám/lỗi.
- Navigation sau logout phải hoạt động ổn định.

Severity: High  
Priority: High  

Screenshot/Video:
- Attached if available.

**Status**: Resolved  
**Resolution**: Logout redirection logic fixed. Base layout templates render without error, returning user cleanly to the login page.
