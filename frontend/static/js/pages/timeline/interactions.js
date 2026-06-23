(function () {
  "use strict";

  window.TaskFlow = window.TaskFlow || {};
  const Timeline = window.TaskFlow.Timeline = window.TaskFlow.Timeline || {};

  Timeline.interactions = {
    setupDragAndDrop() {
      // Kanban drag-and-drop
      Timeline.selectors.workspace.addEventListener("dragstart", (event) => {
        const task = event.target.closest("[data-task-id]");
        if (!task) return;

        const taskId = task.dataset.taskId;
        const item = Timeline.tasks.find((t) => t.id === taskId);
        if (!item) return;

        const userRole = (Timeline.app.dataset.userRole || "viewer").toLowerCase();
        const userName = (Timeline.app.dataset.userName || "").toLowerCase();
        const isManager = ["owner", "admin", "manager"].includes(userRole);
        const isOwner = item.owner && item.owner.toLowerCase() === userName;

        if (!isManager && !isOwner) {
          event.preventDefault();
          Timeline.actions.showToast("You do not have permission to move this task.");
          return;
        }

        Timeline.state.draggedTaskId = task.dataset.taskId;
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", task.dataset.taskId);
        task.classList.add("opacity-70", "scale-[0.98]", "ring-4", "ring-cyan-300/30");
        Timeline.actions.showToast("Drag preview enabled");
      });

      Timeline.selectors.kanbanColumns.addEventListener("dragover", (event) => {
        const dropzone = event.target.closest("[data-drop-status]");
        if (!dropzone) return;
        event.preventDefault();
        dropzone.closest(".kanban-column").classList.add("border-cyan-300/35", "bg-cyan-300/[0.045]");
      });

      Timeline.selectors.kanbanColumns.addEventListener("dragleave", (event) => {
        const column = event.target.closest(".kanban-column");
        if (!column || column.contains(event.relatedTarget)) return;
        column.classList.remove("border-cyan-300/35", "bg-cyan-300/[0.045]");
      });

      Timeline.selectors.kanbanColumns.addEventListener("drop", (event) => {
        const dropzone = event.target.closest("[data-drop-status]");
        if (!dropzone) return;
        event.preventDefault();
        const taskId = event.dataTransfer.getData("text/plain") || Timeline.state.draggedTaskId;
        const task = Timeline.tasks.find((item) => item.id === taskId);
        if (!task) return;

        const originalStatus = task.status;
        const newStatus = dropzone.dataset.dropStatus;

        task.status = newStatus;
        dropzone.closest(".kanban-column").classList.remove("border-cyan-300/35", "bg-cyan-300/[0.045]");
        Timeline.actions.applyTaskFilters();

        if ((/^\d+$/).test(taskId)) {
          Timeline.timelineApi.updateTaskStatus(taskId, newStatus, Timeline.app)
            .then((res) => {
              if (!res.ok) {
                task.status = originalStatus;
                Timeline.actions.applyTaskFilters();
                Timeline.actions.showToast(res.message || "Failed, restored");
              } else {
                Timeline.actions.showToast(`Moved to ${newStatus}`);
              }
            })
            .catch((err) => {
              task.status = originalStatus;
              Timeline.actions.applyTaskFilters();
              Timeline.actions.showToast("Failed, restored");
            });
        } else {
          task.status = originalStatus;
          Timeline.actions.applyTaskFilters();
          Timeline.actions.showToast("Task must be saved before moving.");
        }
      });

      Timeline.selectors.workspace.addEventListener("dragend", (event) => {
        const task = event.target.closest("[data-task-id]");
        if (!task) return;
        Timeline.state.draggedTaskId = null;
        task.classList.remove("opacity-70", "scale-[0.98]", "ring-4", "ring-cyan-300/30");
        document.querySelectorAll(".kanban-column").forEach((column) => {
          column.classList.remove("border-cyan-300/35", "bg-cyan-300/[0.045]");
        });
      });

      // Calendar Drag-Move and Right-Edge Resizing
      Timeline.selectors.taskLayer.addEventListener("mousedown", (e) => {
        const taskEl = e.target.closest(".timeline-task");
        if (!taskEl) return;

        const taskId = taskEl.dataset.taskId;
        const task = Timeline.tasks.find((t) => t.id === taskId);
        if (!task) return;

        const userRole = (Timeline.app.dataset.userRole || "viewer").toLowerCase();
        const userName = (Timeline.app.dataset.userName || "").toLowerCase();
        const isManager = ["owner", "admin", "manager"].includes(userRole);
        const isOwner = task.owner && task.owner.toLowerCase() === userName;

        if (!isManager && !isOwner) {
          Timeline.actions.showToast("You do not have permission to edit this task.");
          return;
        }

        const isHandle = e.target.closest(".resize-handle");

        e.preventDefault();

        Timeline.activeDragTaskId = taskId;
        Timeline.dragStartX = e.clientX;
        Timeline.dragStartY = e.clientY;
        Timeline.dragStartTaskX = task.start;
        Timeline.dragStartWidth = task.duration;
        Timeline.dragStartRow = task.row || 0;

        if (isHandle) {
          Timeline.isResizing = true;
          taskEl.classList.add("ring-2", "ring-cyan-300/50");
        } else {
          Timeline.isDragging = true;
          taskEl.classList.add("opacity-90", "ring-2", "ring-cyan-300/50", "scale-[0.99]");
        }
      });

      document.addEventListener("mousemove", (e) => {
        if (!Timeline.activeDragTaskId) return;

        const taskEl = Timeline.selectors.taskLayer.querySelector(`[data-task-id="${Timeline.activeDragTaskId}"]`);
        const task = Timeline.tasks.find((t) => t.id === Timeline.activeDragTaskId);
        if (!taskEl || !task) return;

        const deltaX = e.clientX - Timeline.dragStartX;
        const deltaHours = deltaX / Timeline.scale;

        if (Timeline.isResizing) {
          let newDuration = Timeline.dragStartWidth + deltaHours;
          newDuration = Math.round(newDuration * 4) / 4;
          if (newDuration < 0.25) newDuration = 0.25;
          if (task.start + newDuration > 24) {
            newDuration = 24 - task.start;
          }

          taskEl.style.width = `${newDuration * Timeline.scale}px`;

          const timeBadge = taskEl.querySelector(".timeline-task-time");
          if (timeBadge) {
            timeBadge.textContent = Timeline.helpers.timeLabel(task.start);
          }
        } else if (Timeline.isDragging) {
          let newStart = Timeline.dragStartTaskX + deltaHours;
          newStart = Math.round(newStart * 4) / 4;
          if (newStart < 0) newStart = 0;
          if (newStart + task.duration > 24) {
            newStart = 24 - task.duration;
          }

          const deltaY = e.clientY - Timeline.dragStartY;
          let newRow = Timeline.dragStartRow + Math.round(deltaY / 70);
          if (newRow < 0) newRow = 0;
          if (newRow > 4) newRow = 4;

          taskEl.style.left = `${newStart * Timeline.scale}px`;
          taskEl.style.top = `${newRow * 70 + 8}px`;

          const timeBadge = taskEl.querySelector(".timeline-task-time");
          if (timeBadge) {
            timeBadge.textContent = Timeline.helpers.timeLabel(newStart);
          }
        }
      });

      document.addEventListener("mouseup", async (e) => {
        if (!Timeline.activeDragTaskId) return;

        const taskEl = Timeline.selectors.taskLayer.querySelector(`[data-task-id="${Timeline.activeDragTaskId}"]`);
        const task = Timeline.tasks.find((t) => t.id === Timeline.activeDragTaskId);

        if (taskEl) {
          taskEl.classList.remove("ring-2", "ring-cyan-300/50", "opacity-90", "scale-[0.99]");
        }

        if (!task) {
          Timeline.activeDragTaskId = null;
          Timeline.isDragging = false;
          Timeline.isResizing = false;
          return;
        }

        const deltaX = e.clientX - Timeline.dragStartX;
        const deltaHours = deltaX / Timeline.scale;
        let changed = false;

        const wasResizing = Timeline.isResizing;
        const wasDragging = Timeline.isDragging;

        let newStart = task.start;
        let newDuration = task.duration;
        let newRow = task.row || 0;

        if (wasResizing) {
          if (Math.abs(deltaX) >= 3) {
            newDuration = Timeline.dragStartWidth + deltaHours;
            newDuration = Math.round(newDuration * 4) / 4;
            if (newDuration < 0.25) newDuration = 0.25;
            if (task.start + newDuration > 24) {
              newDuration = 24 - task.start;
            }

            if (newDuration !== task.duration) {
              task.duration = newDuration;
              changed = true;
            }
            Timeline.wasDraggedOrResized = true;
          }
        } else if (wasDragging) {
          const deltaY = e.clientY - Timeline.dragStartY;
          if (Math.abs(deltaX) >= 3 || Math.abs(deltaY) >= 3) {
            newStart = Timeline.dragStartTaskX + deltaHours;
            newStart = Math.round(newStart * 4) / 4;
            if (newStart < 0) newStart = 0;
            if (newStart + task.duration > 24) {
              newStart = 24 - task.duration;
            }

            newRow = Timeline.dragStartRow + Math.round(deltaY / 70);
            if (newRow < 0) newRow = 0;
            if (newRow > 4) newRow = 4;

            if (newStart !== task.start || newRow !== task.row) {
              task.start = newStart;
              task.row = newRow;
              changed = true;
            }
            Timeline.wasDraggedOrResized = true;
          }
        }

        Timeline.activeDragTaskId = null;
        Timeline.isDragging = false;
        Timeline.isResizing = false;

        if (changed) {
          Timeline.actions.applyTaskFilters();

          if ((/^\d+$/).test(task.id)) {
            try {
              const response = await Timeline.timelineApi.updateTask(task.id, {
                start: task.start,
                duration: task.duration,
                row: task.row
              }, Timeline.app);
              if (!response.ok) {
                throw new Error(response.message || "Failed to save timeline changes");
              }
              Timeline.actions.showToast(wasResizing ? "Task duration updated" : "Task schedule updated");
            } catch (error) {
              Timeline.actions.showToast(error.message || "Failed, restored");
              if (wasResizing) {
                task.duration = Timeline.dragStartWidth;
              } else {
                task.start = Timeline.dragStartTaskX;
                task.row = Timeline.dragStartRow;
              }
              Timeline.actions.applyTaskFilters();
            }
          } else {
            if (wasResizing) {
              task.duration = Timeline.dragStartWidth;
            } else {
              task.start = Timeline.dragStartTaskX;
              task.row = Timeline.dragStartRow;
            }
            Timeline.actions.applyTaskFilters();
            Timeline.actions.showToast("Task must be saved before scheduling.");
          }
        }
      });
    }
  };
})();
