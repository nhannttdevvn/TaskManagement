# Test Cases - TaskManagement

Tester: Huyền  
Branch: test/quality-assurance  

---

## TC-AUTH-001: Đăng nhập thành công

Module: Authentication  
Priority: High  

Pre-condition:
- User có tài khoản hợp lệ.

Steps:
1. Truy cập trang login.
2. Nhập email hợp lệ.
3. Nhập password hợp lệ.
4. Bấm Sign in.

Expected result:
- Đăng nhập thành công.
- Hệ thống chuyển sang Dashboard.
- Không hiển thị lỗi.

Result:
- PASS

Actual result:
- Đăng nhập thành công và chuyển vào Dashboard.

---

## TC-AUTH-002: Đăng nhập sai mật khẩu

Module: Authentication  
Priority: High  

Steps:
1. Truy cập trang login.
2. Nhập email đúng.
3. Nhập password sai.
4. Bấm Sign in.

Expected result:
- Không cho đăng nhập.
- Hiển thị thông báo lỗi dễ hiểu.
- Không chuyển vào Dashboard.

Result:
- PASS

Actual result:
- Hệ thống không cho đăng nhập khi nhập sai mật khẩu.
- Người dùng vẫn ở trang login.
- Hệ thống hiển thị thông báo lỗi đăng nhập.

---

## TC-DASH-001: Dashboard hiển thị đúng

Module: Dashboard  
Priority: High  

Steps:
1. Đăng nhập thành công.
2. Quan sát màn hình Dashboard.
3. Kiểm tra sidebar, project card, task, chart nếu có.
4. Mở Console kiểm tra lỗi đỏ.

Expected result:
- Dashboard load được dữ liệu.
- Các card không bị đè nhau.
- Sidebar/header không bị lệch.
- Không có lỗi trắng màn hình.
- Không có lỗi đỏ trong Console.

Result:
- FAIL

Actual result:
- Dashboard load thành công sau khi đăng nhập.
- Sidebar và header hiển thị đúng, không bị lệch.
- Các card/project/task/chart không hiển thị ở phần Analytics.
- Không có lỗi trắng màn hình.
- Không thấy lỗi đỏ nghiêm trọng trong Console.

---

## TC-WS-001: Tạo Workspace thành công

Module: Workspace  
Priority: High  

Steps:
1. Đăng nhập bằng user có quyền.
2. Vào màn hình Workspace.
3. Bấm Create Workspace.
4. Nhập tên workspace.
5. Bấm Save/Create.

Expected result:
- Workspace được tạo thành công.
- Workspace mới xuất hiện trên giao diện.
- Không bị duplicate workspace.

Result:
- FAIL

Actual result:
- Tạo Workspace thành công sau khi nhập tên workspace hợp lệ.
- Workspace mới xuất hiện trên giao diện.
- Không cần reload trang vẫn thấy workspace mới.
- Hệ thống bị tạo trùng workspace.
- Sau khi ấn sang tab khác thì tất cả workspace biến mất.

---

## TC-PRJ-001: Tạo Project thành công

Module: Project  
Priority: High  

Steps:
1. Đăng nhập bằng user có quyền.
2. Vào Workspace.
3. Bấm Create Project.
4. Nhập tên project.
5. Bấm Save/Create.

Expected result:
- Project được tạo thành công.
- Project hiển thị trong Workspace/Dashboard.

Result:
- BLOCKED

Reason:
- Không thấy chức năng tạo Project trong Workspace nên chưa thể thực hiện test tạo Project.

Actual result:
- Không thấy hiển thị phần tạo Project trong Workspace.

---

## TC-PRJ-002: Member không được xóa Project

Module: Permission  
Priority: High  

Pre-condition:
- Đăng nhập bằng tài khoản Member.

Steps:
1. Vào Project.
2. Tìm nút Delete Project.
3. Thử xóa Project nếu nút hiển thị.

Expected result:
- Member không được xóa Project.
- Nút Delete bị ẩn/disable hoặc báo lỗi không có quyền.
- Project không bị xóa.

Result:
- BLOCKED

Reason:
- Chưa có tài khoản Member riêng để kiểm tra đúng phân quyền xóa Project.

Actual result:
- Không thấy hiển thị nút xóa Project.

---

## TC-TASK-001: Tạo Task thành công

Module: Task  
Priority: High  

Steps:
1. Đăng nhập bằng user có quyền.
2. Vào Project.
3. Vào Kanban Board.
4. Bấm thêm task.
5. Nhập Title.
6. Chọn Assignee nếu có.
7. Chọn Priority/Due Date nếu có.
8. Bấm Create/Save.

Expected result:
- Task được tạo thành công.
- Task xuất hiện ở cột To Do.
- Không cần reload trang.

Result:
- FAIL

Actual result:
- Tạo task mới nhưng task không hiển thị trên Kanban Board.

---

## TC-TASK-002: Không cho tạo Task khi bỏ trống Title

Module: Task  
Priority: High  

Steps:
1. Mở form tạo Task.
2. Để trống Title.
3. Bấm Create/Save.

