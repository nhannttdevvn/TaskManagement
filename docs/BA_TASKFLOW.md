# BA TaskFlow - Business Analysis Specification

Ngay cap nhat: 2026-06-28
Branch tong hop: feature/backend-core
Phien ban tai lieu: 1.0

## 1. Executive summary

TaskFlow la ung dung quan ly cong viec theo mo hinh Workspace -> Project -> Task. San pham tap trung vao nhom nho, team san pham, team van hanh hoac lop hoc/nhom do an can mot noi de tao workspace, quan ly project, chia task, theo doi tien do, trao doi qua comment/chat va nhan notification.

Huong cai tien hien tai:

- Giu stack hien co: Django views/templates, vanilla JavaScript, Tailwind CSS local build.
- Tang do tin cay du lieu: workspace/project/task/team/favorite/comment/attachment/activity/notification duoc backed by DB.
- Giam su phu thuoc vao fallback demo/localStorage cho du lieu nghiep vu.
- Lam flow nguoi dung de thao tac hon: card co the click, nut chinh ro, form Add Task gon, empty state co CTA, mutation co feedback.
- Tang do chac cua backend: service layer, permission, validation, transaction va API response nhat quan.
- Nang trai nghiem FE: theme sang/toi, logo moi, click target lon hon, PJAX navigation de chuyen trang muot khong full reload.

Ket qua ky vong:

- User moi co the dang ky, tao workspace, tao project, tao task va reload van thay du lieu.
- Owner/admin moi member, quan ly role, thao tac project/task dung quyen.
- Viewer chi xem, khong tao/sua/xoa du lieu.
- Task detail hien comment, attachment, activity that tu DB.
- Dashboard va project data khong tao du lieu ngam khi user chi GET.
- UI light mode de doc, khong bi choi text accent tren nen sang.

## 2. Problem statement

Truoc khi toi uu, du an co mot so diem manh nhung chua dong bo hoan toan:

- FE co UI kha day du nhung mot so flow can nhieu click, nut nho, empty state chua du CTA truc tiep.
- Mot so du lieu nghiep vu tung co fallback local/demo, gay lech voi DB.
- Backend da bat dau co model/service that nhung can siết permission, validation va response contract.
- Task detail, notification, activity, favorite, comment, attachment can duoc noi that voi DB va test reload.
- Trang login co luc mat CSS neu asset local/Tailwind build chua on dinh.
- Chuyen trang truyen thong tao cam giac load lai va mat tinh lien mach cua app.
- Light mode co cac mau cyan/violet qua sang tren nen trang, lam text hoi choi.

Du an can duoc dua ve mot baseline production-ready hon: du lieu that, quyen dung, UI de bam, feedback ro, routing muot, tai lieu BA ro rang de tiep tuc tong hop.

## 3. Business goals

### 3.1 Muc tieu ngan han

- Cho phep user tao workspace/project/task bang du lieu that.
- Bao dam cac thao tac quan trong co permission va validation.
- Cai thien UX de user tao task/project nhanh hon.
- Loai bo fallback demo cho du lieu nghiep vu.
- Chuan hoa API response de FE xu ly loi tot hon.
- Hoan thien tai lieu BA va cau truc xương song du an.

### 3.2 Muc tieu trung han

- Bo sung test backend cho permission, validation, activity, notification va chat.
- Chay on dinh voi MySQL trong moi truong staging/production.
- Bo sung email invitation that va file storage that.
- Dua smoke test FE vao quy trinh regression.
- Toi uu query cho dashboard/project list lon.

### 3.3 KPI de do thanh cong

- User moi hoan thanh flow signup -> create workspace -> create project -> create task trong duoi 3 phut.
- Reload sau moi mutation khong mat du lieu.
- 100% mutation quan trong tra response `ok=true/false` nhat quan.
- Viewer bi chan voi code `permission_denied` o cac API tao/sua/xoa.
- Dashboard/project/team GET khong tu sinh workspace/demo data.
- Light/dark mode khong co text qua choi hoac contrast thap tren cac man hinh chinh.

## 4. Stakeholders

