---
title: "TaskFlow ERD Overview"
type: erd
purpose: "Mo ta mo hinh du lieu tong quan cua TaskFlow, tap trung vao workspace, project, task, comment, attachment, activity, notification va invite."
actors: [User, System, DB]
related_phase: phase-1-strategy
related_files:
  - backend/apps/tasks/models/team.py
  - backend/apps/tasks/models/project.py
  - backend/apps/tasks/models/task.py
  - backend/apps/tasks/models/task_detail.py
  - backend/apps/tasks/models/activity.py
  - backend/apps/tasks/models/favorite.py
  - backend/apps/tasks/models/invitation.py
last_updated: 2026-06-28
status: draft
---

# TaskFlow ERD Overview

ERD nay bam theo cac model hien co trong `backend/apps/tasks/models/`. Luu y: `Task.assignees` va `Task.favorited_by` la many-to-many cua Django; diagram the hien quan he nghiep vu, con bang trung gian do Django tu quan ly.

```mermaid
erDiagram
    AUTH_USER ||--o{ TEAM : owns
    AUTH_USER ||--o{ TEAM_MEMBER : joins
    TEAM ||--o{ TEAM_MEMBER : contains
    TEAM ||--o{ PROJECT : groups
    AUTH_USER ||--o{ PROJECT : creates
    PROJECT ||--o{ PROJECT_MEMBER : contains
    AUTH_USER ||--o{ PROJECT_MEMBER : joins
    PROJECT ||--o{ TASK : contains
    AUTH_USER ||--o{ TASK : creates
    TASK }o--o{ AUTH_USER : assigns
    TASK ||--o{ TASK_COMMENT : receives
    TASK ||--o{ TASK_ATTACHMENT : stores_metadata
    TASK ||--o{ TASK_ACTIVITY : records
    AUTH_USER ||--o{ TASK_COMMENT : writes
    AUTH_USER ||--o{ TASK_ATTACHMENT : uploads_metadata
    AUTH_USER ||--o{ TASK_ACTIVITY : performs
    AUTH_USER ||--o{ NOTIFICATION : receives
    AUTH_USER ||--o{ TASK_FAVORITE : marks
    TASK ||--o{ TASK_FAVORITE : favorited
    AUTH_USER ||--o{ PROJECT_FAVORITE : marks
    PROJECT ||--o{ PROJECT_FAVORITE : favorited
    TEAM ||--o{ TEAM_INVITATION : sends
    AUTH_USER ||--o{ TEAM_INVITATION : invites
    TEAM_INVITATION ||--o{ TEAM_INVITATION_PROJECT : links
    PROJECT ||--o{ TEAM_INVITATION_PROJECT : invited_to

    AUTH_USER {
        int id PK
        string username
        string email
        string password
        bool is_active
        datetime date_joined
    }

    TEAM {
        int id PK
        int owner_id FK
        string name
        text description
        datetime created_at
        datetime updated_at
    }

    TEAM_MEMBER {
        int id PK
        int team_id FK
        int user_id FK
        string role
        string status
        string positions
        datetime joined_at
    }

    PROJECT {
        int id PK
        int user_id FK
        int team_id FK
        string name
        text description
        datetime created_at
    }

    PROJECT_MEMBER {
        int id PK
        int project_id FK
        int user_id FK
        string role
        datetime joined_at
    }

    TASK {
        int id PK
        int user_id FK
        int project_id FK
        string title
        text description
        date due_date
        string status
        string priority
        int position
        float start
        float duration
        int row
        string color
        string category
        datetime created_at
        datetime updated_at
    }

    TASK_COMMENT {
        int id PK
        int task_id FK
        int user_id FK
        text body
        datetime created_at
    }

    TASK_ATTACHMENT {
        int id PK
        int task_id FK
        int user_id FK
        string name
        string size
        datetime created_at
    }

    TASK_ACTIVITY {
        int id PK
        int task_id FK
        int actor_id FK
        string action
        string body
        json metadata
        datetime created_at
    }

    NOTIFICATION {
        int id PK
        int recipient_id FK
        int actor_id FK
        string type
        string body
        string target_type
        string target_id
        datetime read_at
        datetime created_at
    }

    TASK_FAVORITE {
        int id PK
        int user_id FK
        int task_id FK
        datetime created_at
    }

    PROJECT_FAVORITE {
        int id PK
        int user_id FK
        int project_id FK
        datetime created_at
    }

    TEAM_INVITATION {
        int id PK
        int team_id FK
        int invited_by_id FK
        int accepted_by_id FK
        string email
        string role
        uuid token
        string status
        text message
        datetime expires_at
        datetime created_at
        datetime accepted_at
    }

    TEAM_INVITATION_PROJECT {
        int id PK
        int invitation_id FK
        int project_id FK
    }
```
