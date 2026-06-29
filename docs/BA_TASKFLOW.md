---
title: "TaskFlow - Tài liệu BA tổng hợp"
type: business-analysis
project: TaskFlow
branch: feature/backend-core
created: 2026-06-28
last_updated: 2026-06-28
language: vi
---

# TaskFlow - Tài Liệu BA Tổng Hợp

Tài liệu này tổng hợp góc nhìn Business Analysis cho dự án TaskFlow: mục tiêu sản phẩm, phạm vi, vai trò người dùng, luồng nghiệp vụ, yêu cầu chức năng, yêu cầu phi chức năng, quy tắc phân quyền, dữ liệu, API, tiêu chí nghiệm thu và lộ trình phát triển.

Nguồn tổng hợp:

- Mã nguồn hiện tại của dự án TaskFlow.
- Tài liệu cấu trúc tại `docs/PROJECT_STRUCTURE.md`.
- Các thay đổi đã triển khai trên nhánh `feature/backend-core`.
- Các yêu cầu đã thống nhất trong quá trình tối ưu FE/BE.

## 1. Tổng Quan Dự Án

TaskFlow là ứng dụng quản lý công việc theo mô hình:

```text
Workspace -> Project -> Task
```

Sản phẩm hướng tới nhóm nhỏ, team sản phẩm, team vận hành, lớp học hoặc nhóm làm đồ án cần một nơi để:

- Tạo workspace.
- Tạo và quản lý project.
- Tạo task và theo dõi tiến độ.
- Kéo thả task theo Kanban.
- Xem timeline, list, calendar.
- Mời thành viên và phân quyền.
- Bình luận, lưu metadata tệp đính kèm.
- Theo dõi activity và notification.
- Trao đổi qua chat trong phạm vi hợp lệ.

Stack hiện tại:

- Backend: Django 4.2, Django Channels, Daphne.
- Frontend: Django template, vanilla JavaScript, Tailwind CSS build local.
- Database: SQLite cho local test, MySQL cho môi trường thật.
- Auth: Django auth, django-allauth, Google OAuth cấu hình sẵn.

## 2. Vấn Đề Cần Giải Quyết

Trước khi tối ưu, dự án có UI khá đầy đủ nhưng còn một số điểm cần hoàn thiện:

- Một số thao tác cần nhiều click.
- Một số nút nhỏ, khó thao tác trên mobile.
- Dữ liệu từng có fallback demo/localStorage, dễ lệch với DB.
- GET endpoint từng có nguy cơ tự sinh dữ liệu ngầm.
- Quyền thao tác task chưa phủ hết trường hợp assignee.
- Kéo thả Kanban từng ghi nhầm `position` vào `row`.
- Task detail cần dữ liệu thật cho comment, attachment, activity.
- Light mode có một số chữ accent hơi chói.
- Chuyển trang truyền thống tạo cảm giác reload.
- Avatar profile trước đây chỉ preview, chưa lưu local.

Mục tiêu hiện tại là đưa dự án về baseline ổn định hơn:

- Dữ liệu nghiệp vụ ưu tiên DB.
- Permission rõ ràng.
- API trả lỗi nhất quán.
- UI dễ click, dễ hiểu.
- Có feedback khi thao tác.
- Test quan trọng chạy xanh.

## 3. Mục Tiêu Kinh Doanh

### 3.1 Mục tiêu ngắn hạn

- User mới có thể đăng ký, đăng nhập và bắt đầu tạo workspace.
- User có thể tạo workspace, project, task bằng dữ liệu thật.
- User có thể kéo task trên Kanban và reload vẫn giữ thứ tự.
- Thành viên được giao việc có thể cập nhật task của mình.
- Owner/admin có thể mời thành viên, quản lý role.
- Viewer chỉ xem, không tạo/sửa/xóa dữ liệu.
- Settings cho phép đổi avatar và lưu ảnh local.
- FE chuyển trang nội bộ mượt, không full reload.