- Product Owner: xac dinh muc tieu san pham, uu tien tinh nang va tieu chi nghiem thu.
- Business Analyst: tong hop flow, rule, acceptance criteria, API/data contract va backlog.
- Developer FE: xay UI, state, feedback, PJAX routing va responsive.
- Developer BE: xay model, service, permission, validation, API, notification/activity.
- QA/Tester: test flow user, permission, regression va responsive.
- End user: owner/admin/member/viewer trong workspace.

## 5. User roles

| Role | Mo ta | Quyen chinh |
| --- | --- | --- |
| Owner | Nguoi tao workspace | Quan ly workspace, project, task, invite, member, activity |
| Admin | Thanh vien co quyen quan tri workspace | Tao/sua/xoa project/task, invite member trong workspace |
| Manager | Role theo project | Quan ly project/task trong project duoc gan |
| Member | Thanh vien thao tac hang ngay | Xem workspace/project, tao/cap nhat task neu duoc phep |
| Viewer | Nguoi chi xem | Xem du lieu, khong tao/sua/xoa/invite |
| Guest/Unauthenticated | Chua dang nhap | Chi truy cap login/signup, bi redirect khi vao app |

## 6. Personas

### 6.1 Workspace Owner

- Can tao nhanh workspace/project.
- Can moi thanh vien va phan quyen.
- Can nhin tong quan so task, status, tien do va activity.
- Can tranh viec member thao tac sai pham vi.

### 6.2 Project Member

- Can xem task duoc giao.
- Can doi status/schedule, comment, attachment metadata.
- Can feedback ro khi thao tac thanh cong/loi.
- Can UI nhanh, it load lai, de click tren mobile.

### 6.3 Viewer/Stakeholder

- Can xem tien do va activity.
- Khong can quyen sua.
- Can du lieu dung voi DB, khong bi demo/fallback lam sai so lieu.

## 7. Scope

### 7.1 Trong pham vi hien tai

- Authentication: login, signup, logout.
- Dashboard: analytics, workspace overview, status/task counts, empty state.
- Workspace: tao, chon, mo workspace; workspace duoc map voi Team.
- Project: tao project theo workspace, project card click de mo timeline.
- Task: create/update/delete, status, schedule, priority, due date, favorite.
- Task detail: comment, attachment metadata, activity.
- Team: member list, invite, role, friends, chat permission baseline.
- Notification: list, mark read, tao notification cho cac action chinh.
- Activity: ghi lich su task/project/team action.
- FE UX: toolbar, empty state, toast, optimistic update, inline confirm, click target.
- Theme: light/dark mode, logo moi, mau light mode de doc.
- Navigation: PJAX routing cho link noi bo de chuyen trang muot khong reload full page.
- Docs: BA chi tiet va cau truc xương song du an.

### 7.2 Ngoai pham vi hien tai

- Payment/billing/subscription.
- Email delivery that cho invitation.
- Upload binary file len cloud storage.
- Mobile app native.
- DRF rewrite toan bo API.
- React/Vue SPA rewrite.
- Realtime collaborative editing day du.
- Audit log compliance cap enterprise.

## 8. Assumptions

- Du an tiep tuc dung Django function/class views va template.
- FE tiep tuc dung vanilla JavaScript, khong chuyen framework.
- Local dev co the chay SQLite override; production/staging co the dung MySQL.
- Attachment hien tai la metadata, chua phai binary storage.
- LocalStorage chi dung cho theme, active workspace/project, filter/sort.
- Data nghiep vu uu tien DB.
- Cac URL public hien co duoc giu de tranh pha FE.

## 9. Constraints

- Khong redesign toan bo UI.
- Khong doi URL lon neu khong can.
- API can tuong thich nguoc voi FE hien tai.
- Viewer/admin/member role phai duoc validate truoc khi ghi DB.
- GET endpoint khong tao du lieu ngam.
- Chat WebSocket khong tin `sender_id` tu client.

## 10. Product modules

### 10.1 Authentication

Muc dich:

- Cho user dang ky, dang nhap, dang xuat.
- Bao ve cac route app phia sau login.
- Dam bao login page co CSS local va responsive.

Yeu cau:

- Signup gom full name, email, password.
- Login bang email/username va password.
- Logout khong can PJAX, co the full navigation.
- Route app khi chua dang nhap redirect ve login voi `next`.
- Login page khong phu thuoc Tailwind CDN runtime.

Acceptance criteria:

- `/login/` hien dung layout va style.
- Signup thanh cong vao dashboard.
- `/dashboard/`, `/project/`, `/team/` khi chua login bi redirect.

### 10.2 Dashboard

Muc dich:

- Cho user nhin nhanh workspace, project, task va status.
- Tao diem bat dau cho user moi.

Yeu cau:

- Hien user greeting, workspace list, analytics, status overview.
- Neu chua co workspace, hien empty state va CTA `Create first workspace`.
- Dashboard data lay tu DB theo user/workspace.
- Khong tu tao Default Workspace khi GET data.
- CTA `Create Workspace` va `Open Workspace` chuyen dung man.

Acceptance criteria:

- User moi thay 0 workspace, 0 project, 0 task.
- Tao workspace xong dashboard cap nhat va reload van con.
- So lieu khong dung demo sai DB.

### 10.3 Workspace

Muc dich:

- Gom project/task/team theo khong gian lam viec.
- Workspace hien tai duoc map voi model `Team`.

Yeu cau:

- Tao workspace qua `POST /api/teams/`.
- Tao workspace phai tao owner member trong transaction.
- Workspace card click de mo/chon.
- Active workspace duoc luu localStorage chi nhu preference.
- Neu user chua co workspace, project page hien CTA `Add Workspace`.

Acceptance criteria:

- Tao workspace xong hien ngay.
- Reload van giu workspace trong DB.
- User khac khong xem/sua workspace khong co quyen.

### 10.4 Project

Muc dich:

- Nhom task theo muc tieu/du an trong workspace.

Yeu cau:

- Project thuoc workspace.
- Neu user co nhieu workspace, create project can co `workspace_id`.
- Neu user chi co mot workspace, backend co the tu gan workspace de giu tuong thich.
- Ten project unique trong workspace theo rule hien tai.
- Project card click de mo timeline.
- Project favorite luu DB.

Acceptance criteria:

- Create project trong active workspace khong can chon lai workspace.
- Reload van thay project.
- User khong co quyen bi chan.
- Thieu workspace khi can thiet tra `workspace_required`.

### 10.5 Task

Muc dich:

- Quan ly cong viec theo status, priority, due date, schedule va assignee.

Yeu cau:

- Add Task form mac dinh chi hien: Title, Status, Priority, Due date.
- More details gom: Description, Owner, Progress, schedule nang cao.
- Task tu gan project active khi user dang o project detail.
- Task co the hien trong timeline, kanban, list, calendar.
- Doi status/schedule luu DB.
- Delete task co confirm nhe va rollback neu API loi.
- Task favorite luu DB.

Validation:

- Status phai thuoc choices.
- Priority phai thuoc choices.
- Due date nhan ISO `YYYY-MM-DD`.
- `start >= 0`.
- `duration >= 0.25`.
- `row >= 0`.

Acceptance criteria:

- Tao task xong reload van con.
- Drag/drop status xong reload van giu.
- Resize/move schedule xong reload van giu.
- Favorite task xong reload van giu.
- User khong co quyen khong sua/xoa duoc.

### 10.6 Task detail

Muc dich:

- Cho user xem day du thong tin task, comment, attachment metadata va activity.

Yeu cau:

- Task detail load comments tu `/api/tasks/<id>/comments/`.
- Task detail load activity tu `/api/tasks/<id>/activity/`.
- Task detail load attachments tu `/api/tasks/<id>/attachments/`.
- Upload hien tai luu attachment metadata that, khong mock.
- Comment/attachment tao activity va notification.

Acceptance criteria:

- Them comment xong reload detail van thay.
- Them attachment metadata xong reload detail van thay.
- Viewer/nguoi ngoai project bi chan khi thao tac.

### 10.7 Team, invite, friends, chat

Muc dich:

- Ho tro lam viec nhom trong workspace.

Yeu cau:

- Owner/admin moi member.
- Role hop le: owner/admin/member/viewer hoac mapping tu UI.
- Khong invite trung pending email trong cung workspace.
- Invitation co token, status, expiry va optional project links.
- Friend request dung model Friendship.
- Chat dung ChatMessage.
- WebSocket chat chi cho authenticated user.
- Sender lay tu `scope["user"]`, khong tin payload client.

Acceptance criteria:

- Owner/admin invite duoc.
- Viewer bi chan voi `permission_denied`.
- Invite trung tra `duplicate_invitation`.
- User khong lien quan khong connect room chat.

### 10.8 Notification

Muc dich:

- Bao cho user ve thay doi quan trong trong project/task/team.

Yeu cau:

- Notification gom recipient, actor, type, body, target_type, target_id, read_at, created_at.
- List lay DB, khong mock.
- Mark read cap nhat `read_at`.
- Tao notification cho invite, comment, attachment, task update quan trong.

Acceptance criteria:

- Notification reload van con.
- Mark read xong notification hien read.
- API tra dung shape `{ ok, data }`.

### 10.9 Activity

Muc dich:

- Theo doi lich su thao tac tren task/project/team.

Yeu cau:

- TaskActivity gom task, actor, action, body/metadata, created_at.
- Ghi activity cho create/update/delete task, status/schedule, comment, attachment.
- Invite/add/remove member ghi activity/notification phu hop.

Acceptance criteria:

- Task detail hien activity theo DB.
- Delete task co activity truoc/sau thao tac theo service.

### 10.10 Settings and Files

Muc dich:

- Cho user quan ly profile/preferences/team permission va xem khu vuc files.

Yeu cau:

- Settings co theme switch va preference forms.
- Files hien folder/recent file UI, hien tai co the dung data UI/local demo neu chua co backend file storage.
- Cac link Workspaces phai tro ve route chinh `/project/`.
- Nut nho co click target khoang 40px.

Acceptance criteria:

- Settings/Files chuyen trang muot bang PJAX.
- Workspaces link dua ve `/project/`, khong lech `/timeline/`.
- Light mode text khong choi.

## 11. Navigation and UI behavior

### 11.1 PJAX routing

Muc dich:

- Chuyen trang noi bo muot, khong full reload.

Yeu cau:

- Intercept link noi bo cung origin.
- Bo qua logout/login/admin/download/external link.
- Fetch HTML moi voi header `X-Requested-With: TaskFlow-PJAX`.
- Swap `#pjax-container`.
- Update title, body class, URL, history.
- Re-run vendor/extra scripts cua page moi.
- Re-init lucide icons.
- Clear timers/listeners page cu de tranh chong event.
- Back/forward browser van doi noi dung dung.

Acceptance criteria:

- Click Dashboard/Team/Files/Settings/Workspaces khong full reload.
- URL va title dung.
- Root app dung xuat hien.
- Console khong co error.

### 11.2 Theme light/dark

Muc dich:

- Cho user chon giao dien sang/toi.
- Dam bao contrast de doc.

Yeu cau:

- Theme luu localStorage.
- Light mode dung nen sang, panel trang trong, border nhe.
- Text accent cyan/violet/emerald/amber/rose duoc lam dam hon de khong choi.
- Dark mode giu phong cach hien tai.

Acceptance criteria:

- Bam theme toggle doi theme.
- Reload van giu theme.
- Light mode khong co text cyan qua nhat tren nen trang.

### 11.3 Click target and feedback

Yeu cau:

- Nut chinh toi thieu khoang 40px.
- Card workspace/project/task co the click de mo.
- Icon phu co tooltip/aria-label phu hop.
- Mutation co toast: Saving, Saved, Failed/restored.
- Delete co confirm nhe.

Acceptance criteria:

- Mobile khong overlap nut/text.
- User thay ro action dang xu ly hay da loi.

## 12. Functional requirements matrix

| ID | Requirement | Priority | Acceptance |
| --- | --- | --- | --- |
| FR-001 | User dang ky tai khoan moi | Must | Signup thanh cong va redirect dashboard |
| FR-002 | User dang nhap/dang xuat | Must | Route app yeu cau auth, logout hoat dong |
| FR-003 | Dashboard lay data DB | Must | User moi thay empty state, khong demo sai |
| FR-004 | Tao workspace | Must | Tao Team + TeamMember owner trong transaction |
| FR-005 | Tao project theo workspace | Must | Project gan dung workspace, reload van con |
| FR-006 | Tao task rut gon | Must | Add Task form co truong can thiet va luu DB |
| FR-007 | Doi status task | Must | Status reload van giu va co activity |
| FR-008 | Doi schedule task | Must | Start/duration/row valid va reload van giu |
| FR-009 | Delete task | Must | Confirm, xoa DB, rollback neu loi |
| FR-010 | Favorite task/project | Should | Reload van giu favorite |
| FR-011 | Comment task | Must | Comment luu DB, tao activity/notification |
| FR-012 | Attachment metadata | Should | Metadata luu DB, hien lai trong detail |
| FR-013 | Invite member | Must | Owner/admin invite, duplicate bi chan |
| FR-014 | Permission viewer | Must | Viewer khong tao/sua/xoa |
| FR-015 | Notification list/read | Should | List DB, mark read cap nhat read_at |
| FR-016 | Chat permission | Should | Auth + room hop le moi connect |
| FR-017 | PJAX navigation | Should | Link noi bo chuyen muot, back/forward dung |
| FR-018 | Theme light/dark | Should | Reload van giu theme, text de doc |