Expected result:
- Hệ thống báo lỗi bắt buộc nhập Title.
- Không tạo task mới.

Result:
- PASS

Actual result:
- Khi bỏ trống trường Title và bấm Create/Save, hệ thống không tạo task mới.
- Hệ thống hiển thị thông báo lỗi yêu cầu nhập Title.
- Form tạo task vẫn được giữ lại để người dùng nhập lại thông tin.

---

## TC-KANBAN-001: Kéo task từ To Do sang In Progress

Module: Kanban  
Priority: High  

Steps:
1. Vào Kanban Board.
2. Kéo một task từ cột To Do sang In Progress.
3. Reload trang.

Expected result:
- Task chuyển sang In Progress.
- Sau khi reload, task vẫn nằm ở In Progress.

Result:
- BLOCKED

Reason:
- Không có task hiển thị trên Kanban nên chưa thể test kéo thả task.

Actual result:
- Không hiển thị Task trên Kanban Board.

---

## TC-KANBAN-002: Member không được kéo task từ Done về In Progress

Module: Kanban Permission  
Priority: High  

Pre-condition:
- Có task đang nằm ở cột Done.
- Đăng nhập bằng Member.

Steps:
1. Kéo task từ Done về In Progress.

Expected result:
- Task tự quay lại cột Done.
- Hiển thị thông báo không có quyền reopen task.

Result:
- BLOCKED

Reason:
- Không có task ở cột Done và chưa có tài khoản Member riêng để kiểm tra quyền reopen task.

Actual result:
- Không hiển thị Task.

---

## TC-INV-001: Invite Member với email hợp lệ

Module: Invitation  
Priority: High  

Steps:
1. Đăng nhập bằng Owner hoặc Manager.
2. Vào Team/Member.
3. Bấm Invite Member.
4. Nhập email hợp lệ.
5. Chọn role Member.
6. Bấm Send Invitation.

Expected result:
- Hiển thị thông báo gửi lời mời thành công.
- Invitation có trạng thái Pending.

Result:
- FAIL

Actual result:
- Khi ấn vào tab Team, button Invite Member chỉ hiển thị vài giây rồi biến mất.
- Sau đó màn hình chỉ hiển thị số lượng member.
- Không có button Invite để thêm thành viên.

---

## TC-INV-002: Invite với email sai format

Module: Invitation  
Priority: High  

Steps:
1. Vào Invite Member.
2. Nhập email sai format, ví dụ: abcxyz.
3. Bấm Send Invitation.

Expected result:
- Hệ thống báo email không hợp lệ.
- Không gửi invitation.

Result:
- BLOCKED

Reason:
- Không hiển thị button Invite nên chưa thể nhập email sai format để kiểm tra validation.

Actual result:
- Không hiển thị button Invite.

---

## TC-UI-001: Chuyển Dark mode / Light mode

Module: UI/UX  
Priority: Medium  

Steps:
1. Đăng nhập vào hệ thống.
2. Bấm nút chuyển Dark/Light mode.
3. Quan sát Dashboard, sidebar, button và text.

Expected result:
- Giao diện đổi theme thành công.
- Text vẫn đọc rõ.
- Button/icon không bị chìm màu.
- Layout không bị vỡ.

Result:
- FAIL

Actual result:
- Giao diện không đổi theme thành công.
- Khi chuyển sang light mode thì chữ chuyển trắng bị chìm màu.

---

## TC-SEC-001: Chưa đăng nhập không được vào Dashboard

Module: Security  
Priority: High  

Steps:
1. Logout khỏi hệ thống.
2. Truy cập trực tiếp /dashboard/.

Expected result:
- Hệ thống chuyển về trang login.
- Không hiển thị dữ liệu dashboard.

Result:
- PASS

Actual result:
- Khi chưa đăng nhập và truy cập trực tiếp /dashboard/, hệ thống không cho xem Dashboard.
- Người dùng được chuyển về trang login.
- Không hiển thị dữ liệu dashboard.

---

## TC-SEC-002: Không thực thi script trong Task Title

Module: Security  
Priority: High  

Steps:
1. Tạo task mới.
2. Nhập title: <script>alert(1)</script>
3. Bấm Create.
4. Quan sát task card.

Expected result:
- Không hiện popup alert.
- Script không được thực thi.
- Nội dung được hiển thị như text hoặc được escape.

Result:
- BLOCKED

Reason:
- Task tạo mới không hiển thị nên chưa thể quan sát việc script có được render/thực thi trên task card hay không.

Actual result:
- Không hiển thị Task.

---
---

## TC-SET-001: Cập nhật Preferences thành công

Module: Settings / Preferences  
Priority: Medium  

Steps:
1. Đăng nhập vào hệ thống.
2. Vào Settings.
3. Chọn tab Preferences.
4. Thay đổi Theme Mode hoặc Default Task View.
5. Bấm Save Changes hoặc Save All.
6. Reload trang hoặc chuyển sang tab khác rồi quay lại kiểm tra.