### 3.2 Mục tiêu trung hạn

- Hoàn thiện test cho permission, validation, notification và chat.
- Kết nối email invitation thật.
- Bổ sung file storage thật nếu cần upload binary ngoài avatar local.
- Tối ưu query cho dashboard và project có dữ liệu lớn.
- Đưa smoke test FE vào quy trình kiểm thử.

### 3.3 Chỉ số thành công

| Nhóm | Chỉ số |
| --- | --- |
| Onboarding | User mới tạo workspace, project, task đầu tiên trong dưới 3 phút |
| Tin cậy dữ liệu | Reload sau mutation không mất dữ liệu |
| Quyền | Viewer bị chặn đúng với `permission_denied` |
| Task | Assignee cập nhật được task được giao |
| Kanban | Kéo thả đổi `position`, không làm lệch `row` timeline |
| UX | Các nút chính dễ bấm trên desktop và mobile |
| Test | `manage.py test` pass toàn bộ |

## 4. Đối Tượng Sử Dụng

### 4.1 Owner

Người tạo workspace, có toàn quyền với workspace.

Nhu cầu chính:

- Tạo workspace và project.
- Mời thành viên.
- Quản lý role.
- Theo dõi tiến độ.
- Kiểm soát quyền thao tác.

### 4.2 Admin

Thành viên có quyền quản trị trong workspace.

Nhu cầu chính:

- Tạo/sửa project và task.
- Mời thành viên nếu được cấp quyền.
- Hỗ trợ owner vận hành team.

### 4.3 Manager

Người quản lý theo project.

Nhu cầu chính:

- Điều phối task trong project.
- Cập nhật trạng thái, lịch và tiến độ.
- Theo dõi activity của task.

### 4.4 Member

Thành viên thao tác hằng ngày.

Nhu cầu chính:

- Xem task được giao.
- Cập nhật task mình phụ trách.
- Comment, theo dõi deadline.
- Nhận notification khi có thay đổi.

### 4.5 Viewer

Người chỉ xem.

Nhu cầu chính:

- Xem workspace/project/task.
- Theo dõi tiến độ.
- Không thực hiện thao tác thay đổi dữ liệu.

## 5. Phạm Vi Dự Án

### 5.1 Trong phạm vi

- Đăng ký, đăng nhập, đăng xuất.
- Dashboard tổng quan.
- Workspace.
- Project.
- Task.
- Kanban position.
- Timeline schedule.
- Comment task.
- Attachment metadata.
- Favorite task/project.
- Team member.
- Invite member.
- Friend/chat baseline.
- Notification.
- Task activity.
- Profile settings.
- Avatar upload local tối đa 25MB.
- Theme sáng/tối.
- Chuyển trang mượt bằng PJAX.
- Test backend quan trọng.

### 5.2 Ngoài phạm vi hiện tại

- Billing/subscription.
- Email invitation thật.
- Upload file cloud storage đầy đủ.
- Mobile app native.
- Realtime collaborative editing như Notion.
- Audit log enterprise.
- React/Vue rewrite.
- DRF rewrite toàn bộ API.

## 6. Hiện Trạng Sản Phẩm

### 6.1 Điểm mạnh

- UI đã có các màn chính: Dashboard, Workspaces/Project, Team, Files, Settings.
- Backend đã có model thật cho Team, Project, Task, Favorite, Comment, Attachment, Notification, Activity, Chat.
- Service layer đã bắt đầu tách logic khỏi view.
- Permission helper đã có các hàm chính.
- FE có wrapper API chung.
- Đã có theme sáng/tối.
- Đã có PJAX navigation để chuyển trang mượt.
- Đã có test backend cho nhiều flow quan trọng.

### 6.2 Điểm cần theo dõi