## 13. Non-functional requirements

### 13.1 Security

- Tat ca API mutation yeu cau authenticated user.
- Permission tach o `permissions.py`.
- Service layer la noi xu ly business rule.
- Viewer chi xem.
- Actor/sender lay tu request/scope user, khong tin client.
- Error response khong leak thong tin nhay cam.

### 13.2 Reliability

- GET endpoint khong tao du lieu ngam.
- Mutation nhieu buoc dung transaction.
- FE rollback khi optimistic update loi.
- LocalStorage khong la source of truth cho du lieu nghiep vu.

### 13.3 Performance

- Dashboard aggregate theo DB query hop ly.
- Project/task list dung prefetch/annotate khi co comments/attachments/activity.
- PJAX chi swap content chinh, giam full reload.
- Script page cu duoc don de tranh memory/event leak.

### 13.4 Usability

- Nut chinh ro, de bam.
- Empty state co CTA truc tiep.
- Toast ro trang thai.
- Mobile khong overlap.
- Light mode khong choi text.

### 13.5 Maintainability

- API response co contract chung.
- Service/helper tach logic khoi view.
- Docs duoc cap nhat theo flow.
- Test backend cover permission/validation/core flow.

## 14. Data model summary

| Model | Vai tro |
| --- | --- |
| User | Tai khoan Django auth |
| Team | Workspace |
| TeamMember | Thanh vien workspace va role |
| TeamInvitation | Loi moi workspace |
| TeamInvitationProject | Link invitation voi project |
| Project | Project trong workspace/user |
| ProjectMember | Member va role theo project |
| ProjectFavorite | Favorite project theo user |
| Task | Cong viec theo project/status/schedule |
| TaskFavorite | Favorite task theo user |
| TaskComment | Comment theo task |
| TaskAttachment | Attachment metadata theo task |
| TaskActivity | Lich su thao tac theo task |
| Notification | Thong bao DB theo recipient |
| Friendship | Quan he ban be |
| ChatMessage | Tin nhan chat |

## 15. API contract

### 15.1 Success response

```json
{
  "ok": true,
  "data": {}
}
```

### 15.2 Error response

```json
{
  "ok": false,
  "error": "Message",
  "code": "permission_denied",
  "details": {}
}
```

### 15.3 Main endpoints

| Method | Endpoint | Muc dich |
| --- | --- | --- |
| GET | `/api/dashboard/data/` | Lay dashboard data |
| GET | `/api/project/data/` | Lay workspace/project/task data |
| GET | `/api/team/data/` | Lay team/friend/chat data |
| POST | `/api/teams/` | Tao workspace |
| POST | `/api/projects/` | Tao project |
| GET/POST | `/api/projects/<id>/tasks/` | List/create task theo project |
| POST | `/api/tasks/<id>/status/` | Doi status task |
| POST | `/api/tasks/<id>/schedule/` | Doi schedule task |
| GET/POST | `/api/tasks/<id>/comments/` | List/create comment |
| GET/POST | `/api/tasks/<id>/attachments/` | List/create attachment metadata |
| GET | `/api/tasks/<id>/activity/` | List task activity |
| GET | `/api/notifications/` | List notification |

### 15.4 Error codes

- `workspace_required`
- `permission_denied`
- `invalid_status`
- `invalid_priority`
- `invalid_role`
- `duplicate_invitation`
- `not_found`
- `validation_error`
- `unauthorized`

## 16. Permission matrix

