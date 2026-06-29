---
title: "TaskFlow Use Case Overview"
type: flowchart
purpose: "Tong hop actor va cac nhom chuc nang chinh cua TaskFlow de dung cho slide doi tuong su dung, chuc nang chinh va phan quyen."
actors: [User, Admin, System, DB]
related_phase: phase-1-strategy
related_files:
  - docs/BA_TASKFLOW.md
  - backend/apps/tasks/permissions.py
last_updated: 2026-06-28
status: draft
---

# TaskFlow Use Case Overview

So do nay the hien cac vai tro nghiep vu chinh va nhom chuc nang ma moi vai tro su dung trong TaskFlow. Trong diagram, `Owner`, `Admin`, `Manager`, `Member`, `Viewer` la role nghiep vu trong ung dung; `System` va `DB` dai dien cho backend va database.

```mermaid
flowchart LR
    Owner[Owner quan ly workspace]
    AdminRole[Admin ho tro quan tri]
    Manager[Manager dieu phoi project]
    Member[Member cap nhat task]
    Viewer[Viewer xem tien do]

    Auth[Dang ky va dang nhap]
    Workspace[Quan ly workspace]
    Project[Quan ly project]
    Task[Quan ly task]
    Kanban[Keo tha Kanban]
    Timeline[Timeline va schedule]
    Team[Thanh vien va invite]
    Detail[Comment va attachment metadata]
    Profile[Profile, avatar, theme]
    Activity[Notification va activity]

    Permission{Kiem tra quyen}
    Api[Django API va service layer]
    Database[(Database)]

    Owner --> Auth
    Owner --> Workspace
    Owner --> Project
    Owner --> Team
    Owner --> Task

    AdminRole --> Workspace
    AdminRole --> Project
    AdminRole --> Team
    AdminRole --> Task

    Manager --> Project
    Manager --> Task
    Manager --> Kanban
    Manager --> Timeline

    Member --> Task
    Member --> Kanban
    Member --> Detail

    Viewer --> Project
    Viewer --> Activity

    Auth --> Api
    Workspace --> Permission
    Project --> Permission
    Team --> Permission
    Task --> Permission
    Kanban --> Permission
    Timeline --> Permission
    Detail --> Permission
    Profile --> Api
    Activity --> Api

    Permission -->|du quyen| Api
    Permission -->|bi chan| Activity
    Api --> Database

    classDef user fill:#3b82f6,stroke:#1e40af,color:#fff
    classDef admin fill:#f59e0b,stroke:#b45309,color:#fff
    classDef cmsdev fill:#6d28d9,stroke:#4c1d95,color:#fff
    classDef system fill:#64748b,stroke:#334155,color:#fff
    classDef db fill:#10b981,stroke:#047857,color:#fff
    classDef external fill:#e11d48,stroke:#9f1239,color:#fff

    class Owner,Manager,Member,Viewer user
    class AdminRole admin
    class Permission,Api,Auth,Workspace,Project,Task,Kanban,Timeline,Team,Detail,Profile,Activity system
    class Database db
```