- Attachment hiện mới lưu metadata, chưa lưu binary file thật.
- Files page vẫn thiên về UI/demo nếu chưa có storage thật.
- Email invitation chưa có provider gửi mail thật.
- Chat cần thêm test permission sâu hơn.
- Một số text cũ trong template có dấu hiệu lỗi encoding, cần chuẩn hóa dần.
- DB local không được commit lên repo.

## 7. Luồng Người Dùng Chính

### 7.1 User mới bắt đầu

1. User mở trang login.
2. Chọn đăng ký.
3. Nhập họ tên, email, mật khẩu.
4. Hệ thống tạo tài khoản.
5. User vào dashboard.
6. Dashboard hiển thị empty state nếu chưa có workspace.
7. User bấm tạo workspace.
8. User tạo project đầu tiên.
9. User tạo task đầu tiên.
10. Reload trang, dữ liệu vẫn còn.

### 7.2 Owner tạo workspace và project

1. Owner mở Workspaces.
2. Bấm Add Workspace.
3. Nhập tên workspace.
4. Backend tạo Team.
5. Backend tạo TeamMember role owner.
6. UI hiển thị workspace.
7. Owner tạo project trong workspace.
8. Project hiển thị trong danh sách.

### 7.3 Member cập nhật task được giao

1. Owner hoặc manager tạo task.
2. Gán member vào `assignees`.
3. Member mở project.
4. Member cập nhật task được giao.
5. Backend cho phép vì member nằm trong `task.assignees`.
6. Activity được ghi lại.
7. Reload vẫn thấy dữ liệu mới.

### 7.4 Kéo thả Kanban

1. User mở project.
2. User kéo task sang vị trí mới trên Kanban.
3. FE gửi `position`.
4. Backend cập nhật `task.position`.
5. Backend giữ nguyên `task.row` của timeline.
6. Reload Kanban giữ thứ tự đúng.

### 7.5 Cập nhật timeline/schedule

1. User mở timeline.
2. User kéo/resize task.
3. FE gửi `start`, `duration`, `row`.
4. Backend validate giá trị không âm.
5. Backend lưu schedule.
6. Reload timeline giữ vị trí đúng.

### 7.6 Upload avatar local

1. User mở Settings.
2. Chọn Change photo.
3. Chọn ảnh JPG, PNG, GIF hoặc WebP.
4. Ảnh có thể lớn hơn 12MB, tối đa 25MB.
5. Backend lưu vào `media/avatars/`.
6. UI đổi preview ngay.
7. Reload Settings vẫn thấy avatar đã lưu.

### 7.7 Mời thành viên

1. Owner/admin mở Team hoặc Settings.
2. Bấm Invite.
3. Nhập email và role.
4. Backend validate role và email.
5. Backend chặn invite trùng pending.
6. Invitation được tạo.
7. Activity/notification được ghi nếu flow hỗ trợ.

## 8. Yêu Cầu Chức Năng

### FR-001 - Đăng ký và đăng nhập

Mô tả:

- User có thể tạo tài khoản bằng họ tên, email và mật khẩu.
- User có thể đăng nhập bằng email/username và mật khẩu.

Tiêu chí nghiệm thu:

- Đăng ký thành công vào dashboard.
- User chưa đăng nhập bị redirect về login khi vào app.
- Login page load CSS local đúng.

### FR-002 - Dashboard

Mô tả:

- Hiển thị thông tin tổng quan về workspace, project, task và status.

Tiêu chí nghiệm thu:

- User mới thấy empty state.
- Dashboard không tự tạo workspace khi chỉ GET data.
- Số liệu lấy từ DB.

### FR-003 - Workspace

Mô tả:

- Workspace được map với model Team.
- Owner tạo workspace và tự động là member owner.

Tiêu chí nghiệm thu:

- Workspace tạo xong reload vẫn còn.
- User không có quyền không xem/sửa workspace của người khác.

### FR-004 - Project

Mô tả:

- Project thuộc workspace.
- Project card có thể click để mở.