| Action | Owner | Admin | Manager | Member | Viewer |
| --- | --- | --- | --- | --- | --- |
| View workspace | Yes | Yes | Yes | Yes | Yes |
| Manage workspace | Yes | Yes | No | No | No |
| Invite member | Yes | Yes | No | No | No |
| Create project | Yes | Yes | Optional | No/Optional | No |
| Edit/delete project | Yes | Yes | Yes if assigned | No | No |
| View project | Yes | Yes | Yes | Yes if member | Yes if member |
| Create task | Yes | Yes | Yes | Yes if allowed | No |
| Edit task | Yes | Yes | Yes | Yes if allowed | No |
| Delete task | Yes | Yes | Yes | No/Optional | No |
| Comment task | Yes | Yes | Yes | Yes | No/Optional |
| Attachment metadata | Yes | Yes | Yes | Yes | No/Optional |
| Favorite | Yes | Yes | Yes | Yes | Yes |
| Chat | Yes | Yes | Yes | Yes if relationship valid | No/Optional |

Note: "Optional" phu thuoc rule cuoi cung trong service layer.

## 17. Business rules

- BR-001: Workspace chi duoc tao qua mutation, khong tu tao trong GET.
- BR-002: Workspace owner duoc tao TeamMember role owner.
- BR-003: Project phai thuoc workspace neu user co nhieu workspace.
- BR-004: Project name khong trung trong workspace theo contract hien tai.
- BR-005: Viewer khong duoc tao/sua/xoa project/task/invite.
- BR-006: Status task phai thuoc choices.
- BR-007: Priority task phai thuoc choices.
- BR-008: Due date nhan ISO `YYYY-MM-DD`.
- BR-009: Schedule khong nhan start/duration/row am, duration toi thieu 0.25.
- BR-010: Invite email phai hop le.
- BR-011: Khong tao invitation pending trung email trong cung workspace.
- BR-012: Chat sender phai lay tu authenticated user.
- BR-013: Comment/attachment chi cho user co quyen trong workspace/project.
- BR-014: Favorite la theo user, reload phai giu.
- BR-015: Notification/activity duoc ghi cho thao tac quan trong.
- BR-016: LocalStorage khong duoc lam source of truth cho task/project/workspace.

## 18. Main user flows

### 18.1 New user onboarding

1. User mo `/login/`.
2. Chon signup.
3. Nhap full name, email, password.
4. Tao tai khoan.
5. He thong dua user vao dashboard.
6. Dashboard hien empty state vi chua co workspace.
7. User bam `Create first workspace`.
8. Tao workspace.
9. Tao project trong workspace.
10. Tao task dau tien.
11. Reload van thay workspace/project/task.

### 18.2 Create workspace and project

1. User mo Workspaces.
2. Bam `Add Workspace`.
3. Nhap workspace name.
4. Backend tao Team + TeamMember owner.
5. UI hien workspace moi.
6. User bam `Create Project`.
7. Backend tao project gan active workspace.
8. UI mo project/timeline.

### 18.3 Task lifecycle

1. User mo project.
2. Bam `Add Task`.
3. Nhap title/status/priority/due date.
4. Backend validate va tao task.
5. UI hien task trong view active.
6. User drag/drop doi status hoac schedule.
7. FE optimistic update.
8. Backend luu DB va ghi activity.
9. Neu loi, FE rollback va toast `Failed, restored`.

### 18.4 Invite member

1. Owner/admin mo Team hoac Project.
2. Bam Invite.
3. Nhap email va role.
4. Backend validate role/email/duplicate.
5. Tao TeamInvitation.
6. Tao notification/activity.
7. UI hien invitation/member status.

### 18.5 Task detail collaboration

1. User click task card.
2. Modal detail load comments, attachments, activity.
3. User them comment hoac attachment metadata.
4. Backend validate permission.
5. Luu DB, tao activity va notification.
6. Reload detail van hien du lieu.

### 18.6 Smooth navigation

1. User dang o Workspaces.
2. Bam Dashboard/Team/Files/Settings.
3. PJAX fetch HTML moi.
4. Content doi voi animation nhe.
5. URL/title/history cap nhat.
6. User bam Back cua browser va man hinh quay lai dung.

## 19. UAT scenarios

### 19.1 Auth

