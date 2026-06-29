---
title: "TaskFlow - Note Hoan Thien Noi Dung Slide"
type: presentation-notes
project: TaskFlow
created: 2026-06-28
last_updated: 2026-06-28
language: vi
status: draft
---

# TaskFlow - Note Hoan Thien Noi Dung Slide

Tai lieu nay ghi lai nhung noi dung can bo sung hoac can chung minh bang demo khi dua 16 slide TaskFlow vao bao cao/thuyet trinh.

## UML/Diagram Da Bo Sung

| Muc dung trong slide | File diagram |
| --- | --- |
| Slide 5-8: doi tuong, chuc nang, phan quyen | `docs/diagrams/taskflow-use-case-overview.md` |
| Slide 9: ERD tong quan | `docs/diagrams/taskflow-erd-overview.md` |
| Slide 10: luong xu ly tao task | `docs/diagrams/taskflow-create-task-sequence.md` |
| Slide 11: luong Kanban | `docs/diagrams/taskflow-kanban-position-flow.md` |

## Note Theo Tung Slide

| Slide | Trang thai noi dung | Can bo sung/hoan thien |
| --- | --- | --- |
| 1. Trang bia | Khung noi dung da co | Dien day du ho ten va MSSV thanh vien nhom. Co the them ten mon hoc, giang vien, lop hoc, nam hoc neu mau truong yeu cau. |
| 2. Muc tieu du an | Noi dung phu hop | Nen them 1 cau ve ket qua mong doi: quan ly task tap trung, giam sot viec, theo doi tien do ro hon. |
| 3. Mo ta du an | Noi dung phu hop | Nen them anh man hinh dashboard/project neu lam slide thuyet trinh. |
| 4. Van de can giai quyet | Noi dung phu hop | Co the them vi du thuc te: nhom lam do an dung chat rời rac nen kho theo doi task. |
| 5. Doi tuong su dung | Da dung voi role hien tai | Can giai thich ngan Owner/Admin/Manager/Member/Viewer khac nhau o quyen nao. Dung diagram use case de minh hoa. |
| 6. Chuc nang chinh | Day du cho baseline | Ghi chu ro `attachment metadata` hien la luu thong tin file, chua phai upload file that cua task. |
| 7. Phan tich yeu cau chuc nang | Phu hop voi BA | Nen tach thanh functional requirements FR-001 den FR-012 neu lam bao cao chi tiet. |
| 8. Yeu cau phi chuc nang | Phu hop | Can them tieu chi do duoc: login bat buoc, role check truoc mutation, du lieu reload khong mat, nut thao tac de bam. |
| 9. Mo hinh ERD tong quan | Da co file UML/ERD | Khi dua vao slide, nen xuat diagram thanh anh PNG/SVG de de nhin. Bang `Attachment` nen ghi la metadata. |
| 10. Luong xu ly tao task | Da co sequence diagram | Can demo hoac screenshot request/response neu muon chung minh backend that. |
| 11. Luong Kanban | Da co flow diagram | Can nhan manh fix da lam: `position` cho Kanban, `row` cho timeline, khong ghi nham. |
| 12. Demo dang ky/dang nhap | Can chuan bi data demo | Can tao san tai khoan demo va tai khoan moi. Neu dung Google OAuth, can dam bao credential local da cau hinh. |
| 13. Demo Workspace va Project | Can chuan bi kich ban demo | Nen dat ten workspace/project ngan, de doc tren slide. Sau khi tao nen reload de chung minh DB luu that. |
| 14. Demo Task va Kanban | Can chuan bi 2 user | Can co owner va assignee de chung minh assignee duoc cap nhat task duoc giao. Nen co them viewer de chung minh bi chan khi sua. |
| 15. Demo Team, Comment, Settings | Mot phan da co baseline | Avatar local da co. Theme sang/toi da co. Invite can xac dinh la luu invitation trong DB; gui email that co the can cau hinh them. Attachment hien la metadata. |
| 16. Cong nghe su dung | Dung voi stack hien tai | Nen ghi ro SQLite dung cho local/test, MySQL la muc tieu moi truong that. Channels/WebSocket hien la baseline realtime, can demo neu dua vao noi dung chinh. |

## Nhung Noi Dung Chua Nen Noi La Hoan Tat 100%

- Email invitation gui that: hien can xac nhan cau hinh email SMTP neu muon demo nhan email that.
- Attachment file storage that cho task: hien noi dung nen ghi la `attachment metadata`, khong noi la upload file that trong task detail neu chua bo sung storage.
- Notification realtime production: co model notification va Channels baseline, nhung can smoke test WebSocket/realtime truoc khi noi la realtime hoan chinh.
- MySQL production: neu demo local dang dung SQLite thi nen noi ro SQLite cho local/test, MySQL la huong moi truong that.
- Google OAuth: chi nen demo neu da co client ID/secret hop le tren may demo.
- Bao cao test frontend tu dong: neu chua co Playwright day du, nen noi la test thu cong/smoke test thay vi automation complete.
- Chat permission/realtime chat: neu chua demo duoc room hop le, nen de o muc baseline hoac roadmap.

## Viec Nen Lam Truoc Khi Thuyet Trinh

1. Dien thong tin thanh vien nhom o slide 1.
2. Chon 1 workspace/project/task mau co ten ngan, de doc.
3. Tao it nhat 3 tai khoan demo: owner, assignee/member, viewer.
4. Chup anh man hinh dashboard, project, Kanban, task detail, settings avatar.
5. Xuat cac Mermaid diagram trong `docs/diagrams/` thanh anh neu PowerPoint khong render Mermaid.
6. Chay lai demo create workspace, create project, create task, drag Kanban, reload.
7. Ghi ro trong slide nhung phan baseline/chua production de tranh bi hoi sau.