Tiêu chí nghiệm thu:

- Tạo project trong active workspace.
- Nếu thiếu workspace khi bắt buộc, API trả `workspace_required`.
- Reload vẫn thấy project.

### FR-005 - Task

Mô tả:

- User tạo, sửa, xóa task.
- Task có status, priority, due date, schedule, assignee, favorite.

Tiêu chí nghiệm thu:

- Tạo task xong reload vẫn còn.
- Dữ liệu status/schedule/favorite lưu DB.
- Viewer không sửa task.
- Assignee sửa được task được giao.

### FR-006 - Kanban position

Mô tả:

- Kéo thả Kanban cập nhật trường `position`.
- Không ghi nhầm vào `row`.

Tiêu chí nghiệm thu:

- Gửi `position=7` làm `task.position=7`.
- `task.row` giữ nguyên nếu request không gửi row.
- API response trả `position`.

### FR-007 - Timeline schedule

Mô tả:

- Timeline dùng `start`, `duration`, `row`.

Tiêu chí nghiệm thu:

- `start >= 0`.
- `duration >= 0.25`.
- `row >= 0`.
- Reload giữ schedule.

### FR-008 - Comment và attachment metadata

Mô tả:

- Task detail hiển thị comment và attachment metadata từ DB.

Tiêu chí nghiệm thu:

- Comment lưu DB.
- Attachment metadata lưu DB.
- User không có quyền bị chặn.

### FR-009 - Notification và activity

Mô tả:

- Hệ thống ghi lại các thao tác quan trọng.
- User nhận notification khi cần.

Tiêu chí nghiệm thu:

- Task update tạo activity.
- Comment/attachment tạo notification phù hợp.
- Mark read cập nhật `read_at`.

### FR-010 - Avatar local

Mô tả:

- User upload avatar trong Settings.
- File lưu local trên máy chạy localhost.

Tiêu chí nghiệm thu:

- File tối đa 25MB.
- Ảnh lớn hơn 12MB upload được.
- File nằm trong `media/avatars/`.
- Reload Settings vẫn hiển thị avatar.

### FR-011 - Theme sáng/tối

Mô tả:

- User bật/tắt light mode.

Tiêu chí nghiệm thu:

- Theme lưu localStorage.
- Reload vẫn giữ theme.
- Light mode không bị chói chữ.

### FR-012 - Chuyển trang mượt

Mô tả:

- Link nội bộ chuyển bằng PJAX, không full reload.

Tiêu chí nghiệm thu:

- Dashboard, Workspaces, Team, Files, Settings chuyển mượt.
- Browser back/forward hoạt động đúng.
- Không lỗi console.

## 9. Permission Matrix

| Hành động | Owner | Admin | Manager | Member | Assignee | Viewer |
| --- | --- | --- | --- | --- | --- | --- |
| Xem workspace | Có | Có | Có | Có | Có | Có |
| Quản lý workspace | Có | Có | Không | Không | Không | Không |
| Mời member | Có | Có | Không | Không | Không | Không |
| Tạo project | Có | Có | Theo quyền | Không | Không | Không |
| Sửa/xóa project | Có | Có | Theo project | Không | Không | Không |
| Xem task | Có | Có | Có | Có | Có | Có nếu được cấp |
| Tạo task | Có | Có | Có | Theo quyền | Không | Không |
| Sửa task | Có | Có | Có | Theo quyền | Có nếu được giao | Không |
| Xóa task | Có | Có | Có | Theo quyền | Theo quyền | Không |
| Comment task | Có | Có | Có | Có | Có | Theo quyền |
| Favorite | Có | Có | Có | Có | Có | Có |
| Upload avatar | Có | Có | Có | Có | Có | Có |

Quy tắc mới đã chốt:

- `can_edit_task` trả `True` nếu user là owner của task.
- `can_edit_task` trả `True` nếu user nằm trong `task.assignees`.
- Nếu không, kiểm tra quyền quản lý project.

