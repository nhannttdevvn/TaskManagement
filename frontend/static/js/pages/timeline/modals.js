(function () {
  "use strict";

  window.TaskFlow = window.TaskFlow || {};
  const Timeline = window.TaskFlow.Timeline = window.TaskFlow.Timeline || {};

  Timeline.modals = {
    async openTask(taskId) {
      const task = Timeline.tasks.find((item) => item.id === taskId);
      if (!task) return;

      Timeline.modals.renderTaskDetails(task, { loading: true });
      Timeline.selectors.modal.classList.remove("hidden");
      Timeline.selectors.modal.classList.add("grid");
      document.body.style.overflow = "hidden";
      Timeline.renderers.refreshIcons();

      if (!(/^\d+$/).test(String(task.id))) {
        Timeline.modals.renderTaskDetails(task, {
          comments: [],
          activity: [],
          attachments: [],
          errorMessage: "This task is not stored in the database yet.",
        });
        return;
      }

      try {
        const [comments, activity, attachments] = await Promise.all([
          Timeline.timelineApi.loadTaskComments(task.id),
          Timeline.timelineApi.loadTaskActivity(task.id),
          Timeline.timelineApi.loadTaskAttachments(task.id),
        ]);
        Timeline.modals.renderTaskDetails(task, {
          comments: comments.data || [],
          activity: activity.data || [],
          attachments: attachments.data || [],
        });
      } catch (error) {
        Timeline.modals.renderTaskDetails(task, {
          comments: [],
          activity: [],
          attachments: [],
          errorMessage: error.message || "Task details could not be loaded.",
        });
      }
    },

    renderTaskDetails(task, detail = {}) {
      const workspace = Timeline.helpers.activeWorkspace();
      const workspaceName = workspace?.name || task.workspaceName || "Workspace";
      const loading = Boolean(detail.loading);
      const comments = detail.comments || [];
      const activity = detail.activity || [];
      const attachments = detail.attachments || [];
      const loadingRow = `<p class="rounded-xl bg-slate-900/60 p-2 text-xs font-semibold leading-5 text-slate-400">Loading...</p>`;
      const emptyRow = (label) => `<p class="rounded-xl bg-slate-900/60 p-2 text-xs font-semibold leading-5 text-slate-500">${label}</p>`;
      const commentRows = loading
        ? loadingRow
        : comments.length
          ? comments.map((comment) => `
              <p class="rounded-xl bg-slate-900/60 p-2 text-xs font-semibold leading-5 text-slate-300">
                <span class="block text-cyan-100">${Timeline.helpers.escapeHtml(comment.author || "Unknown")}</span>
                ${Timeline.helpers.escapeHtml(comment.body || "")}
              </p>
            `).join("")
          : emptyRow("No comments yet.");
      const activityRows = loading
        ? loadingRow
        : activity.length
          ? activity.map((item) => `<p class="rounded-xl bg-slate-900/60 p-2 text-xs font-semibold leading-5 text-slate-300">${Timeline.helpers.escapeHtml(item.body || item.action || "")}</p>`).join("")
          : emptyRow("No activity yet.");
      const attachmentRows = loading
        ? loadingRow
        : attachments.length
          ? attachments.map((attachment) => `
              <p class="flex items-center justify-between gap-2 rounded-xl bg-slate-900/60 p-2 text-xs font-semibold leading-5 text-slate-300">
                <span class="truncate">${Timeline.helpers.escapeHtml(attachment.name || "uploaded-file")}</span>
                <span class="shrink-0 text-slate-500">${Timeline.helpers.escapeHtml(attachment.size || "")}</span>
              </p>
            `).join("")
          : emptyRow("No attachments yet.");
      const errorBanner = detail.errorMessage
        ? `<div class="mt-4 rounded-xl border border-amber-300/20 bg-amber-400/10 px-3 py-2 text-xs font-bold text-amber-100">${Timeline.helpers.escapeHtml(detail.errorMessage)}</div>`
        : "";

      Timeline.selectors.detail.innerHTML = `
        <div class="flex items-start justify-between gap-4 pr-10">
          <div class="min-w-0">
            <p class="text-xs font-extrabold uppercase text-cyan-200">${Timeline.helpers.escapeHtml(task.category)}</p>
            <h2 id="timelineTaskTitle" class="mt-2 text-2xl font-black text-white">${Timeline.helpers.escapeHtml(task.title)}</h2>
            <p class="mt-2 text-sm leading-6 text-slate-400">${Timeline.helpers.escapeHtml(task.subtitle)} scheduled from ${Timeline.helpers.timeLabel(task.start)} for ${task.duration} hours in ${Timeline.helpers.escapeHtml(workspaceName)}.</p>
          </div>
          <span class="shrink-0 rounded-full border px-2.5 py-1 text-[0.68rem] font-black ${Timeline.helpers.priorityTone(task.priority)}">${Timeline.helpers.escapeHtml(task.priority)}</span>
        </div>
        ${errorBanner}
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
              ${commentRows}
            </div>
          </section>
          <section class="rounded-2xl border border-white/10 bg-white/8 p-3">
            <h3 class="mb-2 flex items-center gap-2 text-sm font-black text-white"><i data-lucide="activity" class="h-4 w-4 text-violet-200"></i> Activity</h3>
            <div class="space-y-2">
              ${activityRows}
            </div>
          </section>
          <section class="rounded-2xl border border-white/10 bg-white/8 p-3">
            <h3 class="mb-2 flex items-center gap-2 text-sm font-black text-white"><i data-lucide="paperclip" class="h-4 w-4 text-emerald-200"></i> Files</h3>
            <div class="space-y-2">
              ${attachmentRows}
              <form class="grid gap-2 rounded-xl border border-dashed border-white/15 p-2" data-attachment-form="${task.id}">
                <input class="h-10 rounded-xl border border-white/10 bg-slate-900/70 px-3 text-xs font-bold text-white outline-none placeholder:text-slate-500" name="name" placeholder="Attachment name" required>
                <input class="h-10 rounded-xl border border-white/10 bg-slate-900/70 px-3 text-xs font-bold text-white outline-none placeholder:text-slate-500" name="size" placeholder="Size, e.g. 2.4 MB">
                <button class="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/15 px-3 text-xs font-bold text-slate-300 transition hover:border-cyan-300/30 hover:text-white" type="submit">
                  <i data-lucide="paperclip" class="h-3.5 w-3.5"></i>
                  Add attachment
                </button>
              </form>
            </div>
          </section>
        </div>
        <div class="mt-4 flex justify-end gap-2" data-delete-confirm-host="${task.id}">
          <button class="min-h-10 rounded-xl border border-white/10 bg-white/8 px-4 text-xs font-bold text-slate-300 transition hover:bg-white/14" type="button" data-edit-task="${task.id}">
            Edit
          </button>
          <button class="min-h-10 rounded-xl border border-rose-300/20 bg-rose-500/12 px-4 text-xs font-bold text-rose-100 transition hover:bg-rose-500/20" type="button" data-delete-task="${task.id}">
            Delete
          </button>
        </div>
      `;
      Timeline.renderers.refreshIcons();
    },

    showDeleteConfirm(taskId) {
      const host = Array.from(Timeline.selectors.detail.querySelectorAll("[data-delete-confirm-host]"))
        .find((item) => item.dataset.deleteConfirmHost === String(taskId));
      if (!host) return;
      host.innerHTML = `
        <button class="min-h-10 rounded-xl border border-white/10 bg-white/8 px-4 text-xs font-bold text-slate-300 transition hover:bg-white/14" type="button" data-cancel-delete-task="${taskId}">
          Cancel
        </button>
        <button class="min-h-10 rounded-xl border border-rose-300/25 bg-rose-500/20 px-4 text-xs font-black text-rose-100 transition hover:bg-rose-500/30" type="button" data-confirm-delete-task="${taskId}">
          Confirm
        </button>
      `;
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
      Timeline.selectors.editorForm.elements.due_date.value = task?.dueDate || "";
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
      const workspace = Timeline.helpers.activeWorkspace();
      if (!workspace?.inviteUrl) {
        Timeline.actions.showToast("Create or open a workspace before inviting members.");
        return;
      }
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
