from copy import deepcopy


DASHBOARD_PROJECTS = [
    {
        "id": "website-redesign",
        "initials": "WR",
        "title": "Website Redesign",
        "description": "Refresh the marketing site with clearer funnels, new design system tokens, and faster landing pages.",
        "status": "Active",
        "progress": 76,
        "members": ["SN", "AK", "LM", "TN"],
        "tasks": 42,
        "done": 32,
        "gradientClass": "bg-gradient-to-br from-cyan-400 to-blue-600",
        "due": "May 28",
    },
    {
        "id": "mobile-app-development",
        "initials": "MA",
        "title": "Mobile App Development",
        "description": "Build core mobile task workflows, push notifications, sprint views, and analytics cards.",
        "status": "Active",
        "progress": 58,
        "members": ["HD", "VN", "QD"],
        "tasks": 64,
        "done": 37,
        "gradientClass": "bg-gradient-to-br from-violet-500 to-fuchsia-500",
        "due": "Jun 12",
    },
    {
        "id": "marketing-campaign",
        "initials": "MC",
        "title": "Marketing Campaign",
        "description": "Coordinate launch calendar, paid assets, newsletter copy, and campaign reporting.",
        "status": "Completed",
        "progress": 100,
        "members": ["KP", "MT", "NL", "TA", "HY"],
        "tasks": 38,
        "done": 38,
        "gradientClass": "bg-gradient-to-br from-emerald-500 to-green-500",
        "due": "Completed",
    },
    {
        "id": "user-research",
        "initials": "UR",
        "title": "User Research",
        "description": "Interview power users, synthesize pain points, and score backlog opportunities.",
        "status": "On-hold",
        "progress": 34,
        "members": ["PL", "SN"],
        "tasks": 21,
        "done": 7,
        "gradientClass": "bg-gradient-to-br from-amber-500 to-rose-500",
        "due": "Paused",
    },
    {
        "id": "content-strategy",
        "initials": "CS",
        "title": "Content Strategy",
        "description": "Plan help center structure, onboarding emails, release notes, and product education.",
        "status": "Active",
        "progress": 69,
        "members": ["TH", "BA", "LY"],
        "tasks": 29,
        "done": 20,
        "gradientClass": "bg-gradient-to-br from-cyan-500 to-violet-500",
        "due": "Jun 05",
    },
]

DASHBOARD_UPCOMING_TASKS = [
    {
        "title": "Finalize dashboard wireframes",
        "deadline": "Today, 4:00 PM",
        "priority": "High",
        "assignee": "SN",
        "project": "Website Redesign",
    },
    {
        "title": "Prepare sprint review deck",
        "deadline": "Tomorrow, 9:30 AM",
        "priority": "Medium",
        "assignee": "HD",
        "project": "Mobile App Development",
    },
    {
        "title": "QA onboarding email sequence",
        "deadline": "May 22",
        "priority": "Low",
        "assignee": "LY",
        "project": "Content Strategy",
    },
    {
        "title": "Publish campaign performance notes",
        "deadline": "May 24",
        "priority": "Medium",
        "assignee": "KP",
        "project": "Marketing Campaign",
    },
]

DASHBOARD_NOTIFICATIONS = [
    "Mobile App Development moved 3 tasks to review.",
    "Website Redesign reached 76% completion.",
    "Content Strategy has a new deadline this week.",
]

DASHBOARD_ACTIVITY = [
    "Sarah assigned a high priority task to Website Redesign.",
    "Marketing Campaign was marked completed.",
    "User Research timeline changed to on-hold.",
    "Content Strategy added 4 new documentation tasks.",
]

DASHBOARD_ANALYTICS = {
    "daily": {
        "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        "planned": [7, 9, 8, 11, 10, 5, 6],
        "completed": [5, 8, 7, 9, 12, 4, 5],
    },
    "weekly": {
        "labels": ["W1", "W2", "W3", "W4", "W5"],
        "planned": [38, 42, 47, 44, 50],
        "completed": [31, 39, 41, 46, 48],
    },
    "monthly": {
        "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        "planned": [120, 132, 128, 144, 156, 162],
        "completed": [102, 118, 121, 138, 148, 154],
    },
}

DASHBOARD_STATUS = [
    {"label": "To Do", "value": 18, "color": "#5b8fdc", "dotClass": "bg-blue-400"},
    {"label": "In Progress", "value": 18, "color": "#9b86e8", "dotClass": "bg-violet-400"},
    {"label": "Done", "value": 18, "color": "#34d399", "dotClass": "bg-emerald-400"},
]