## 10. Business Rules

| Mã | Quy tắc |
| --- | --- |
| BR-001 | GET endpoint không được tự tạo workspace/project/task |
| BR-002 | Workspace chỉ tạo qua mutation |
| BR-003 | Tạo workspace phải tạo owner member |
| BR-004 | Project phải thuộc workspace |
| BR-005 | Viewer không tạo/sửa/xóa dữ liệu |
| BR-006 | Assignee được cập nhật task được giao |
| BR-007 | Kanban dùng `position` |
| BR-008 | Timeline/Gantt dùng `row` |
| BR-009 | Không ghi `position` đè vào `row` |
| BR-010 | Status task phải thuộc choices |
| BR-011 | Priority task phải thuộc choices |
| BR-012 | Due date nhận ISO `YYYY-MM-DD` |
| BR-013 | Avatar chỉ nhận JPG, PNG, GIF, WebP |
| BR-014 | Avatar local tối đa 25MB |
| BR-015 | Chat sender lấy từ authenticated user |
| BR-016 | LocalStorage không là nguồn dữ liệu nghiệp vụ chính |

## 11. Data Model Tóm Tắt

| Model | Vai trò |
| --- | --- |
| User | Tài khoản người dùng |
| Team | Workspace |
| TeamMember | Thành viên workspace và role |
| TeamInvitation | Lời mời tham gia workspace |
| TeamInvitationProject | Liên kết invitation với project |
| Project | Project trong workspace |
| ProjectMember | Role theo project |
| Task | Công việc |
| TaskFavorite | Favorite task theo user |
| ProjectFavorite | Favorite project theo user |
| TaskComment | Comment theo task |
| TaskAttachment | Metadata tệp đính kèm |
| TaskActivity | Lịch sử thao tác task |
| Notification | Thông báo |
| Friendship | Quan hệ bạn bè |
| ChatMessage | Tin nhắn |

Ghi chú avatar:

- Avatar hiện không dùng model riêng.
- File được lưu trong `MEDIA_ROOT / avatars`.
- URL trả về qua `current_user_payload` và context settings.

## 12. API Contract

### 12.1 Response thành công

```json
{
  "ok": true,
  "data": {}
}
```

### 12.2 Response lỗi

```json
{
  "ok": false,
  "error": "Message",
  "code": "permission_denied",
  "details": {}
}
```

### 12.3 Endpoint chính

| Method | Endpoint | Mục đích |
| --- | --- | --- |
| GET | `/api/dashboard/data/` | Lấy dashboard data |
| GET | `/api/project/data/` | Lấy workspace/project/task data |
| GET | `/api/team/data/` | Lấy team data |
| POST | `/api/teams/` | Tạo workspace |
| POST | `/api/projects/` | Tạo project |
| GET/POST | `/api/projects/<id>/tasks/` | List/create task |
| PATCH | `/api/tasks/<id>/status/` | Đổi status task |
| PATCH | `/api/tasks/<id>/position/` | Đổi Kanban position |
| POST | `/api/tasks/<id>/schedule/` | Đổi schedule |
| GET/POST | `/api/tasks/<id>/comments/` | List/create comment |
| GET/POST | `/api/tasks/<id>/attachments/` | List/create attachment metadata |
| GET | `/api/tasks/<id>/activity/` | List activity |
| GET | `/api/notifications/` | List notification |
| POST | `/api/users/me/avatar/` | Upload avatar local |
| DELETE | `/api/users/me/avatar/` | Xóa avatar local |

### 12.4 Error code cần chuẩn hóa

- `authentication_required`
- `permission_denied`
- `workspace_required`
- `invalid_status`
- `invalid_priority`
- `invalid_role`
- `invalid_avatar`
- `duplicate_invitation`
- `not_found`
- `validation_error`

## 13. Yêu Cầu Phi Chức Năng

### 13.1 Bảo mật

