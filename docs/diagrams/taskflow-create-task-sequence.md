---
title: "TaskFlow Create Task Sequence"
type: sequence
purpose: "Mo ta luong tao task tu thao tac nguoi dung den backend validation, permission, database va response ve giao dien."
actors: [User, System, DB]
related_phase: phase-2-breakdown
related_files:
  - backend/apps/tasks/api/views/projects.py
  - backend/apps/tasks/services/tasks.py
  - backend/apps/tasks/permissions.py
last_updated: 2026-06-28
status: draft
---

# TaskFlow Create Task Sequence

Sequence nay dung cho slide "Luong xu ly tao task". Luong chinh: user gui form, backend kiem tra workspace/project/permission, validate payload, luu task vao database, ghi activity va tra task moi ve frontend.

```mermaid
sequenceDiagram
    actor U as User
    participant FE as Frontend
    participant API as Django API
    participant PERM as Permission helper
    participant SVC as Task service
    participant DB as Database

    U->>FE: Nhap thong tin task
    FE->>API: POST project tasks API
    activate API
    API->>PERM: Kiem tra quyen project
    PERM-->>API: Cho phep hoac tu choi
    alt Khong du quyen
        API-->>FE: ok false, permission_denied
        FE-->>U: Hien thi loi
    else Du quyen
        API->>SVC: create_task payload
        SVC->>SVC: Validate title, status, priority, due date
        SVC->>DB: Insert Task
        DB-->>SVC: Task da tao
        SVC->>DB: Insert TaskActivity
        DB-->>SVC: Activity da ghi
        SVC-->>API: Task payload
        API-->>FE: ok true, data task
        FE-->>U: Hien task tren Kanban/List
    end
    deactivate API
```
