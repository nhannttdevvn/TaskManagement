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
            <span class="grid ${size} place-items-center rounded-full border-2 border-slate-950 bg-gradient-to-br from-cyan-300 to-violet-500 text-[0.58rem] font-black text-white ${index ? "-ml-2" : ""}">
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
              <span class="inline-grid h-6 w-6 place-items-center rounded-full border-2 border-slate-950 bg-gradient-to-br from-cyan-400 to-violet-500 text-[0.56rem] font-black text-white">
                ${Timeline.helpers.escapeHtml(member)}
              </span>
            `
          )
          .join("")}
        ${remaining ? `<span class="inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-950 bg-white/10 text-[0.56rem] font-black text-slate-200">+${remaining}</span>` : ""}
      `;
    },

    renderWorkspaceList() {
      if (!Timeline.selectors.workspaceList) return;
      const currentWorkspace = Timeline.helpers.activeWorkspace();
      Timeline.selectors.workspaceCurrentTitle.textContent = Timeline.state.mode === "overview" ? "Project Overview" : (currentWorkspace ? currentWorkspace.name : "No Workspace");
      const workspaceItems = Timeline.workspaces
        .map((workspace) => {
          const isActive = workspace.id === Timeline.state.activeWorkspaceId;
          const count = Timeline.tasks.filter((task) => task.workspaceId === workspace.id).length;
          const projects = Array.isArray(workspace.projects) ? workspace.projects : [];
          const canManage = Timeline.helpers.canManageWorkspace(workspace);
          const roleLabel = Timeline.helpers.roleLabel(Timeline.helpers.workspaceRole(workspace));
          return `
            <div class="rounded-2xl px-2.5 py-2 transition ${isActive ? "border border-white/12 bg-white/12 text-white shadow-[0_0_20px_rgba(34,211,238,0.08)]" : "text-slate-300"}">
              <button
                class="flex min-h-10 w-full items-center justify-between gap-2 rounded-xl px-2 text-left"
                type="button"
                data-workspace-overview="${workspace.id}"
              >
                <span class="truncate text-sm font-bold">${Timeline.helpers.escapeHtml(workspace.name)}</span>
                <span class="rounded-full bg-slate-950/35 px-1.5 py-0.5 text-[0.58rem] font-black text-cyan-100">${count}</span>
              </button>
              <div class="ml-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.56rem] font-black uppercase tracking-wide ${canManage ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100" : "border-white/10 bg-white/[0.04] text-slate-400"}">
                <i data-lucide="${canManage ? "shield-check" : "lock"}" class="h-3 w-3"></i>
                ${Timeline.helpers.escapeHtml(roleLabel)}
              </div>
              <div class="mt-2 space-y-1">
                ${projects
                  .map((project) => {
                    const isProjectActive = Timeline.state.mode === "detail" && isActive && Timeline.helpers.activeProjectName() === project;
                    const projectCount = Timeline.tasks.filter((task) => task.workspaceId === workspace.id && task.projectName === project).length;
                    return `
                      <button
                        class="flex min-h-10 w-full items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-left text-[0.72rem] font-bold transition hover:bg-white/10 ${isProjectActive ? "bg-cyan-300/14 text-cyan-100" : "text-slate-400"}"
                        type="button"
                        data-workspace-id="${workspace.id}"
                        data-project-name="${Timeline.helpers.escapeHtml(project)}"
                      >
                        <span class="truncate">${Timeline.helpers.escapeHtml(project)}</span>
                        <span class="text-[0.58rem] text-slate-500">${projectCount}</span>
                      </button>
                    `;
                  })
                  .join("")}
              </div>
            </div>
          `;
        })
        .join("");

      const emptyState = Timeline.workspaces.length
        ? ""
        : `
          <div class="rounded-2xl border border-dashed border-white/10 bg-white/[0.035] px-3 py-4 text-center">
            <p class="text-xs font-semibold text-slate-400">No workspace yet</p>
            <p class="mt-1 text-[0.68rem] text-slate-500">Create one to store real projects and tasks.</p>
          </div>
        `;

      const addCard = `
        <button
          class="group flex w-full items-center gap-3 rounded-2xl border border-dashed border-cyan-300/25 bg-cyan-300/[0.06] px-3 py-2.5 text-left text-cyan-100 transition hover:border-cyan-200/45 hover:bg-cyan-300/[0.12]"
          type="button"
          data-add-workspace
        >
          <span class="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-cyan-300/15 text-cyan-100 transition group-hover:bg-cyan-300/25">
            <i data-lucide="plus" class="h-4 w-4"></i>
          </span>
          <span class="min-w-0">
            <span class="block truncate text-sm font-black">Add workspace</span>
            <span class="block truncate text-[0.68rem] font-semibold text-slate-400">Create a shared project group</span>
          </span>
        </button>
      `;

      Timeline.selectors.workspaceList.innerHTML = `${emptyState}${workspaceItems}${addCard}`;
      Timeline.renderers.refreshIcons();
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
        if (Timeline.selectors.projectPermissionBadge) {
          Timeline.selectors.projectPermissionBadge.className = "inline-flex min-h-8 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-2.5 text-[0.65rem] font-black text-slate-300";
          Timeline.selectors.projectPermissionBadge.innerHTML = `<i data-lucide="shield" class="h-3.5 w-3.5"></i> ${Timeline.helpers.roleLabel()}`;
        }
        if (Timeline.selectors.timelinePermissionHint) {
          Timeline.selectors.timelinePermissionHint.textContent = "Select a workspace";
        }
        Timeline.selectors.projectMemberStack.innerHTML = Timeline.renderers.renderWorkspaceMembers([]);
        Timeline.renderers.refreshIcons();
        return;
      }
      const canManage = Timeline.helpers.canManageWorkspace(workspace);
      const roleLabel = Timeline.helpers.roleLabel(Timeline.helpers.workspaceRole(workspace));
      Timeline.selectors.projectBreadcrumb.textContent = `${workspace.breadcrumb} / ${workspace.name}`;
      Timeline.selectors.projectCategory.textContent = workspace.category;
      Timeline.selectors.projectTitle.textContent = projectName;
      Timeline.selectors.projectCompany.innerHTML = `<i data-lucide="building-2" class="h-3 w-3"></i> ${Timeline.helpers.escapeHtml(workspace.company)}`;
      Timeline.selectors.projectDate.innerHTML = `<i data-lucide="calendar-days" class="h-3 w-3"></i> ${Timeline.helpers.escapeHtml(workspace.date)}`;
      if (Timeline.selectors.projectPermissionBadge) {
        Timeline.selectors.projectPermissionBadge.className = `inline-flex min-h-8 items-center gap-1.5 rounded-xl border px-2.5 text-[0.65rem] font-black ${canManage ? "border-emerald-300/20 bg-emerald-400/12 text-emerald-100" : "border-amber-300/20 bg-amber-400/10 text-amber-100"}`;
        Timeline.selectors.projectPermissionBadge.innerHTML = `<i data-lucide="${canManage ? "shield-check" : "lock"}" class="h-3.5 w-3.5"></i> ${Timeline.helpers.escapeHtml(roleLabel)}`;
        Timeline.selectors.projectPermissionBadge.title = Timeline.helpers.permissionSummary(workspace);
      }
      if (Timeline.selectors.timelinePermissionHint) {
        Timeline.selectors.timelinePermissionHint.textContent = canManage ? "Can manage workspace" : "Limited access";
        Timeline.selectors.timelinePermissionHint.className = `rounded-full border px-2.5 py-1 font-bold ${canManage ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-200" : "border-amber-300/20 bg-amber-400/10 text-amber-200"}`;
        Timeline.selectors.timelinePermissionHint.title = Timeline.helpers.permissionSummary(workspace);
      }
      if (Timeline.selectors.workspaceInviteButton) {
        Timeline.selectors.workspaceInviteButton.disabled = !canManage;
        Timeline.selectors.workspaceInviteButton.classList.toggle("opacity-45", !canManage);
        Timeline.selectors.workspaceInviteButton.classList.toggle("cursor-not-allowed", !canManage);
        Timeline.selectors.workspaceInviteButton.title = canManage ? "Invite members" : "Only owners and admins can invite members";
      }
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

      // Workspace filtering
      const activeWsId = Timeline.state.activeWorkspaceId;
      const selectedWorkspace = activeWsId ? Timeline.workspaces.find(w => String(w.id) === String(activeWsId) || String(w.databaseId) === String(activeWsId)) : null;
      
      const workspacesToRender = selectedWorkspace ? [selectedWorkspace] : Timeline.workspaces;

      // Update overview header text and render a back button if filtered
      const overviewTitle = Timeline.selectors.projectOverviewPanel.querySelector("h1");
      const overviewSub = Timeline.selectors.projectOverviewPanel.querySelector("p.max-w-2xl");
      if (overviewTitle) {
        if (selectedWorkspace) {
          overviewTitle.innerHTML = `
            <div class="flex flex-wrap items-center gap-3">
              <span>${Timeline.helpers.escapeHtml(selectedWorkspace.name)} Workspace</span>
              <button id="clearWorkspaceFilter" class="inline-flex min-h-10 items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 text-[0.62rem] font-bold text-slate-300 transition hover:bg-white/10 hover:text-white" type="button">
                <i data-lucide="arrow-left" class="h-3 w-3"></i> View All Workspaces
              </button>
            </div>
          `;
          overviewSub.textContent = `Viewing projects inside ${selectedWorkspace.name}. Click a project card to view its timeline and tasks.`;
        } else {
          overviewTitle.textContent = "All project workspaces";
          overviewSub.textContent = "Open a project under each workspace to manage timeline, kanban, and task ownership.";
        }
      }

      Timeline.selectors.overviewWorkspaceCount.textContent = `${workspacesToRender.length} group${workspacesToRender.length === 1 ? "" : "s"}`;
      Timeline.selectors.projectOverviewCards.innerHTML = workspacesToRender
        .map((workspace) => {
          const items = Timeline.helpers.workspaceTasks(workspace.id);
          const meta = Timeline.helpers.completionMeta(items);
          const progress = meta.progress;
          const canManage = Timeline.helpers.canManageWorkspace(workspace);
          const addProjectButton = `
            <button
              class="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition ${canManage ? "hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-white" : "cursor-not-allowed opacity-45"}"
              type="button"
              data-create-project-in-workspace="${workspace.id}"
              title="${canManage ? "Add Project to Workspace" : "Only owners and admins can add projects"}"
              ${canManage ? "" : "disabled"}
            >
              <i data-lucide="${canManage ? "plus" : "lock"}" class="h-3.5 w-3.5"></i>
            </button>
          `;
          return `
            <article class="rounded-xl border border-white/10 bg-white/[0.052] p-2.5 transition hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-white/[0.075] motion-reduce:transform-none">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0 cursor-pointer select-none group/ws" data-workspace-card-select="${workspace.id}" title="Filter by this workspace">
                  <p class="text-[0.6rem] font-black uppercase tracking-[0.14em] text-cyan-200 group-hover/ws:text-cyan-300 transition-colors">${Timeline.helpers.escapeHtml(workspace.category)}</p>
                  <h3 class="mt-0.5 truncate text-sm font-black text-white group-hover/ws:text-cyan-100 transition-colors">${Timeline.helpers.escapeHtml(workspace.name)}</h3>
                  <p class="mt-0.5 truncate text-[0.66rem] font-semibold text-slate-400 group-hover/ws:text-slate-300 transition-colors">${Timeline.helpers.escapeHtml(workspace.company)} &middot; ${Timeline.helpers.escapeHtml(workspace.date)}</p>
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                  ${addProjectButton}
                  <div class="-space-x-2 whitespace-nowrap scale-90 origin-right">${Timeline.renderers.renderWorkspaceMembers(workspace.members)}</div>
                </div>
              </div>
              <div class="mt-2 flex items-center justify-between text-[0.64rem] font-black text-slate-400">
                <span>${meta.done}/${meta.total} done</span>
                <span class="${progress === 100 ? "text-emerald-200" : "text-cyan-200"}">${progress}%</span>
              </div>
              <div class="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                <span class="block h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-500 transition-all duration-700" style="width:${progress}%"></span>
              </div>
              <div class="mt-2 grid gap-1">
                ${workspace.projects.length > 0
                  ? workspace.projects
                      .map((project) => {
                        const count = Timeline.helpers.projectTasks(workspace.id, project).length;
                        return `
                          <button class="flex min-h-10 items-center justify-between gap-2 rounded-lg border border-white/[0.07] bg-slate-950/25 px-2 text-left transition hover:border-cyan-300/25 hover:bg-cyan-300/10" type="button" data-workspace-id="${workspace.id}" data-project-name="${Timeline.helpers.escapeHtml(project)}">
                            <span class="truncate text-[0.72rem] font-black text-white">${Timeline.helpers.escapeHtml(project)}</span>
                            <span class="rounded-full bg-white/10 px-1.5 py-0.5 text-[0.56rem] font-black text-slate-400">${count}</span>
                          </button>
                        `;
                      })
                      .join("")
                  : `
                      <div class="mt-1 text-center py-3.5 px-2 rounded-xl border border-dashed border-white/12 bg-slate-950/20">
                        <p class="text-[0.66rem] font-bold text-slate-400 mb-2">No projects in this workspace</p>
                        <button
                          class="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-3 text-[0.68rem] font-bold text-white transition ${canManage ? "bg-gradient-to-r from-violet-600 to-cyan-500 hover:brightness-110" : "cursor-not-allowed bg-white/10 opacity-55"}"
                          type="button"
                          data-create-project-in-workspace="${workspace.id}"
                          ${canManage ? "" : "disabled"}
                        >
                          <i data-lucide="${canManage ? "plus" : "lock"}" class="h-3 w-3"></i>
                          ${canManage ? "Create Project" : "No create access"}
                        </button>
                      </div>
                    `
                }
              </div>
            </article>
          `;
        })
        .join("");

      Timeline.selectors.projectOverviewRows.innerHTML = workspacesToRender
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

    renderProjectsView() {
      const projectsViewContainer = document.getElementById("projectsView");
      if (!projectsViewContainer || projectsViewContainer.classList.contains("hidden")) return;

      const workspace = Timeline.helpers.activeWorkspace();
      if (!workspace) return;
      const canManage = Timeline.helpers.canManageWorkspace(workspace);

      const projectsListContent = document.getElementById("projectsListContent");
      if (!projectsListContent) return;

      if (!workspace.projects || workspace.projects.length === 0) {
        projectsListContent.innerHTML = `
          <div class="rounded-2xl border border-dashed border-white/12 bg-white/[0.025] px-4 py-10 text-center">
            <p class="text-xs text-slate-400 font-bold mb-3">No projects in this workspace yet</p>
            <button class="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-black text-white transition ${canManage ? "bg-gradient-to-r from-violet-600 to-cyan-500 hover:brightness-110" : "cursor-not-allowed bg-white/10 opacity-55"}" type="button" data-create-project-in-workspace="${workspace.id}" ${canManage ? "" : "disabled"}>
              <i data-lucide="${canManage ? "plus" : "lock"}" class="h-4 w-4"></i> ${canManage ? "Create First Project" : "No create access"}
            </button>
          </div>
        `;
        if (Timeline.selectors.projectActionHint) {
          Timeline.selectors.projectActionHint.textContent = canManage
            ? "Overview of all projects and their progress in this workspace."
            : "Read-only view. Ask an owner/admin to create projects.";
        }
        Timeline.renderers.refreshIcons();
        return;
      }

      // Render projects list
      projectsListContent.innerHTML = workspace.projects
        .map((project) => {
          const projectName = typeof project === "object" && project
            ? (project.title || project.name || project.label || "Untitled Project")
            : String(project || "Untitled Project");
          const projectMembers = typeof project === "object" && project && Array.isArray(project.members)
            ? project.members
            : [];
          const tasks = Timeline.helpers.projectTasks(workspace.id, projectName);
          const meta = Timeline.helpers.completionMeta(tasks);
          const progress = meta.progress;
          const doneCount = meta.done;
          const projectStatus = Timeline.helpers.projectStatusFromProgress(progress);
          const dateRange = Timeline.helpers.projectScheduleDates(workspace, projectName, tasks).label;
          const members = Array.from(new Set([
            ...tasks.flatMap((task) => task.members || []),
            ...projectMembers,
            ...(workspace.members || []),
          ])).slice(0, 6);
          const taskLabel = `${tasks.length} ${tasks.length === 1 ? "Task" : "Tasks"}`;
          const completedLabel = `${doneCount} Completed`;

          return `
            <article class="flex min-h-[11rem] flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] via-white/[0.03] to-cyan-300/[0.035] p-4 shadow-[0_14px_34px_rgba(2,6,23,0.18)] transition hover:border-cyan-300/20 hover:bg-white/[0.06] sm:p-5">
              <div class="flex min-w-0 items-start justify-between gap-4">
                <div class="min-w-0">
                  <h5 class="truncate text-base font-black text-white sm:text-lg">${Timeline.helpers.escapeHtml(projectName)}</h5>
                  <div class="mt-2 flex flex-wrap items-center gap-2">
                    <span class="inline-flex items-center rounded-full border px-2.5 py-1 text-[0.62rem] font-extrabold ${Timeline.helpers.statusTone(projectStatus)}">${projectStatus} &middot; ${progress}%</span>
                  </div>
                </div>
                <span class="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-slate-950/30 px-3 py-1.5 text-[0.72rem] font-black text-slate-300">
                  <i data-lucide="calendar-days" class="h-3.5 w-3.5 text-cyan-200"></i>
                  ${Timeline.helpers.escapeHtml(dateRange)}
                </span>
              </div>
              <div class="mt-4">
                <div class="mb-2 flex items-center justify-between gap-3 text-[0.74rem] font-bold text-slate-400">
                  <span>${taskLabel} &bull; ${completedLabel}</span>
                  <span class="hidden text-white sm:inline">${progress}%</span>
                </div>
                <div class="h-2.5 overflow-hidden rounded-full border border-white/[0.06] bg-white/10">
                  <div class="h-full rounded-full bg-gradient-to-r ${progress === 100 ? "from-emerald-300 to-cyan-300" : "from-cyan-300 to-violet-500"} shadow-[0_0_18px_rgba(34,211,238,0.22)] transition-all duration-700" style="width:${progress}%"></div>
                </div>
              </div>
              <div class="mt-4 flex items-center justify-between gap-3">
                <div class="-space-x-1.5 flex min-w-0 items-center">${Timeline.renderers.renderWorkspaceMembers(members)}</div>
                <button class="min-h-10 shrink-0 rounded-xl border border-white/10 bg-white/5 px-4 text-[0.68rem] font-bold text-slate-300 transition hover:bg-white/10 hover:text-white" type="button" data-workspace-id="${workspace.id}" data-project-name="${Timeline.helpers.escapeHtml(projectName)}">
                  View Tasks
                </button>
              </div>
            </article>
          `;
        })
        .join("");

      const activeCreateButton = document.querySelector("[data-create-project-in-workspace-active]");
      if (activeCreateButton) {
        activeCreateButton.disabled = !canManage;
        activeCreateButton.classList.toggle("opacity-45", !canManage);
        activeCreateButton.classList.toggle("cursor-not-allowed", !canManage);
        activeCreateButton.title = canManage ? "Add project" : "Only owners and admins can add projects";
      }
      if (Timeline.selectors.projectActionHint) {
        Timeline.selectors.projectActionHint.textContent = canManage
          ? "Overview of all projects and their progress in this workspace."
          : "Read-only view. Ask an owner/admin to create projects or invite members.";
      }

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
              class="min-h-10 shrink-0 rounded-lg px-3 text-[0.62rem] font-black transition ${isActive ? "bg-cyan-300 text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white"}"
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
            const taskProgress = Timeline.helpers.taskProgress(task);
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
              <div class="mt-2 flex items-center gap-1.5">
                <div class="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-950/20">
                  <span class="block h-full rounded-full bg-cyan-300/70 transition-all duration-700" style="width:${taskProgress}%"></span>
                </div>
                <span class="shrink-0 text-[0.6rem] font-black opacity-70">${taskProgress}%</span>
              </div>
              ${featuredMeta}
              <div class="resize-handle"></div>
            </button>
          `;
          })
          .join("")
        : `
          <div class="absolute left-6 top-6 rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-sm font-semibold text-slate-400">
            <p>No timeline tasks match your search.</p>
            <button class="mt-3 inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 bg-gradient-to-r from-violet-600 to-cyan-500 px-4 text-xs font-black text-white" type="button" data-add-status="To Do">
              <i data-lucide="plus" class="h-4 w-4"></i>
              Add first task
            </button>
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
          const canManageWorkspace = Timeline.helpers.canManageWorkspace();
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
                  <button class="grid h-10 w-10 place-items-center rounded-xl text-slate-400 transition ${canManageWorkspace ? "hover:bg-white/10 hover:text-white" : "cursor-not-allowed opacity-45"}" type="button" data-add-status="${column.name}" aria-label="Add task to ${column.name}" title="${canManageWorkspace ? "Add task" : "Only owners and admins can add tasks"}" ${canManageWorkspace ? "" : "disabled"}>
                    <i data-lucide="${canManageWorkspace ? "plus" : "lock"}" class="h-4 w-4"></i>
                  </button>
                  <button class="grid h-10 w-10 place-items-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-white" type="button" data-column-menu="${column.name}" aria-label="${column.name} actions" title="Column actions">
                    <i data-lucide="more-horizontal" class="h-4 w-4"></i>
                  </button>
                </div>
              </div>
              <div class="kanban-dropzone min-h-0 flex-1 space-y-2 overflow-y-auto pr-1" data-drop-status="${column.name}">
                ${columnTasks.length
              ? columnTasks
                .map(
                  (task) => {
                    const canDrag = Timeline.helpers.canEditTask(task);
                    const taskProgress = Timeline.helpers.taskProgress(task);

                    const dragAttr = canDrag ? 'draggable="true"' : 'draggable="false" style="cursor: not-allowed;"';
                    const padlockIcon = canDrag ? '' : '<i data-lucide="lock" class="h-3.5 w-3.5 text-slate-400/80 mr-1 inline-block align-middle shrink-0"></i>';

                    return `
                      <article
                        class="group w-full min-w-0 rounded-xl border border-white/[0.07] bg-slate-950/35 p-2.5 text-left shadow-[0_6px_18px_rgba(2,6,23,0.12)] transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/20 hover:bg-white/[0.055] motion-reduce:transform-none"
                        role="button"
                        tabindex="0"
                        ${dragAttr}
                        data-task-id="${task.id}"
                      >
                        <div class="flex items-start justify-between gap-2">
                          <div class="min-w-0 flex-1">
                            <h4 class="flex min-w-0 items-center gap-1 truncate text-[0.82rem] font-black text-white">${padlockIcon}<span class="truncate">${Timeline.helpers.escapeHtml(task.title)}</span></h4>
                            <p class="mt-0.5 truncate text-[0.68rem] font-semibold text-slate-400">${Timeline.helpers.escapeHtml(task.subtitle)}</p>
                          </div>
                          <div class="flex shrink-0 items-center gap-1">
                            <button class="grid h-10 w-10 place-items-center rounded-xl border transition ${Timeline.helpers.isFavorite(task.id) ? "border-amber-300/30 bg-amber-300/12 text-amber-200" : "border-white/[0.08] bg-white/[0.035] text-slate-500 hover:text-amber-200"}" type="button" data-favorite-task="${task.id}" aria-label="Toggle favorite for ${Timeline.helpers.escapeHtml(task.title)}" title="Favorite">
                              <i data-lucide="star" class="h-4 w-4 ${Timeline.helpers.isFavorite(task.id) ? "fill-current" : ""}"></i>
                            </button>
                            <span class="rounded-full border px-1.5 py-0.5 text-[0.56rem] font-black ${Timeline.helpers.priorityTone(task.priority)}">${Timeline.helpers.escapeHtml(task.priority)}</span>
                          </div>
                        </div>
                        <div class="mt-2.5 h-1 overflow-hidden rounded-full bg-white/[0.07]">
                          <span class="block h-full rounded-full bg-cyan-300/55 transition-all duration-700" style="width:${taskProgress}%"></span>
                        </div>
                        <div class="mt-1 flex items-center justify-between gap-2 text-[0.6rem] font-black text-slate-500">
                          <span>Progress</span>
                          <span class="text-cyan-100">${taskProgress}%</span>
                        </div>
                        <div class="mt-2.5 flex items-center justify-between gap-2">
                          <div class="flex items-center">${Timeline.renderers.renderAvatarStack(task.members, "h-4 w-4")}</div>
                          <div class="min-w-0 flex items-center gap-2 text-[0.62rem] font-bold text-slate-500">
                            <span class="inline-flex items-center gap-1"><i data-lucide="message-square" class="h-3 w-3"></i>${task.comments}</span>
                            <span class="inline-flex items-center gap-1"><i data-lucide="paperclip" class="h-3 w-3"></i>${task.attachments}</span>
                            <span class="truncate">${Timeline.helpers.escapeHtml(task.due)}</span>
                          </div>
                        </div>
                      </article>
                    `;
                  }
                )
                .join("")
              : `<div class="rounded-2xl border border-dashed border-white/10 p-4 text-center text-xs font-semibold text-slate-500">
                  <p>No tasks</p>
                  <button class="mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/15 px-3 text-xs font-black transition ${canManageWorkspace ? "bg-white/8 text-cyan-100 hover:bg-white/12" : "cursor-not-allowed bg-white/5 text-slate-500 opacity-60"}" type="button" data-add-status="${column.name}" ${canManageWorkspace ? "" : "disabled"}>
                    <i data-lucide="${canManageWorkspace ? "plus" : "lock"}" class="h-4 w-4"></i>
                    ${canManageWorkspace ? "Add task" : "Read only"}
                  </button>
                </div>`
            }}
              </div>
            </section>
          `;
        })
        .join("");

      Timeline.renderers.refreshIcons();
    },

    renderList(items = Timeline.state.filteredTasks) {
      const canManage = Timeline.helpers.canManageWorkspace();
      Timeline.selectors.listRows.innerHTML = items.length
        ? items
          .map(
            (task) => {
              const taskProgress = Timeline.helpers.taskProgress(task);
              return `
                <article
                  class="mb-1.5 grid w-full grid-cols-1 items-center gap-2 rounded-xl border border-white/[0.065] bg-white/[0.032] px-3 py-2 text-left transition duration-200 hover:-translate-y-px hover:border-cyan-300/20 hover:bg-white/[0.06] hover:shadow-[0_8px_20px_rgba(2,6,23,0.12)] motion-reduce:transform-none lg:grid-cols-[minmax(340px,2.2fr)_minmax(150px,0.8fr)_minmax(120px,0.65fr)_minmax(150px,0.75fr)_minmax(90px,0.45fr)] lg:gap-4"
                  role="button"
                  tabindex="0"
                  draggable="true"
                  data-task-id="${task.id}"
                >
                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <button class="grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition ${Timeline.helpers.isFavorite(task.id) ? "border-amber-300/30 bg-amber-300/12 text-amber-200" : "border-white/[0.08] bg-white/[0.035] text-slate-500 hover:text-amber-200"}" type="button" data-favorite-task="${task.id}" aria-label="Toggle favorite for ${Timeline.helpers.escapeHtml(task.title)}" title="Favorite">
                        <i data-lucide="star" class="h-4 w-4 ${Timeline.helpers.isFavorite(task.id) ? "fill-current" : ""}"></i>
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
                    <span class="text-[0.72rem] font-bold text-slate-300">${Timeline.helpers.escapeHtml(task.due)} &middot; ${Timeline.helpers.timeLabel(task.start)}</span>
                  </div>
                  <div class="flex items-center justify-between gap-3 lg:justify-end">
                    <span class="text-xs font-bold text-slate-500 lg:hidden">Progress</span>
                    <span class="text-right text-[0.82rem] font-black text-white">${taskProgress}%</span>
                  </div>
                </article>
              `;
            }
          )
          .join("")
        : `<div class="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm font-semibold text-slate-500">
            <p>No list tasks match your filter.</p>
            <button class="mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 text-xs font-black transition ${canManage ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white hover:brightness-110" : "cursor-not-allowed bg-white/5 text-slate-500 opacity-60"}" type="button" data-add-status="To Do" ${canManage ? "" : "disabled"}>
              <i data-lucide="${canManage ? "plus" : "lock"}" class="h-4 w-4"></i>
              ${canManage ? "Add first task" : "Read only"}
            </button>
          </div>`;

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
          (message) => {
            const body = message?.body || message;
            return `
            <div class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
              <span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan-400/15 text-cyan-200">
                <i data-lucide="activity" class="h-4 w-4"></i>
              </span>
              <p class="text-sm leading-5 text-slate-300">${Timeline.helpers.escapeHtml(body)}</p>
            </div>
          `;
          }
        )
        .join("");
    },

    refreshIcons() {
      if (window.TaskFlow && typeof window.TaskFlow.refreshIcons === "function") {
        window.TaskFlow.refreshIcons();
        return;
      }
      if (window.lucide) window.lucide.createIcons();
    }
  };
})();