- Mọi mutation quan trọng yêu cầu authenticated user.
- Không tin `sender_id` từ client.
- Không để viewer thao tác ghi.
- Không expose dữ liệu user khác nếu không có quyền.
- Upload avatar chỉ nhận image mime/extension hợp lệ.

### 13.2 Tin cậy dữ liệu

- DB là nguồn dữ liệu chính.
- Mutation nhiều bước cần transaction.
- Optimistic update trên FE phải rollback khi API lỗi.
- Kéo thả Kanban và timeline dùng field riêng.

### 13.3 Hiệu năng

- Dashboard dùng aggregate hợp lý.
- Endpoint list lớn cần prefetch/annotate.
- PJAX giảm full reload.
- Script page cũ được dọn để tránh chồng event.

### 13.4 Dễ dùng

- Nút chính tối thiểu khoảng 40px.
- Empty state có CTA.
- Form Add Task rút gọn.
- Toast rõ ràng.
- Light mode dễ đọc.

### 13.5 Bảo trì

- Logic nghiệp vụ nằm trong service.
- Permission nằm trong helper.
- API response thống nhất.
- Test khóa các bug quan trọng.

## 14. Acceptance Criteria Tổng

### 14.1 Auth

- User đăng ký thành công.
- User đăng nhập thành công.
- User chưa login bị redirect.

### 14.2 Workspace/Project/Task

- Tạo workspace thành công.
- Tạo project trong workspace.
- Tạo task trong project.
- Reload vẫn giữ dữ liệu.

### 14.3 Permission

- Owner/admin thao tác được.
- Viewer bị chặn.
- Assignee update task được giao.
- User ngoài workspace không truy cập task private.

### 14.4 Kanban/Timeline

- Kanban update `position`.
- Timeline update `row`.
- Hai field không ghi đè sai nhau.

### 14.5 Settings

- Upload avatar hơn 12MB thành công.
- Avatar lưu local.
- Avatar hiển thị lại sau reload.
- Theme sáng/tối giữ sau reload.

### 14.6 Navigation

- Chuyển Dashboard/Workspaces/Team/Files/Settings không full reload.
- Browser back/forward hoạt động.

## 15. UAT Checklist

### UAT-01 - User mới

1. Mở `/login/`.
2. Đăng ký user mới.
3. Vào dashboard.
4. Tạo workspace.
5. Tạo project.
6. Tạo task.
7. Reload và xác nhận dữ liệu còn.

### UAT-02 - Quyền assignee

1. Owner tạo task.
2. Gán member vào task.
3. Member đăng nhập.
4. Member cập nhật task.
5. Hệ thống cho phép.

### UAT-03 - Kanban position

1. Mở project.
2. Kéo task trong Kanban.
3. Reload.
4. Thứ tự task giữ đúng.
5. Timeline row không bị lệch.

### UAT-04 - Avatar

1. Mở Settings.
2. Chọn ảnh khoảng 13MB.
3. Upload.
4. Preview đổi ngay.
5. Kiểm tra file trong `media/avatars/`.
6. Reload và xác nhận avatar còn.

### UAT-05 - Viewer

1. Gán user role viewer.
2. Viewer mở workspace.
3. Viewer thử tạo/sửa/xóa task.
4. Hệ thống chặn.

## 16. Regression Checklist

Backend:

```powershell
cd E:\htdakt\TaskManagement\backend
$env:DB_ENGINE="django.db.backends.sqlite3"
.\.venv\Scripts\python.exe manage.py check
.\.venv\Scripts\python.exe manage.py makemigrations --check --dry-run
.\.venv\Scripts\python.exe manage.py test
```

Frontend syntax:

```powershell
cd E:\htdakt\TaskManagement
node --check frontend\static\js\auth.js
node --check frontend\static\js\pages\dashboard.js
node --check frontend\static\js\pages\timeline.js
node --check frontend\static\js\pages\team.js
node --check frontend\static\js\files.js
node --check frontend\static\js\settings.js
```