PROJECT_TASKS = [
    {
        "id": "development",
        "title": "Development",
        "subtitle": "Hero section build",
        "start": 9.5,
        "duration": 2.25,
        "row": 0,
        "color": "bg-sky-200 border-sky-300",
        "text": "text-slate-950",
        "members": ["MS", "RA", "DN"],
        "category": "Frontend",
        "priority": "Medium",
        "status": "In Progress",
        "owner": "Mostafa",
        "due": "Nov 15",
        "progress": 64,
        "comments": 8,
        "attachments": 3,
    },
    {
        "id": "ux-copywrite",
        "title": "UX Copywrite",
        "subtitle": "Landing page messaging",
        "start": 10.2,
        "duration": 1.75,
        "row": 1,
        "color": "bg-violet-200 border-violet-300",
        "text": "text-slate-950",
        "members": ["AN", "LM"],
        "category": "Content",
        "priority": "Low",
        "status": "To Do",
        "owner": "Anna Lee",
        "due": "Nov 15",
        "progress": 28,
        "comments": 4,
        "attachments": 1,
    },
    {
        "id": "bug-fix",
        "title": "Bug Fix",
        "subtitle": "Responsive issue sweep",
        "start": 12.15,
        "duration": 1.35,
        "row": 2,
        "color": "bg-rose-200 border-rose-300",
        "text": "text-slate-950",
        "members": ["DN", "QA"],
        "category": "QA",
        "priority": "High",
        "status": "Review",
        "owner": "Duy Nguyen",
        "due": "Nov 15",
        "progress": 78,
        "comments": 6,
        "attachments": 2,
    },
    {
        "id": "web-visual-design",
        "title": "Web Visual Design",
        "subtitle": "Final visual direction",
        "start": 13.25,
        "duration": 2.85,
        "row": 1,
        "color": "bg-emerald-200 border-emerald-300",
        "text": "text-slate-950",
        "members": ["MS", "YL", "AK", "SN"],
        "category": "Web Design",
        "priority": "High",
        "status": "Done",
        "owner": "Sarah Nguyen",
        "due": "Nov 15",
        "progress": 96,
        "comments": 15,
        "attachments": 7,
        "featured": True,
    },
]

EXTRA_KANBAN_TASKS = [
    ("design-system-audit", "Design System Audit", "Review spacing and button states", "To Do", "Medium", 18),
    ("analytics-copy-review", "Analytics Copy Review", "Polish chart labels and empty states", "To Do", "Low", 12),
    ("component-cleanup", "Component Cleanup", "Reduce visual weight in cards", "In Progress", "Medium", 52),
    ("mobile-breakpoints", "Mobile Breakpoints", "Check dashboard and timeline widths", "In Progress", "High", 46),
    ("modal-accessibility", "Modal Accessibility", "Keyboard and focus states", "Review", "High", 84),
    ("kanban-density-pass", "Kanban Density Pass", "Tune card height and spacing", "Review", "Medium", 72),
    ("chart-label-fix", "Chart Label Fix", "Connector labels balanced", "Done", "Medium", 100),
    ("invite-flow-check", "Invite Flow Check", "Validate modal and MySQL save", "Done", "Low", 100),
]

for index, (task_id, title, subtitle, status, priority, progress) in enumerate(EXTRA_KANBAN_TASKS):
    PROJECT_TASKS.append(
        {
            "id": task_id,
            "title": title,
            "subtitle": subtitle,
            "start": 9 + index,
            "duration": 1.1,
            "row": index % 3,
            "color": "bg-cyan-200 border-cyan-300",
            "text": "text-slate-950",
            "members": ["SN", "MS"] if index % 2 else ["DN", "QA"],
            "category": "Kanban",
            "priority": priority,
            "status": status,
            "owner": "Sarah Nguyen" if index % 2 else "Mostafa",
            "due": "Nov 17",
            "progress": progress,
            "comments": 3 + index,
            "attachments": index % 4,
            "kanbanOnly": True,
        }
    )

PROJECT_NOTIFICATIONS = [
    "Web Visual Design moved to high priority.",
    "Development is scheduled for 9:30 AM.",
    "UX Copywrite has 4 new comments.",
]

TEAM_MEMBERS = [
    {
        "id": "mostafa",
        "name": "Mostafa Ahmed",
        "role": "Design Lead",
        "status": "online",
        "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
        "messages": [
            {"body": "Can you review the landing page timeline before standup?", "time": "09:32 AM"},
            {"body": "I pushed the visual notes into the shared workspace.", "time": "09:44 AM"},
            {"body": "Looks clean. I will align the hero copy with the final mockup.", "time": "10:05 AM"},
            {"body": "Keep the member cards compact so the chat stays usable on laptop screens.", "time": "10:12 AM"},
            {"body": "The Team page should match the Dashboard shell exactly.", "time": "10:18 AM"},
            {"body": "I will send the invite list after the design review.", "time": "10:24 AM"},
            {"body": "Great. The internal scroll behavior is the main thing to verify.", "time": "10:29 AM"},
        ],
    },
    {
        "id": "sarah",
        "name": "Sarah Nguyen",
        "role": "Product Manager",
        "status": "online",
        "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80",
        "messages": [
            {"body": "The roadmap sync is ready for the team review.", "time": "08:20 AM"},
            {"body": "Please keep the sprint board focused on launch blockers.", "time": "08:36 AM"},
        ],
    },
    {
        "id": "daniel",
        "name": "Daniel Reyes",
        "role": "Frontend Engineer",
        "status": "away",
        "avatar": "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=160&q=80",
        "messages": [
            {"body": "I am wrapping up the responsive pass now.", "time": "11:12 AM"},
            {"body": "The dashboard shell is stable on laptop viewports.", "time": "11:18 AM"},
        ],
    },
]

TEAM_NOTIFICATIONS = [
    "Aisha mentioned you in UX copy updates.",
    "Daniel completed responsive review.",
]


def clone(value):
    return deepcopy(value)
