(function () {
  "use strict";

  window.TaskFlow = window.TaskFlow || {};
  const Timeline = window.TaskFlow.Timeline = window.TaskFlow.Timeline || {};

  Timeline.renderers = {
    renderAvatarStack(members, size = "h-6 w-6") {
      return members
        .slice(0, 4)
        .map(
          (member, index) => `
            <span class="grid ${size} place-items-center rounded-full border-2 border-white/80 bg-gradient-to-br from-cyan-300 to-violet-500 text-[0.58rem] font-black text-white ${index ? "-ml-2" : ""}">
              ${Timeline.helpers.escapeHtml(member)}
            </span>
          `
        )
        .join("");
    },

    renderWorkspaceMembers(members = []) {
      const visible = members.slice(0, 3);
      const remaining = Math.max(members.length - visible.length, 0);
      return `
        ${visible
          .map(
            (member) => `
              <span class="inline-grid h-6 w-6 place-items-center rounded-full border-2 border-white/80 bg-gradient-to-br from-cyan-400 to-violet-500 text-[0.56rem] font-black text-white">
                ${Timeline.helpers.escapeHtml(member)}
              </span>
            `
          )
          .join("")}
        ${remaining ? `<span class="inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-white/80 bg-white/10 text-[0.56rem] font-black text-slate-200">+${remaining}</span>` : ""}
      `;
    },

    renderWorkspaceList() {
      if (!Timeline.selectors.workspaceList) return;
      const currentWorkspace = Timeline.helpers.activeWorkspace();
      Timeline.selectors.workspaceCurrentTitle.textContent = Timeline.state.mode === "overview" ? "Project Overview" : (currentWorkspace ? currentWorkspace.name : "No Workspace");
      Timeline.selectors.workspaceList.innerHTML = Timeline.workspaces
        .map((workspace) => {
          const isActive = workspace.id === Timeline.state.activeWorkspaceId;
          const count = Timeline.tasks.filter((task) => task.workspaceId === workspace.id).length;
          return `
            <div class="workspace-group rounded-xl border border-transparent px-1.5 py-1.5 transition ${isActive ? "is-active bg-gradient-to-r from-violet-600/45 to-blue-600/25 text-white shadow-[0_0_18px_rgba(34,211,238,0.08)]" : "text-slate-300 hover:bg-white/8"}">
              <button
                class="flex h-7 w-full items-center justify-between gap-2 rounded-lg px-1.5 text-left"
                type="button"
                data-workspace-overview="${workspace.id}"
              >
                <span class="truncate text-xs font-semibold">${Timeline.helpers.escapeHtml(workspace.name)}</span>
                <span class="rounded-full bg-slate-950/30 px-1.5 py-0.5 text-[0.56rem] font-medium text-cyan-100">${count}</span>
              </button>
              <div class="mt-1 space-y-0.5">
                ${workspace.projects
                  .map((project) => {
                    const isProjectActive = Timeline.state.mode === "detail" && isActive && Timeline.helpers.activeProjectName() === project;
                    const projectCount = Timeline.tasks.filter((task) => task.workspaceId === workspace.id && task.projectName === project).length;
                    return `
                      <button
                        class="flex h-7 w-full items-center justify-between gap-2 rounded-lg px-2 text-left text-[0.68rem] font-medium transition hover:bg-white/10 ${isProjectActive ? "bg-cyan-300/14 text-cyan-100" : "text-slate-400"}"
                        type="button"
                        data-workspace-id="${workspace.id}"
                        data-project-name="${Timeline.helpers.escapeHtml(project)}"
                      >
                        <span class="truncate">${Timeline.helpers.escapeHtml(project)}</span>
                        <span class="text-[0.56rem] font-medium text-slate-500">${projectCount}</span>
                      </button>
                    `;
                  })
                  .join("")}
              </div>
            </div>
          `;
        })
        .join("");
    },

    renderProjectHeader() {
      const workspace = Timeline.helpers.activeWorkspace();
      const projectName = Timeline.helpers.activeProjectName();
      if (!workspace) {
        Timeline.selectors.projectBreadcrumb.textContent = "/ Projects";
        Timeline.selectors.projectCategory.textContent = "";
        Timeline.selectors.projectTitle.textContent = "No Project";
        Timeline.selectors.projectCompany.textContent = "";
        Timeline.selectors.projectDate.textContent = "";
        Timeline.selectors.projectMemberStack.innerHTML = Timeline.renderers.renderWorkspaceMembers([]);
        return;
      }
      Timeline.selectors.projectBreadcrumb.textContent = `${workspace.breadcrumb} / ${workspace.name}`;
      Timeline.selectors.projectCategory.textContent = workspace.category;
      Timeline.selectors.projectTitle.textContent = projectName;
      Timeline.selectors.projectCompany.innerHTML = `<i data-lucide="building-2" class="h-3 w-3"></i> ${Timeline.helpers.escapeHtml(workspace.company)}`;
      Timeline.selectors.projectDate.innerHTML = `<i data-lucide="calendar-days" class="h-3 w-3"></i> ${Timeline.helpers.escapeHtml(workspace.date)}`;
      Timeline.selectors.projectMemberStack.innerHTML = Timeline.renderers.renderWorkspaceMembers(workspace.members);
      Timeline.renderers.refreshIcons();
    },

    renderProjectOverview() {
      if (!Timeline.selectors.projectOverviewPanel) return;
      const totalProjects = Timeline.workspaces.reduce((sum, workspace) => sum + workspace.projects.length, 0);
      const doneTasks = Timeline.tasks.filter((task) => task.status === "Done").length;
      const activeTasks = Timeline.tasks.filter((task) => task.status !== "Done").length;
      const members = new Set(Timeline.workspaces.flatMap((workspace) => workspace.members));
      const statCards = [
        { label: "Workspaces", value: Timeline.workspaces.length, icon: "layers-3", tone: "text-cyan-200 bg-cyan-400/15" },
        { label: "Projects", value: totalProjects, icon: "folder-kanban", tone: "text-violet-200 bg-violet-400/15" },
        { label: "Active Tasks", value: activeTasks, icon: "list-checks", tone: "text-amber-200 bg-amber-400/15" },
        { label: "Team Members", value: members.size, icon: "users-round", tone: "text-emerald-200 bg-emerald-400/15" },
      ];

      Timeline.selectors.projectOverviewStats.innerHTML = statCards
        .map(
          (card) => `
            <article class="rounded-xl border border-white/10 bg-white/[0.055] p-2.5">
              <div class="flex items-center justify-between gap-2">
                <span class="grid h-8 w-8 place-items-center rounded-xl ${card.tone}">
                  <i data-lucide="${card.icon}" class="h-3.5 w-3.5"></i>
                </span>
                <strong class="text-xl font-black text-white">${card.value}</strong>
              </div>
              <p class="mt-1.5 text-[0.68rem] font-bold text-slate-400">${card.label}</p>
            </article>
          `
        )
        .join("");

      Timeline.selectors.overviewWorkspaceCount.textContent = `${Timeline.workspaces.length} groups`;
      Timeline.selectors.projectOverviewCards.innerHTML = Timeline.workspaces
        .map((workspace) => {
          const items = Timeline.helpers.workspaceTasks(workspace.id);
          const progress = Timeline.helpers.completionFor(items);
          return `
            <article class="rounded-xl border border-white/10 bg-white/[0.052] p-2.5 transition hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-white/[0.075] motion-reduce:transform-none">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <p class="text-[0.6rem] font-black uppercase tracking-[0.14em] text-cyan-200">${Timeline.helpers.escapeHtml(workspace.category)}</p>
                  <h3 class="mt-0.5 truncate text-sm font-black text-white">${Timeline.helpers.escapeHtml(workspace.name)}</h3>
                  <p class="mt-0.5 truncate text-[0.66rem] font-semibold text-slate-400">${Timeline.helpers.escapeHtml(workspace.company)} · ${Timeline.helpers.escapeHtml(workspace.date)}</p>
                </div>
                <div class="-space-x-2 whitespace-nowrap scale-90 origin-right">${Timeline.renderers.renderWorkspaceMembers(workspace.members)}</div>
              </div>
              <div class="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                <span class="block h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-500 transition-all duration-700" style="width:${progress}%"></span>
              </div>
              <div class="mt-2 grid gap-1">
                ${workspace.projects
                  .map((project) => {
                    const count = Timeline.helpers.projectTasks(workspace.id, project).length;
                    return `
                      <button class="flex h-8 items-center justify-between gap-2 rounded-lg border border-white/[0.07] bg-slate-950/25 px-2 text-left transition hover:border-cyan-300/25 hover:bg-cyan-300/10" type="button" data-workspace-id="${workspace.id}" data-project-name="${Timeline.helpers.escapeHtml(project)}">
                        <span class="truncate text-[0.72rem] font-black text-white">${Timeline.helpers.escapeHtml(project)}</span>
                        <span class="rounded-full bg-white/10 px-1.5 py-0.5 text-[0.56rem] font-black text-slate-400">${count}</span>
                      </button>
                    `;
                  })
                  .join("")}
              </div>
            </article>
          `;
        })
        .join("");

      Timeline.selectors.projectOverviewRows.innerHTML = Timeline.workspaces
        .flatMap((workspace) => workspace.projects.map((project) => ({ workspace, project, items: Timeline.helpers.projectTasks(workspace.id, project) })))
        .map(
          ({ workspace, project, items }) => `
            <button class="flex h-14 w-full items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.045] px-2.5 text-left transition hover:-translate-y-0.5 hover:border-cyan-300/20 hover:bg-white/[0.075] motion-reduce:transform-none" type="button" data-workspace-id="${workspace.id}" data-project-name="${Timeline.helpers.escapeHtml(project)}">
              <span class="min-w-0">
                <span class="block truncate text-[0.8rem] font-black text-white">${Timeline.helpers.escapeHtml(project)}</span>
                <span class="block truncate text-[0.66rem] font-semibold text-slate-400">${Timeline.helpers.escapeHtml(workspace.name)}</span>
              </span>
              <span class="shrink-0 text-right">
                <span class="block text-xs font-black text-cyan-200">${Timeline.helpers.completionFor(items)}%</span>
                <span class="block text-[0.62rem] font-bold text-slate-500">${items.length} tasks</span>
              </span>
            </button>
          `
        )
        .join("");

      Timeline.renderers.refreshIcons();
    },

    renderHeader() {
      const hours = [];
      for (let hour = Timeline.timelineStart; hour <= Timeline.timelineEnd; hour += 1) {
        hours.push(hour);
      }

      const totalWidth = hours.length * Timeline.scale;
      if (Timeline.selectors.canvas) {
        Timeline.selectors.canvas.style.width = `${totalWidth}px`;
      }

      Timeline.selectors.header.style.gridTemplateColumns = `repeat(${hours.length}, ${Timeline.scale}px)`;
      Timeline.selectors.header.innerHTML = hours
        .map(
          (hour) => `
            <div class="flex flex-col justify-center border-r border-white/10 px-3">
              <span class="text-xs font-extrabold uppercase text-cyan-200">${Timeline.helpers.escapeHtml(Timeline.helpers.getCurrentDateHeaderString())}</span>
              <span class="text-xs font-bold text-white">${Timeline.helpers.timeLabel(hour)}</span>
            </div>
          `
        )
        .join("");

      Timeline.selectors.grid.innerHTML = hours
        .map((_, index) => {
          const left = index * Timeline.scale;
          return `<div class="absolute top-0 bottom-0 border-r border-white/10" style="left:${left}px"></div>`;
        })
        .join("") + `<div class="absolute top-0 bottom-0 border-r border-white/10" style="left:${hours.length * Timeline.scale}px"></div>`;
    },

    renderDayPicker() {
      if (!Timeline.selectors.kanbanDayPicker) return;
      const activeDay = Timeline.state.kanbanDayFilter || "all";
      const todayIso = Timeline.helpers.toIsoDate(new Date());

      Timeline.selectors.kanbanDayPicker.innerHTML = Timeline.helpers.dayPickerOptions()
        .map((option) => {
          const isActive = option.iso === activeDay;
          const isToday = option.iso === todayIso;
          return `
            <button
              class="h-6 shrink-0 rounded-lg px-2 text-[0.62rem] font-black transition ${isActive ? "bg-cyan-300 text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white"}"
              type="button"
              data-calendar-day="${option.iso}"
              aria-pressed="${isActive}"
              title="${option.iso}"
            >
              ${Timeline.helpers.escapeHtml(isToday ? "Today" : option.weekday)} ${Timeline.helpers.escapeHtml(option.day)}
            </button>
          `;
        })
        .join("");

      if (Timeline.selectors.clearKanbanDayFilter) {
        Timeline.selectors.clearKanbanDayFilter.classList.toggle("hidden", activeDay === "all");
      }
    },

    renderTasks(items = Timeline.state.filteredTasks) {
      const timelineItems = items.filter((task) => !task.kanbanOnly);
      Timeline.selectors.taskLayer.innerHTML = timelineItems.length
        ? timelineItems
          .map((task) => {
            const left = (task.start - Timeline.timelineStart) * Timeline.scale;
            const width = task.duration * Timeline.scale;
            const top = task.row * 70 + 8;
            const avatars = Timeline.renderers.renderAvatarStack(task.members);
            const featuredMeta = task.featured
              ? `
              <div class="mt-3 flex flex-wrap items-center gap-1.5">
                <span class="rounded-full bg-white/55 px-2 py-0.5 text-[0.68rem] font-black">${Timeline.helpers.escapeHtml(task.category)}</span>
                <span class="rounded-full bg-rose-500/15 px-2 py-0.5 text-[0.68rem] font-black text-rose-700">${Timeline.helpers.escapeHtml(task.priority)}</span>
                <span class="inline-flex items-center gap-1 rounded-full bg-white/45 px-2 py-0.5 text-[0.68rem] font-black"><i data-lucide="message-square" class="h-3 w-3"></i>${task.comments}</span>
                <span class="inline-flex items-center gap-1 rounded-full bg-white/45 px-2 py-0.5 text-[0.68rem] font-black"><i data-lucide="paperclip" class="h-3 w-3"></i>${task.attachments}</span>
              </div>
            `
              : "";

            return `
            <button
              class="timeline-task absolute rounded-2xl border ${task.color} ${task.text} p-2.5 text-left shadow-[0_14px_34px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_48px_rgba(15,23,42,0.3)] motion-reduce:transform-none"
              type="button"
              draggable="false"
              data-task-id="${task.id}"
              style="left:${left}px; top:${top}px; width:${width}px; min-height:${task.featured ? 96 : 72}px"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <h3 class="truncate text-base font-black">${Timeline.helpers.escapeHtml(task.title)}</h3>
                  <p class="mt-0.5 truncate text-xs font-semibold opacity-70">${Timeline.helpers.escapeHtml(task.subtitle)}</p>
                </div>
                <i data-lucide="grip" class="h-4 w-4 shrink-0 opacity-45"></i>
              </div>
              <div class="mt-2.5 flex items-center justify-between gap-3">
                <div class="flex items-center">${avatars}</div>
                <span class="text-[0.68rem] font-black opacity-65 timeline-task-time">${Timeline.helpers.timeLabel(task.start)}</span>
              </div>
              ${featuredMeta}
              <div class="resize-handle"></div>
            </button>
          `;
          })
          .join("")
        : `
          <div class="absolute left-6 top-6 rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-sm font-semibold text-slate-400">
            No timeline tasks match your search.
          </div>
        `;

      if (Timeline.selectors.searchCount) {
        Timeline.selectors.searchCount.textContent = `${items.length} task${items.length === 1 ? "" : "s"}`;
      }
      Timeline.renderers.refreshIcons();
    },

    renderKanban(items = Timeline.state.filteredTasks) {
      const columns = [
        { name: "To Do", icon: "circle" },
        { name: "In Progress", icon: "loader-circle" },
        { name: "Review", icon: "scan-eye" },
        { name: "Done", icon: "circle-check" },
      ];

      Timeline.selectors.kanbanColumns.innerHTML = columns
        .map((column) => {
          const columnTasks = items.filter((task) => task.status === column.name);
          return `
            <section class="kanban-column flex min-h-0 flex-col rounded-2xl border border-white/[0.07] bg-white/[0.032] p-2.5 transition duration-200" data-column-status="${column.name}">
              <div class="mb-2.5 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="grid h-6 w-6 place-items-center rounded-lg border ${Timeline.helpers.statusTone(column.name)}">
                    <i data-lucide="${column.icon}" class="h-3 w-3"></i>
                  </span>
                  <h3 class="text-sm font-black text-white">${column.name}</h3>
                </div>
                <div class="flex items-center gap-1">
                  <span class="rounded-full bg-white/10 px-2 py-0.5 text-[0.65rem] font-black text-slate-300">${columnTasks.length}</span>
                  <button class="grid h-6 w-6 place-items-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white" type="button" data-add-status="${column.name}" aria-label="Add task to ${column.name}">
                    <i data-lucide="plus" class="h-3.5 w-3.5"></i>
                  </button>
                  <button class="grid h-6 w-6 place-items-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white" type="button" data-column-menu="${column.name}" aria-label="${column.name} actions">
                    <i data-lucide="more-horizontal" class="h-3.5 w-3.5"></i>
                  </button>
                </div>
              </div>
              <div class="kanban-dropzone min-h-0 flex-1 space-y-2 overflow-y-auto pr-1" data-drop-status="${column.name}">
                ${columnTasks.length
              ? columnTasks
                .map(
                  (task) => {
                    const userRole = (Timeline.app.dataset.userRole || "viewer").toLowerCase();
                    const userName = (Timeline.app.dataset.userName || "").toLowerCase();
                    const isManager = ["owner", "admin", "manager"].includes(userRole);
                    const isOwner = task.owner && task.owner.toLowerCase() === userName;
                    const canDrag = isManager || isOwner;

                    const dragAttr = canDrag ? 'draggable="true"' : 'draggable="false" style="cursor: not-allowed;"';
                    const padlockIcon = canDrag ? '' : '<i data-lucide="lock" class="h-3.5 w-3.5 text-slate-400/80 mr-1 inline-block align-middle shrink-0"></i>';

                    return `
                      <article
                        class="group w-full rounded-xl border border-white/[0.07] bg-slate-950/35 p-2.5 text-left shadow-[0_6px_18px_rgba(2,6,23,0.12)] transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/20 hover:bg-white/[0.055] motion-reduce:transform-none"
                        role="button"
                        tabindex="0"
                        ${dragAttr}
                        data-task-id="${task.id}"
                      >
                        <div class="flex items-start justify-between gap-2">
                          <div class="min-w-0 flex-1">
                            <h4 class="truncate text-[0.82rem] font-black text-white flex items-center gap-1">${padlockIcon}${Timeline.helpers.escapeHtml(task.title)}</h4>
                            <p class="mt-0.5 truncate text-[0.68rem] font-semibold text-slate-400">${Timeline.helpers.escapeHtml(task.subtitle)}</p>
                          </div>
                          <div class="flex shrink-0 items-center gap-1">
                            <button class="grid h-6 w-6 place-items-center rounded-lg border transition ${Timeline.helpers.isFavorite(task.id) ? "border-amber-300/30 bg-amber-300/12 text-amber-200" : "border-white/[0.08] bg-white/[0.035] text-slate-500 hover:text-amber-200"}" type="button" data-favorite-task="${task.id}" aria-label="Toggle favorite for ${Timeline.helpers.escapeHtml(task.title)}">
                              <i data-lucide="star" class="h-3.5 w-3.5 ${Timeline.helpers.isFavorite(task.id) ? "fill-current" : ""}"></i>
                            </button>
                            <span class="rounded-full border px-1.5 py-0.5 text-[0.56rem] font-black ${Timeline.helpers.priorityTone(task.priority)}">${Timeline.helpers.escapeHtml(task.priority)}</span>
                          </div>
                        </div>
                        <div class="mt-2.5 h-1 overflow-hidden rounded-full bg-white/[0.07]">
                          <span class="block h-full rounded-full bg-cyan-300/55 transition-all duration-700" style="width:${task.progress}%"></span>
                        </div>
                        <div class="mt-2.5 flex items-center justify-between gap-2">
                          <div class="flex items-center">${Timeline.renderers.renderAvatarStack(task.members, "h-4 w-4")}</div>
                          <div class="flex items-center gap-2 text-[0.62rem] font-bold text-slate-500">
                            <span class="inline-flex items-center gap-1"><i data-lucide="message-square" class="h-3 w-3"></i>${task.comments}</span>
                            <span class="inline-flex items-center gap-1"><i data-lucide="paperclip" class="h-3 w-3"></i>${task.attachments}</span>
                            <span>${Timeline.helpers.escapeHtml(task.due)}</span>
                          </div>
                        </div>
                      </article>
                    `;
                  }
                )
                .join("")
              : `<div class="rounded-2xl border border-dashed border-white/10 p-4 text-center text-xs font-semibold text-slate-500">No tasks</div>`
            }}
              </div>
            </section>
          `;
        })
        .join("");

      Timeline.renderers.refreshIcons();
    },

    renderList(items = Timeline.state.filteredTasks) {
      Timeline.selectors.listRows.innerHTML = items.length
        ? items
          .map(
            (task) => `
                <article
                  class="mb-1.5 grid w-full grid-cols-1 items-center gap-2 rounded-xl border border-white/[0.065] bg-white/[0.032] px-3 py-2 text-left transition duration-200 hover:-translate-y-px hover:border-cyan-300/20 hover:bg-white/[0.06] hover:shadow-[0_8px_20px_rgba(2,6,23,0.12)] motion-reduce:transform-none lg:grid-cols-[minmax(340px,2.2fr)_minmax(150px,0.8fr)_minmax(120px,0.65fr)_minmax(150px,0.75fr)_minmax(90px,0.45fr)] lg:gap-4"
                  role="button"
                  tabindex="0"
                  draggable="true"
                  data-task-id="${task.id}"
                >
                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <button class="grid h-7 w-7 shrink-0 place-items-center rounded-lg border transition ${Timeline.helpers.isFavorite(task.id) ? "border-amber-300/30 bg-amber-300/12 text-amber-200" : "border-white/[0.08] bg-white/[0.035] text-slate-500 hover:text-amber-200"}" type="button" data-favorite-task="${task.id}" aria-label="Toggle favorite for ${Timeline.helpers.escapeHtml(task.title)}">
                        <i data-lucide="star" class="h-3.5 w-3.5 ${Timeline.helpers.isFavorite(task.id) ? "fill-current" : ""}"></i>
                      </button>
                      <span class="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-cyan-300/75 to-violet-500/80 text-[0.68rem] font-black text-white">${Timeline.helpers.escapeHtml(task.title.slice(0, 2).toUpperCase())}</span>
                      <span class="min-w-0">
                        <span class="block truncate text-[0.82rem] font-black text-white">${Timeline.helpers.escapeHtml(task.title)}</span>
                        <span class="block truncate text-[0.68rem] font-semibold text-slate-400">${Timeline.helpers.escapeHtml(task.subtitle)}</span>
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center justify-between gap-3 lg:block lg:min-w-0">
                    <span class="text-xs font-bold text-slate-500 lg:hidden">Owner</span>
                    <div class="flex items-center gap-2">
                      <div class="flex items-center">${Timeline.renderers.renderAvatarStack(task.members.slice(0, 2), "h-4 w-4")}</div>
                      <span class="truncate text-[0.72rem] font-bold text-slate-300">${Timeline.helpers.escapeHtml(task.owner)}</span>
                    </div>
                  </div>
                  <div class="flex items-center justify-between gap-3 lg:block">
                    <span class="text-xs font-bold text-slate-500 lg:hidden">Status</span>
                    <span class="inline-flex rounded-full border px-2 py-0.5 text-[0.62rem] font-black ${Timeline.helpers.statusTone(task.status)}">${Timeline.helpers.escapeHtml(task.status)}</span>
                  </div>
                  <div class="flex items-center justify-between gap-3 lg:block">
                    <span class="text-xs font-bold text-slate-500 lg:hidden">Schedule</span>
                    <span class="text-[0.72rem] font-bold text-slate-300">${Timeline.helpers.escapeHtml(task.due)} · ${Timeline.helpers.timeLabel(task.start)}</span>
                  </div>
                  <div class="flex items-center justify-between gap-3 lg:justify-end">
                    <span class="text-xs font-bold text-slate-500 lg:hidden">Progress</span>
                    <span class="text-right text-[0.82rem] font-black text-white">${task.progress}%</span>
                  </div>
                </article>
              `
          )
          .join("")
        : `<div class="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm font-semibold text-slate-500">No list tasks match your filter.</div>`;

      Timeline.renderers.refreshIcons();
    },

    renderTaskViews(items = Timeline.state.filteredTasks) {
      Timeline.renderers.renderDayPicker();
      Timeline.renderers.renderTasks(items);
      Timeline.renderers.renderKanban(items);
      Timeline.renderers.renderList(items);
    },

    renderNotifications() {
      if (!Timeline.selectors.notificationList) return;
      Timeline.selectors.notificationList.innerHTML = Timeline.notifications
        .map(
          (message) => `
            <div class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
              <span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan-400/15 text-cyan-200">
                <i data-lucide="activity" class="h-4 w-4"></i>
              </span>
              <p class="text-sm leading-5 text-slate-300">${Timeline.helpers.escapeHtml(message)}</p>
            </div>
          `
        )
        .join("");
    },

    refreshIcons() {
      if (window.lucide) window.lucide.createIcons();
    }
  };
})();