- Signup user moi.
- Login lai user cu.
- Logout.
- Truy cap `/project/` khi chua login.

### 19.2 Workspace/project/task

- User moi thay empty dashboard.
- Tao workspace dau tien.
- Tao project dau tien.
- Tao task bang form rut gon.
- Reload trang va xac nhan data con.

### 19.3 Permission

- User A tao workspace/project/task.
- User B khong co quyen khong xem/sua/xoa duoc.
- Viewer khong tao project/task/invite.
- Owner/admin thao tac duoc.

### 19.4 Task detail

- Them comment.
- Them attachment metadata.
- Xem activity.
- Reload detail va xac nhan data con.

### 19.5 Navigation/theme

- Doi light/dark.
- Reload va xac nhan theme giu.
- Click qua Dashboard/Team/Files/Settings/Workspaces.
- Back/forward browser dung.
- Light mode text khong choi.

## 20. Regression checklist

Backend:

- `backend/.venv/Scripts/python.exe manage.py check`
- `backend/.venv/Scripts/python.exe manage.py makemigrations --check --dry-run`
- `backend/.venv/Scripts/python.exe manage.py test`

Frontend/static:

- `node --check frontend/static/js/core/theme.js`
- `node --check frontend/static/js/pages/dashboard.js`
- `node --check frontend/static/js/pages/timeline.js`
- `node --check frontend/static/js/pages/team.js`
- `node --check frontend/static/js/files.js`
- `node --check frontend/static/js/settings.js`

Manual browser smoke:

- Login page render dung CSS.
- Dashboard empty state.
- Create workspace.
- Create project.
- Add task.
- Drag/drop/favorite/delete.
- Task detail comment/activity/attachment.
- Team invite.
- PJAX navigation.
- Mobile viewport.

## 21. Release checklist

- Confirm branch: `feature/backend-core`.
- Khong commit DB local: `db.sqlite3`, `task_management`.
- Migrations hop le va co the migrate.
- Requirements cap nhat.
- Static CSS/JS khong loi syntax.
- Docs BA va structure cap nhat.
- Browser smoke pass.
- Push len origin.

## 22. Risks and mitigation

| Risk | Impact | Mitigation |
| --- | --- | --- |
| DB local bi commit | Lam repo nang, lech du lieu | Khong stage `db.sqlite3` va file DB local |
| Permission thieu case | User xem/sua du lieu sai | Them tests owner/admin/member/viewer |
| Chat room sai quyen | Lo thong tin chat | Validate authenticated user va relationship |
| Attachment chua storage that | User hieu nham upload file | Ghi ro hien la metadata, roadmap storage |
| Demo/local fallback con sot | Du lieu sai voi DB | Audit localStorage/demo data |
| Query dashboard cham | UX cham khi data lon | Prefetch/annotate/aggregate |
| PJAX script leak | Event bi chong | Clear timer/listener, re-run script theo page |
| Light mode contrast kem | Kho doc | Central design tokens va visual QA |

## 23. Roadmap de xuat

### Phase 1 - Baseline ready

- Hoan thien service/permission cho task/project/team.
- Hoan thien activity/notification DB.
- Fix UI flow, light/dark, PJAX.
- BA + project structure docs.

### Phase 2 - Quality hardening

- Backend tests permission/validation/core API.
- Smoke tests FE bang Playwright.
- Query optimization.
- Error monitoring/logging baseline.

### Phase 3 - Collaboration depth

- Email invitation provider.
- File storage that.
- Chat/presence nang cao.
- Activity timeline nang cao.

### Phase 4 - Production readiness

- MySQL staging.
- CI regression.
- Deployment config.
- Backup/restore.
- Basic analytics.

## 24. Glossary

- Workspace: Khong gian lam viec, map voi Team.
- Project: Du an trong workspace.
- Task: Cong viec trong project.
- Owner: Nguoi so huu workspace.
- Admin: Nguoi co quyen quan tri workspace.
- Member: Thanh vien thao tac hang ngay.
- Viewer: Nguoi chi xem.
- Activity: Lich su thao tac.
- Notification: Thong bao cho user.
- PJAX: Cach chuyen trang bang fetch/swap content de khong full reload.
- Source of truth: Noi du lieu chinh thuc duoc luu, trong du an nay la DB.