Expected result:
- Preferences được cập nhật thành công.
- Sau khi reload hoặc chuyển tab, thay đổi vẫn được giữ lại.
- Giao diện phản ánh đúng thiết lập người dùng đã chọn.

Result:
- FAIL

Actual result:
- Người dùng thay đổi Preferences và bấm Save Changes/Save All.
- Hệ thống hiển thị trạng thái đã lưu/thành công.
- Tuy nhiên thay đổi không được áp dụng hoặc không được lưu lại đúng sau khi kiểm tra lại.

---

## TC-SET-002: Cập nhật Profile thành công

Module: Settings / Profile  
Priority: High  

Steps:
1. Đăng nhập vào hệ thống.
2. Vào Settings.
3. Chọn tab Profile Settings.
4. Thay đổi thông tin profile, ví dụ Full Name.
5. Bấm Save Changes hoặc Save All.
6. Reload trang hoặc đăng xuất rồi đăng nhập lại.
7. Kiểm tra thông tin profile.

Expected result:
- Profile được cập nhật thành công.
- Thông tin mới được hiển thị đúng sau khi reload hoặc đăng nhập lại.
- Không hiển thị thông báo thành công nếu dữ liệu chưa được lưu thật.

Result:
- FAIL

Actual result:
- Khi cập nhật profile, hệ thống hiển thị thông báo/trạng thái cập nhật thành công.
- Tuy nhiên thông tin profile không được cập nhật thực tế.
- Sau khi kiểm tra lại, dữ liệu vẫn không thay đổi.

---

## TC-SET-003: Đổi mật khẩu thành công

Module: Settings / Account Management  
Priority: High  

Steps:
1. Đăng nhập vào hệ thống.
2. Vào Settings.
3. Chọn phần Profile Settings hoặc Account Management.
4. Nhập Current Password.
5. Nhập New Password hợp lệ.
6. Bấm Save Changes hoặc Save All.
7. Đăng xuất khỏi hệ thống.
8. Đăng nhập lại bằng mật khẩu mới.
9. Thử đăng nhập lại bằng mật khẩu cũ.

Expected result:
- Hệ thống đổi mật khẩu thành công.
- Người dùng đăng nhập được bằng mật khẩu mới.
- Người dùng không đăng nhập được bằng mật khẩu cũ.

Result:
- FAIL

Actual result:
- Sau khi đổi mật khẩu, hệ thống hiển thị thông báo thành công.
- Tuy nhiên khi đăng xuất và đăng nhập lại, mật khẩu mới không dùng được.
- Người dùng vẫn đăng nhập được bằng mật khẩu cũ.
- Điều này cho thấy mật khẩu chưa được cập nhật thực tế.

---

## TC-FILE-001: Truy cập tab Files

Module: Files  
Priority: Medium  

Steps:
1. Đăng nhập vào hệ thống.
2. Click tab Files ở sidebar.
3. Quan sát màn hình Files.
4. Thử click các chức năng như Create New Folder hoặc Upload nếu có.

Expected result:
- Tab Files mở đúng màn hình quản lý file.
- Người dùng có thể thao tác với folder/file nếu có quyền.
- Dữ liệu file/folder phải hiển thị đúng.
- Các button Create New Folder và Upload hoạt động đúng.

Result:
- FAIL

Actual result:
- Khi ấn vào tab Files, giao diện không hoạt động đúng.
- Tab Files hiển thị dữ liệu/giao diện nhưng các chức năng chưa dùng được hoặc không phản hồi như mong đợi.
- Người dùng chưa thể thao tác quản lý file/folder.

---

## TC-UPD-001: Truy cập tab All Updates

Module: All Updates  
Priority: Medium  

Steps:
1. Đăng nhập vào hệ thống.
2. Click tab All Updates ở sidebar.
3. Quan sát màn hình All Updates.

Expected result:
- Tab All Updates mở đúng màn hình cập nhật hoạt động.
- Hiển thị danh sách update/activity nếu có dữ liệu.
- Không bị lỗi trang hoặc chuyển sai màn hình.

Result:
- FAIL

Actual result:
- Khi ấn vào tab All Updates, hệ thống không mở được trang All Updates.
- Người dùng không thể xem danh sách cập nhật/hoạt động.

---

## TC-NAV-001: Truy cập về trang chủ TaskFlow sau khi đăng xuất

Module: Navigation / Logout  
Priority: High  

Steps:
1. Đăng nhập vào hệ thống.
2. Bấm Logout.
3. Ở màn hình đăng xuất thành công, bấm Về trang chủ TaskFlow.
4. Quan sát màn hình được chuyển đến.

Expected result:
- Người dùng được chuyển về trang chủ hoặc trang login hợp lệ.
- Không hiển thị màn hình lỗi.
- Không bị blank page hoặc màn hình xám.

Result:
- FAIL

Actual result:
- Sau khi đăng xuất, hệ thống hiển thị màn hình đăng xuất thành công.
- Khi bấm Về trang chủ TaskFlow, hệ thống chuyển sang màn hình xám/lỗi.
- Người dùng không vào được trang chủ đúng như mong đợi.