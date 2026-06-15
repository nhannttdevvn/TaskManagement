(function () {
  "use strict";

  window.TaskFlow = window.TaskFlow || {};
  const Timeline = window.TaskFlow.Timeline = window.TaskFlow.Timeline || {};

  Timeline.modals = {
    openTask(taskId) {
      const task = Timeline.tasks.find((item) => item.id === taskId);
      if (!task) return;

      const commentList = [
        `${task.owner || "Sarah"} updated the progress to ${task.progress}%.`,
        `${task.members[0] || "MS"} left a note on the task scope.`,
        "Team reviewed the latest attachment.",
      ];
      const activityList = [
        `Moved to ${task.status}`,
        `${task.priority} priority assigned`,
        `${task.comments} comments and ${task.attachments} files tracked`,
      ];

      Timeline.selectors.detail.innerHTML = `
        <div class="flex items-start justify-between gap-4 pr-10">
          <div class="min-w-0">
            <p class="text-xs font-extrabold uppercase text-cyan-200">${Timeline.helpers.escapeHtml(task.category)}</p>
            <h2 id="timelineTaskTitle" class="mt-2 text-2xl font-black text-white">${Timeline.helpers.escapeHtml(task.title)}</h2>
            <p class="mt-2 text-sm leading-6 text-slate-400">${Timeline.helpers.escapeHtml(task.subtitle)} scheduled from ${Timeline.helpers.timeLabel(task.start)} for ${task.duration} hours in ${Timeline.helpers.escapeHtml(Timeline.helpers.activeWorkspace().name)}.</p>
          </div>
          <span class="shrink-0 rounded-full border px-2.5 py-1 text-[0.68rem] font-black ${Timeline.helpers.priorityTone(task.priority)}">${Timeline.helpers.escapeHtml(task.priority)}</span>
        </div>
        <div class="mt-4 grid gap-2 sm:grid-cols-4">
          <div class="rounded-2xl border border-white/10 bg-white/8 p-3">
            <p class="text-xs font-bold text-slate-400">Status</p>
            <strong class="text-sm font-black text-white">${Timeline.helpers.escapeHtml(task.status)}</strong>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/8 p-3">
            <p class="text-xs font-bold text-slate-400">Owner</p>
            <strong class="text-sm font-black text-white">${Timeline.helpers.escapeHtml(task.owner || "Unassigned")}</strong>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/8 p-3">
            <p class="text-xs font-bold text-slate-400">Deadline</p>
            <strong class="text-sm font-black text-white">${Timeline.helpers.escapeHtml(task.due)}</strong>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/8 p-3">
            <p class="text-xs font-bold text-slate-400">Progress</p>
            <strong class="text-sm font-black text-white">${task.progress}%</strong>
          </div>
        </div>
        <div class="mt-4 grid gap-3 lg:grid-cols-3">
          <section class="rounded-2xl border border-white/10 bg-white/8 p-3">
            <h3 class="mb-2 flex items-center gap-2 text-sm font-black text-white"><i data-lucide="message-square" class="h-4 w-4 text-cyan-200"></i> Comments</h3>
            <div class="space-y-2">
              ${commentList.map((comment) => `<p class="rounded-xl bg-slate-900/60 p-2 text-xs font-semibold leading-5 text-slate-300">${Timeline.helpers.escapeHtml(comment)}</p>`).join("")}
            </div>
          </section>
          <section class="rounded-2xl border border-white/10 bg-white/8 p-3">
            <h3 class="mb-2 flex items-center gap-2 text-sm font-black text-white"><i data-lucide="activity" class="h-4 w-4 text-violet-200"></i> Activity</h3>
            <div class="space-y-2">
              ${activityList.map((activity) => `<p class="rounded-xl bg-slate-900/60 p-2 text-xs font-semibold leading-5 text-slate-300">${Timeline.helpers.escapeHtml(activity)}</p>`).join("")}
            </div>
          </section>
          <section class="rounded-2xl border border-white/10 bg-white/8 p-3">
            <h3 class="mb-2 flex items-center gap-2 text-sm font-black text-white"><i data-lucide="paperclip" class="h-4 w-4 text-emerald-200"></i> Files</h3>
            <div class="space-y-2">
              <p class="rounded-xl bg-slate-900/60 p-2 text-xs font-semibold leading-5 text-slate-300">${task.attachments} attachment${task.attachments === 1 ? "" : "s"} linked</p>
              <button class="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-cyan-300/30 hover:text-white" type="button">
                <i data-lucide="upload" class="h-3.5 w-3.5"></i>
                Mock upload
              </button>
            </div>
          </section>
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <button class="h-9 rounded-xl border border-white/10 bg-white/8 px-3 text-xs font-bold text-slate-300 transition hover:bg-white/14" type="button" data-edit-task="${task.id}">
            Edit
          </button>
          <button class="h-9 rounded-xl border border-rose-300/20 bg-rose-500/12 px-3 text-xs font-bold text-rose-100 transition hover:bg-rose-500/20" type="button" data-delete-task="${task.id}">
            Delete
          </button>
        </div>
      `;
      Timeline.selectors.modal.classList.remove("hidden");
      Timeline.selectors.modal.classList.add("grid");
      document.body.style.overflow = "hidden";
      Timeline.renderers.refreshIcons();
    },

    closeTaskModal() {
      Timeline.selectors.modal.classList.add("hidden");
      Timeline.selectors.modal.classList.remove("grid");
      document.body.style.overflow = "";
    },

    openTaskEditor(status = "To Do", taskId = null) {
      const task = taskId ? Timeline.tasks.find((item) => item.id === taskId) : null;
      Timeline.state.editorStatus = task?.status || status || "To Do";
      Timeline.selectors.editorTitle.textContent = task ? "Edit Task" : "Add Task";
      Timeline.selectors.editorForm.elements.id.value = task?.id || "";
      Timeline.selectors.editorForm.elements.title.value = task?.title || "";
      Timeline.selectors.editorForm.elements.subtitle.value = task?.subtitle || "";
      Timeline.selectors.editorForm.elements.status.value = task?.status || Timeline.state.editorStatus;
      Timeline.selectors.editorForm.elements.priority.value = task?.priority || "Medium";
      Timeline.selectors.editorForm.elements.owner.value = task?.owner || "Sarah Nguyen";
      Timeline.selectors.editorForm.elements.due.value = task?.due || "Nov 18";
      Timeline.selectors.editorForm.elements.progress.value = task?.progress || 20;
      Timeline.selectors.editorModal.classList.remove("hidden");
      Timeline.selectors.editorModal.classList.add("grid");
      document.body.style.overflow = "hidden";
      Timeline.renderers.refreshIcons();
    },

    closeTaskEditor() {
      Timeline.selectors.editorModal.classList.add("hidden");
      Timeline.selectors.editorModal.classList.remove("grid");
      document.body.style.overflow = "";
    },

    openWorkspaceEditor() {
      Timeline.selectors.workspaceEditorForm.reset();
      Timeline.selectors.workspaceEditorModal.classList.remove("hidden");
      Timeline.selectors.workspaceEditorModal.classList.add("grid");
      document.body.style.overflow = "hidden";
      Timeline.selectors.workspaceEditorForm.elements.name.focus();
    },

    closeWorkspaceEditor() {
      Timeline.selectors.workspaceEditorModal.classList.add("hidden");
      Timeline.selectors.workspaceEditorModal.classList.remove("grid");
      document.body.style.overflow = "";
    },

    openProjectEditor(workspaceId) {
      if (Timeline.selectors.projectEditorForm) {
        Timeline.selectors.projectEditorForm.reset();
        const wsIdInput = Timeline.selectors.projectEditorForm.querySelector("#projectEditorWorkspaceId");
        if (wsIdInput) {
          wsIdInput.value = workspaceId || "";
        }
      }
      if (Timeline.selectors.projectEditorModal) {
        Timeline.selectors.projectEditorModal.classList.remove("hidden");
        Timeline.selectors.projectEditorModal.classList.add("grid");
        document.body.style.overflow = "hidden";
        const nameInput = Timeline.selectors.projectEditorForm?.elements?.name;
        if (nameInput) {
          nameInput.focus();
        }
      }
    },

    closeProjectEditor() {
      if (Timeline.selectors.projectEditorModal) {
        Timeline.selectors.projectEditorModal.classList.add("hidden");
        Timeline.selectors.projectEditorModal.classList.remove("grid");
      }
      document.body.style.overflow = "";
    },

    openProjectInviteModal() {
      Timeline.selectors.projectInviteForm.reset();
      Timeline.selectors.projectInviteModal.classList.remove("hidden");
      Timeline.selectors.projectInviteModal.classList.add("grid");
      document.body.style.overflow = "hidden";
      Timeline.selectors.projectInviteForm.elements.email.focus();
    },

    closeProjectInviteModal() {
      Timeline.selectors.projectInviteModal.classList.add("hidden");
      Timeline.selectors.projectInviteModal.classList.remove("grid");
      document.body.style.overflow = "";
    },

    openHelpModal() {
      Timeline.selectors.helpModal.classList.remove("hidden");
      Timeline.selectors.helpModal.classList.add("grid");
      document.body.style.overflow = "hidden";
    },

    closeHelpModal() {
      Timeline.selectors.helpModal.classList.add("hidden");
      Timeline.selectors.helpModal.classList.remove("grid");
      document.body.style.overflow = "";
    }
  };
})();