Browser smoke:

- Login page có CSS.
- Dashboard hiển thị đúng.
- Workspaces mở đúng.
- Team invite mở đúng.
- Settings upload avatar.
- Theme sáng/tối hoạt động.
- PJAX không lỗi console.

## 17. Rủi Ro Và Giảm Thiểu

| Rủi ro | Ảnh hưởng | Giảm thiểu |
| --- | --- | --- |
| Commit nhầm DB local | Repo nặng, lộ dữ liệu test | Không stage `db.sqlite3`, `task_management` |
| Permission thiếu case | User sửa dữ liệu sai quyền | Test owner/admin/member/viewer/assignee |
| Kanban ghi nhầm row | Timeline lệch | Tách `position` và `row`, có test |
| Avatar local quá lớn | Tốn ổ đĩa local | Giới hạn 25MB, chỉ image |
| Attachment chưa storage thật | Người dùng hiểu nhầm upload file | Ghi rõ hiện là metadata |
| Chat permission thiếu | Lộ hội thoại | Siết room membership |
| UI mobile overlap | Khó thao tác | Test viewport mobile |
| Text encoding cũ | Tài liệu/UI khó đọc | Chuẩn hóa dần file template/docs |

## 18. Roadmap Đề Xuất

### Phase 1 - Baseline ổn định

- Hoàn thiện permission task/project/team.
- Hoàn thiện Kanban position.
- Hoàn thiện avatar local.
- Hoàn thiện BA và project structure.

### Phase 2 - Quality hardening

- Mở rộng test backend.
- Thêm smoke test FE.
- Chuẩn hóa error code.
- Tối ưu query dashboard.

### Phase 3 - Collaboration

- Email invitation thật.
- Notification realtime.
- Chat permission nâng cao.
- Activity timeline rõ hơn.

### Phase 4 - Production readiness

- MySQL staging.
- CI/CD.
- Logging/monitoring.
- Backup/restore.
- File storage thật.

## 19. Open Questions

- Có cần lưu avatar trong DB model profile riêng không?
- Attachment có cần chuyển từ metadata sang file thật không?
- Viewer có được comment task không hay chỉ xem hoàn toàn?
- Member không phải assignee có được cập nhật task không?
- Có cần role tùy chỉnh ngoài owner/admin/member/viewer không?
- Có cần export report cho dashboard không?
- Có cần realtime notification trong phiên bản đầu không?

## 20. Glossary

| Thuật ngữ | Ý nghĩa |
| --- | --- |
| Workspace | Không gian làm việc, tương ứng Team |
| Project | Dự án trong workspace |
| Task | Công việc |
| Assignee | Người được giao task |
| Kanban | Bảng kéo thả theo trạng thái/thứ tự |
| Position | Thứ tự task trong Kanban |
| Row | Dòng hiển thị trên timeline/Gantt |
| Timeline | Giao diện xem task theo thời gian |
| Activity | Lịch sử thao tác |
| Notification | Thông báo |
| PJAX | Chuyển trang bằng fetch/swap nội dung, không full reload |
| Local media | File lưu trên máy chạy localhost |

## 21. Kết Luận

TaskFlow đã có nền tảng tốt cho một công cụ quản lý công việc theo workspace/project/task. Trọng tâm BA hiện tại là giữ dữ liệu thật, quyền đúng, thao tác dễ hiểu và test được các flow quan trọng.

Các điểm đã được đưa vào baseline:

- Workspace/project/task lưu DB.
- Permission assignee được bổ sung.
- Kanban `position` tách khỏi timeline `row`.
- Avatar local upload 25MB.
- Theme sáng/tối.
- Chuyển trang mượt.
- BA và cấu trúc dự án được tài liệu hóa.

Hướng tiếp theo nên tập trung vào test, file storage thật, email invitation và production readiness.
