(function () {
  "use strict";

  const app = document.getElementById("teamApp");
  if (!app) return;

  const teamApi = window.TaskFlow?.teamApi;
  const toast = window.TaskFlow?.toast;
  const api = window.TaskFlow?.api;
  const allowDemoFallback = app.dataset.allowDemoFallback === "true";

  const currentUserId = app.dataset.userId;
  const currentUserName = app.dataset.userName;

  let members = [];
  let pendingRequests = [];

  let notifications = [
    "Aisha mentioned you in UX copy updates.",
    "Daniel completed responsive review.",
  ];

  const state = {
    selectedId: null,
    filteredMembers: [],
    messageQuery: "",
    callActive: false,
    callConnected: false,
    callStartedAt: null,
    callTimer: null,
    callConnectTimeout: null,
    cameraActive: true,
    socket: null,
    localStream: null,
    activeTeam: null,
    activeTab: "friends", // "friends", "find", "requests"
    scannerAnimationId: null,
  };

  let initialized = false;

  const selectors = {
    sidebar: document.getElementById("teamSidebar"),
    sidebarOverlay: document.getElementById("teamSidebarOverlay"),
    sidebarToggle: document.getElementById("teamSidebarToggle"),
    memberSearch: document.getElementById("memberSearch"),
    memberList: document.getElementById("memberList"),
    selectedAvatar: document.getElementById("selectedMemberAvatar"),
    selectedName: document.getElementById("selectedMemberName"),
    selectedStatus: document.getElementById("selectedMemberStatus"),
    callButton: document.getElementById("teamCallButton"),
    callStatus: document.getElementById("teamCallStatus"),
    callModal: document.getElementById("teamCallModal"),
    callDialog: document.getElementById("teamCallDialog"),
    callAvatar: document.getElementById("teamCallAvatar"),
    callName: document.getElementById("teamCallName"),
    callRole: document.getElementById("teamCallRole"),
    callState: document.getElementById("teamCallState"),
    callTimer: document.getElementById("teamCallTimer"),
    endCall: document.getElementById("teamEndCall"),
    muteCall: document.getElementById("teamMuteCall"),
    speakerCall: document.getElementById("teamSpeakerCall"),
    videoToggle: document.getElementById("teamVideoToggle"),
    callAudioView: document.getElementById("teamCallAudioView"),
    callVideoView: document.getElementById("teamCallVideoView"),
    remoteVideoAvatar: document.getElementById("remoteVideoAvatar"),
    remoteVideoName: document.getElementById("remoteVideoName"),
    remoteVideoLabel: document.getElementById("remoteVideoLabel"),
    localVideoFeed: document.getElementById("localVideoFeed"),
    localVideo: document.getElementById("localVideo"),
    remoteVideo: document.getElementById("remoteVideo"),
    scannerCanvas: document.getElementById("scannerCanvas"),
    chatMenuButton: document.getElementById("teamChatMenuButton"),
    chatMenu: document.getElementById("teamChatMenu"),
    messageSearchBar: document.getElementById("teamMessageSearchBar"),
    messageSearchInput: document.getElementById("messageSearchInput"),
    messageSearchClose: document.getElementById("messageSearchClose"),
    searchMessagesButton: document.getElementById("teamSearchMessagesButton"),
    deleteConversationButton: document.getElementById("teamDeleteConversationButton"),
    chatMessages: document.getElementById("chatMessages"),
    messageForm: document.getElementById("messageForm"),
    messageInput: document.getElementById("messageInput"),
    themeToggle: document.getElementById("teamThemeToggle"),
    notificationToggle: document.getElementById("teamNotificationToggle"),
    notificationDropdown: document.getElementById("teamNotificationDropdown"),
    notificationList: document.getElementById("teamNotificationList"),
    inviteButton: document.getElementById("inviteMemberButton"),
    inviteModal: document.getElementById("inviteMemberModal"),
    inviteDialog: document.getElementById("inviteMemberDialog"),
    inviteClose: document.getElementById("inviteMemberClose"),
    inviteCancel: document.getElementById("inviteMemberCancel"),
    inviteForm: document.getElementById("inviteMemberForm"),
    inviteProjectsList: document.getElementById("inviteProjectsList"),
    inviteSubmit: document.getElementById("inviteSubmitButton"),
    toast: document.getElementById("teamToast"),

    // Tab elements & Views
    tabFriends: document.getElementById("tabFriends"),
    tabFindFriends: document.getElementById("tabFindFriends"),
    tabRequests: document.getElementById("tabRequests"),
    requestsCount: document.getElementById("requestsCount"),
    friendsView: document.getElementById("friendsView"),
    findFriendsView: document.getElementById("findFriendsView"),
    requestsView: document.getElementById("requestsView"),
    userSearchInput: document.getElementById("userSearchInput"),
    userSearchResults: document.getElementById("userSearchResults"),
    pendingRequestsList: document.getElementById("pendingRequestsList"),
  };

  // Get initials from a name (e.g., "Aisha Rahman" -> "AR")
  function getInitials(name) {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }

  // Get a deterministic gradient based on member ID or name
  function getAvatarGradient(memberId) {
    const gradients = [
      "from-cyan-400 to-blue-500",
      "from-violet-500 to-fuchsia-500",
      "from-emerald-400 to-teal-500",
      "from-amber-400 to-orange-500",
      "from-rose-400 to-pink-500",
      "from-indigo-500 to-purple-600",
      "from-sky-400 to-indigo-500",
      "from-pink-500 to-rose-500"
    ];
    let hash = 0;
    const str = String(memberId || "");
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  }

  // Returns HTML for the CSS avatar
  function renderAvatarHtml(member, sizeClass = "h-10 w-10 rounded-xl") {
    const initials = getInitials(member.name);
    const gradient = getAvatarGradient(member.id);
    return `
      <div class="flex ${sizeClass} shrink-0 items-center justify-center bg-gradient-to-br ${gradient} text-white font-bold shadow-sm uppercase font-sans">
        ${escapeHtml(initials)}
      </div>
    `;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function statusTone(status) {
    const tones = {
      online: {
        dot: "bg-emerald-400",
        label: "text-emerald-200",
        badge: "bg-emerald-400/15 text-emerald-200",
        text: "Online",
      },
      away: {
        dot: "bg-amber-400",
        label: "text-amber-200",
        badge: "bg-amber-400/15 text-amber-200",
        text: "Away",
      },
      offline: {
        dot: "bg-slate-500",
        label: "text-slate-300",
        badge: "bg-slate-400/15 text-slate-300",
        text: "Offline",
      },
    };
    return tones[status] || tones.offline;
  }

  function selectedMember() {
    return members.find((member) => member.id === state.selectedId) || members[0];
  }

  function renderMembers() {
    if (state.filteredMembers.length === 0) {
      selectors.memberList.innerHTML = `
        <div class="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-center">
          <p class="text-sm font-bold text-white">No members yet</p>
          <button
            type="button"
            class="mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 text-sm font-extrabold text-slate-950 shadow-glass transition hover:bg-cyan-300"
            data-empty-invite
          >
            <i data-lucide="user-plus" class="h-4 w-4"></i>
            Invite first member
          </button>
        </div>
      `;
      refreshIcons();
      return;
    }

    selectors.memberList.innerHTML = state.filteredMembers
      .map((member) => {
        const tone = statusTone(member.status);
        const active = member.id === state.selectedId;
        return `
          <button
            class="team-member flex items-center gap-3 rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(34,211,238,0.12)] motion-reduce:transform-none ${
              active
                ? "border-cyan-300/30 bg-gradient-to-r from-violet-500/20 to-cyan-500/10"
                : "border-white/10 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.06]"
            }"
            type="button"
            data-member-id="${member.id}"
          >
            <span class="relative shrink-0">
              ${renderAvatarHtml(member, "h-10 w-10 rounded-xl border border-white/20")}
              <span class="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-slate-950 ${tone.dot}"></span>
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate text-sm font-bold text-white">${escapeHtml(member.name)}</span>
              <span class="block truncate text-xs text-slate-400">${escapeHtml(member.role)}</span>
            </span>
            <span class="rounded-full px-2 py-1 text-[0.65rem] font-extrabold ${tone.badge}">${tone.text}</span>
          </button>
        `;
      })
      .join("");
    refreshIcons();
  }

  function renderChat() {
    const member = selectedMember();
    if (!member) {
      selectors.selectedName.textContent = "No conversation selected";
      selectors.selectedStatus.textContent = "";
      selectors.chatMessages.innerHTML = `
        <div class="grid h-full min-h-[14rem] place-items-center text-center">
          <div>
            <div class="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/5 text-slate-400">
              <i data-lucide="message-square" class="h-5 w-5"></i>
            </div>
            <p class="mt-3 text-sm font-bold text-white">Select a friend to chat</p>
            <button
              type="button"
              class="mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 text-sm font-extrabold text-white transition hover:bg-white/10"
              data-empty-find-friends
            >
              <i data-lucide="search" class="h-4 w-4"></i>
              Find Friends
            </button>
          </div>
        </div>
      `;
      refreshIcons();
      return;
    }
    const tone = statusTone(member.status);
    const query = state.messageQuery.trim().toLowerCase();
    const visibleMessages = query
      ? member.messages.filter((message) => message.body.toLowerCase().includes(query) || message.time.toLowerCase().includes(query))
      : member.messages;

    const selectedInitials = getInitials(member.name);
    const selectedGradient = getAvatarGradient(member.id);
    selectors.selectedAvatar.className = `flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-gradient-to-br ${selectedGradient} text-sm font-bold text-white shadow-glass uppercase font-sans`;
    selectors.selectedAvatar.textContent = selectedInitials;

    selectors.selectedName.textContent = member.name;
    selectors.selectedStatus.className = `text-xs font-semibold ${tone.label}`;
    selectors.selectedStatus.textContent = `${tone.text} - ${member.role}`;

    selectors.chatMessages.innerHTML = visibleMessages.length
      ? visibleMessages
        .map(
          (message) => {
            const isMe = String(message.sender_id) === String(currentUserId);
            if (isMe) {
              return `
                <article class="flex justify-end gap-3">
                  <div class="max-w-[min(34rem,78%)] text-right">
                    <div class="inline-block rounded-2xl rounded-br-md bg-gradient-to-r from-violet-600/95 via-blue-600/95 to-cyan-600/95 px-4 py-3 text-left text-sm leading-6 text-white shadow-[0_14px_34px_rgba(37,99,235,0.22)]">
                      ${escapeHtml(message.body)}
                    </div>
                    <p class="mt-1 text-xs text-slate-500">${escapeHtml(message.time)}</p>
                  </div>
                </article>
              `;
            } else {
              return `
                <article class="flex justify-start gap-3">
                  ${renderAvatarHtml(member, "mt-1 h-8 w-8 rounded-xl border border-white/20 text-[10px]")}
                  <div class="max-w-[min(34rem,78%)] text-left">
                    <div class="inline-block rounded-2xl rounded-bl-md bg-white/10 px-4 py-3 text-left text-sm leading-6 text-white border border-white/5 backdrop-blur-md">
                      ${escapeHtml(message.body)}
                    </div>
                    <p class="mt-1 text-xs text-slate-500">${escapeHtml(message.time)}</p>
                  </div>
                </article>
              `;
            }
          }
        )
        .join("")
      : `
        <div class="grid h-full min-h-[14rem] place-items-center text-center">
          <div>
            <div class="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/5 text-slate-400">
              <i data-lucide="${query ? "search-x" : "message-square-off"}" class="h-5 w-5"></i>
            </div>
            <p class="mt-3 text-sm font-bold text-white">${query ? "No matching messages" : "Conversation is empty"}</p>
            <p class="mt-1 text-xs font-semibold text-slate-500">${query ? "Try a different keyword." : "Send a new message to start this chat."}</p>
          </div>
        </div>
      `;

    selectors.chatMessages.scrollTop = selectors.chatMessages.scrollHeight;
    refreshIcons();
  }

  function toggleChatMenu(forceOpen) {
    const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : selectors.chatMenu.classList.contains("hidden");
    selectors.chatMenu.classList.toggle("hidden", !shouldOpen);
    selectors.chatMenuButton.setAttribute("aria-expanded", String(shouldOpen));
  }

  function callDurationLabel() {
    if (!state.callStartedAt) return "00:00";
    const seconds = Math.max(0, Math.floor((Date.now() - state.callStartedAt) / 1000));
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
  }

  function setCallButtonState(active) {
    selectors.callStatus.classList.toggle("hidden", !active);
    selectors.callButton.classList.toggle("bg-emerald-400/15", active);
    selectors.callButton.classList.toggle("border-emerald-300/30", active);
    selectors.callButton.innerHTML = `<i data-lucide="${active ? "video-off" : "video"}" class="h-4 w-4"></i>`;
    refreshIcons();
  }

  // WebRTC camera controls
  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: true,
      });
      state.localStream = stream;

      if (selectors.localVideo) {
        selectors.localVideo.srcObject = stream;
        selectors.localVideo.classList.remove("hidden");
        // Hide backup avatar
        const localAvatar = selectors.localVideoFeed?.querySelector("#localVideoAvatar");
        if (localAvatar) localAvatar.classList.add("hidden");
      }

      if (selectors.remoteVideo) {
        selectors.remoteVideo.srcObject = stream;
        selectors.remoteVideo.classList.remove("hidden");
        if (selectors.remoteVideoAvatar) selectors.remoteVideoAvatar.classList.add("hidden");
        if (selectors.remoteVideoLabel) selectors.remoteVideoLabel.classList.add("hidden");
      }

      startScannerAnimation();
    } catch (err) {
      console.error("Failed to get webcam stream:", err);
      showToast("Webcam access denied or unavailable.");
      showCallFallbackAvatars();
    }
  }

  function showCallFallbackAvatars() {
    if (selectors.localVideo) selectors.localVideo.classList.add("hidden");
    if (selectors.remoteVideo) selectors.remoteVideo.classList.add("hidden");
    
    const localAvatar = selectors.localVideoFeed?.querySelector("#localVideoAvatar");
    if (localAvatar) localAvatar.classList.remove("hidden");
    if (selectors.remoteVideoAvatar) selectors.remoteVideoAvatar.classList.remove("hidden");
    if (selectors.remoteVideoLabel) selectors.remoteVideoLabel.classList.remove("hidden");
  }

  function stopCamera() {
    if (state.localStream) {
      state.localStream.getTracks().forEach((track) => track.stop());
      state.localStream = null;
    }
    if (selectors.localVideo) selectors.localVideo.srcObject = null;
    if (selectors.remoteVideo) selectors.remoteVideo.srcObject = null;

    if (state.scannerAnimationId) {
      cancelAnimationFrame(state.scannerAnimationId);
      state.scannerAnimationId = null;
    }
  }

  // Glowing tech face recognition scanner overlay loop
  function startScannerAnimation() {
    const canvas = selectors.scannerCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    if (state.scannerAnimationId) {
      cancelAnimationFrame(state.scannerAnimationId);
    }

    let scanProgress = 0;

    function resizeCanvas() {
      if (!canvas) return;
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    function draw() {
      if (!state.callConnected || !state.callActive) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const boxWidth = canvas.width * 0.52;
      const boxHeight = canvas.height * 0.62;
      const x = (canvas.width - boxWidth) / 2;
      const y = (canvas.height - boxHeight) / 2;

      const isVerified = scanProgress >= 100;
      const themeColor = isVerified ? "#22c55e" : "#eab308";
      const laserColor = isVerified ? "rgba(34, 197, 94, 0.8)" : "rgba(34, 211, 238, 0.8)";

      // Draw corner brackets
      ctx.strokeStyle = themeColor;
      ctx.lineWidth = 3.5;
      ctx.shadowBlur = 15;
      ctx.shadowColor = themeColor;

      const bracketLength = 22;

      // Top-Left
      ctx.beginPath();
      ctx.moveTo(x + bracketLength, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + bracketLength);
      ctx.stroke();

      // Top-Right
      ctx.beginPath();
      ctx.moveTo(x + boxWidth - bracketLength, y);
      ctx.lineTo(x + boxWidth, y);
      ctx.lineTo(x + boxWidth, y + bracketLength);
      ctx.stroke();

      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(x + bracketLength, y + boxHeight);
      ctx.lineTo(x, y + boxHeight);
      ctx.lineTo(x, y + boxHeight - bracketLength);
      ctx.stroke();

      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(x + boxWidth - bracketLength, y + boxHeight);
      ctx.lineTo(x + boxWidth, y + boxHeight);
      ctx.lineTo(x + boxWidth, y + boxHeight - bracketLength);
      ctx.stroke();

      if (!isVerified) {
        // Sweeping Laser Bar
        const sweepVal = (Math.sin(Date.now() / 320) + 1) / 2;
        const laserY = y + boxHeight * sweepVal;

        ctx.strokeStyle = laserColor;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = laserColor;
        ctx.beginPath();
        ctx.moveTo(x, laserY);
        ctx.lineTo(x + boxWidth, laserY);
        ctx.stroke();

        const grad = ctx.createLinearGradient(0, laserY - 18, 0, laserY);
        grad.addColorStop(0, "rgba(6, 182, 212, 0)");
        grad.addColorStop(1, "rgba(6, 182, 212, 0.15)");
        ctx.fillStyle = grad;
        ctx.shadowBlur = 0;
        ctx.fillRect(x, laserY - 18, boxWidth, 18);

        // Tech target crosshairs
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
        const cx = x + boxWidth / 2;
        const cy = y + boxHeight / 2;
        ctx.beginPath();
        ctx.moveTo(cx - 8, cy); ctx.lineTo(cx + 8, cy);
        ctx.moveTo(cx, cy - 8); ctx.lineTo(cx, cy + 8);
        ctx.stroke();

        // Hud text
        ctx.fillStyle = themeColor;
        ctx.shadowColor = themeColor;
        ctx.shadowBlur = 4;
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`BIOMETRIC FACE SCAN: ${Math.floor(scanProgress)}%`, canvas.width / 2, y - 15);
        ctx.font = "9px monospace";
        ctx.fillText("STATUS: ANALYZING FACIAL POINTS", canvas.width / 2, y + boxHeight + 20);

        scanProgress += 0.55;
      } else {
        // Success bounding HUD
        ctx.strokeStyle = "rgba(34, 197, 94, 0.25)";
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
        const cx = x + boxWidth / 2;
        const cy = y + boxHeight / 2;
        ctx.beginPath();
        ctx.moveTo(cx - 12, cy); ctx.lineTo(cx + 12, cy);
        ctx.moveTo(cx, cy - 12); ctx.lineTo(cx, cy + 12);
        ctx.stroke();

        ctx.fillStyle = themeColor;
        ctx.shadowColor = themeColor;
        ctx.shadowBlur = 6;
        ctx.font = "bold 13px monospace";
        ctx.textAlign = "center";
        ctx.fillText("FACIAL SCAN VERIFIED", canvas.width / 2, y - 26);
        ctx.font = "bold 11px monospace";

        const friend = selectedMember();
        ctx.fillText(`MATCH: ${friend ? friend.name.toUpperCase() : "COLLABORATOR"}`, canvas.width / 2, y - 10);

        ctx.font = "9px monospace";
        ctx.fillText("CONFIDENCE RATING: 99.88%", canvas.width / 2, y + boxHeight + 20);
        ctx.fillText("ACCESS CLEARANCE: GRANTED", canvas.width / 2, y + boxHeight + 35);
      }

      state.scannerAnimationId = requestAnimationFrame(draw);
    }

    state.scannerAnimationId = requestAnimationFrame(draw);
  }

  function openCallModal() {
    const member = selectedMember();
    if (!member) return;

    state.callActive = true;
    state.callConnected = false;
    state.callStartedAt = null;
    state.cameraActive = true;

    if (selectors.videoToggle) {
      selectors.videoToggle.classList.remove("bg-cyan-400/15");
      selectors.videoToggle.innerHTML = `<i data-lucide="video" class="h-4 w-4"></i>`;
    }
    if (selectors.localVideoFeed) {
      selectors.localVideoFeed.classList.remove("opacity-40", "brightness-50");
      selectors.localVideoFeed.style.transform = "scale(1)";
    }

    const initials = getInitials(member.name);
    const gradient = getAvatarGradient(member.id);
    selectors.callAvatar.className = `absolute inset-6 flex h-20 w-20 items-center justify-center rounded-[1.35rem] border border-white/20 bg-gradient-to-br ${gradient} text-2xl font-black text-white shadow-[0_18px_42px_rgba(2,6,23,0.32)] uppercase font-sans`;
    selectors.callAvatar.textContent = initials;

    if (selectors.remoteVideoAvatar) {
      selectors.remoteVideoAvatar.className = `flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br ${gradient} text-3xl font-black text-white shadow-[0_16px_40px_rgba(0,0,0,0.4)] uppercase font-sans`;
      selectors.remoteVideoAvatar.textContent = initials;
    }
    if (selectors.remoteVideoName) {
      selectors.remoteVideoName.textContent = member.name;
    }

    if (selectors.callAudioView) selectors.callAudioView.classList.remove("hidden");
    if (selectors.callVideoView) selectors.callVideoView.classList.add("hidden");
    
    selectors.callDialog.classList.add("max-w-sm");
    selectors.callDialog.classList.remove("max-w-lg");

    selectors.callName.textContent = member.name;
    selectors.callRole.textContent = member.role;
    selectors.callState.textContent = "Ringing...";
    selectors.callTimer.textContent = "Calling...";
    selectors.callStatus.textContent = `Ringing ${member.name.split(" ")[0]}...`;
    setCallButtonState(true);

    selectors.callModal.classList.remove("hidden");
    selectors.callModal.classList.add("flex");
    selectors.callModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("overflow-hidden");

    window.requestAnimationFrame(() => {
      selectors.callModal.classList.remove("opacity-0");
      selectors.callDialog.classList.remove("scale-95", "opacity-0");
      selectors.callDialog.classList.add("scale-100", "opacity-100");
    });

    window.clearTimeout(state.callConnectTimeout);
    state.callConnectTimeout = window.setTimeout(async () => {
      if (!state.callActive) return;
      state.callConnected = true;
      state.callStartedAt = Date.now();

      if (selectors.callAudioView) selectors.callAudioView.classList.add("hidden");
      if (selectors.callVideoView) selectors.callVideoView.classList.remove("hidden");
      
      selectors.callDialog.classList.remove("max-w-sm");
      selectors.callDialog.classList.add("max-w-lg");

      selectors.callTimer.textContent = "00:00";
      selectors.callStatus.textContent = `In call with ${member.name.split(" ")[0]}`;
      window.clearInterval(state.callTimer);
      state.callTimer = window.setInterval(() => {
        selectors.callTimer.textContent = callDurationLabel();
      }, 1000);

      await startCamera();
      refreshIcons();
    }, 2300);

    showToast(`Calling ${member.name}`);
    refreshIcons();
  }

  function endCall() {
    state.callActive = false;
    state.callConnected = false;
    state.callStartedAt = null;
    window.clearTimeout(state.callConnectTimeout);
    window.clearInterval(state.callTimer);
    selectors.callModal.classList.add("opacity-0");
    selectors.callDialog.classList.add("scale-95", "opacity-0");
    selectors.callDialog.classList.remove("scale-100", "opacity-100");
    selectors.callModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("overflow-hidden");
    selectors.callStatus.textContent = "";
    setCallButtonState(false);

    stopCamera();

    window.setTimeout(() => {
      selectors.callModal.classList.add("hidden");
      selectors.callModal.classList.remove("flex");
      
      selectors.callDialog.classList.add("max-w-sm");
      selectors.callDialog.classList.remove("max-w-lg");
    }, 180);

    showToast("Call ended");
  }

  function toggleCall() {
    if (state.callActive) {
      endCall();
      return;
    }
    openCallModal();
  }

  function toggleCallControl(button, activeClass, message) {
    button.classList.toggle(activeClass);
    showToast(message);
    refreshIcons();
  }

  function openMessageSearch() {
    selectors.messageSearchBar.classList.remove("hidden");
    selectors.messageSearchInput.focus();
    toggleChatMenu(false);
  }

  function closeMessageSearch() {
    state.messageQuery = "";
    selectors.messageSearchInput.value = "";
    selectors.messageSearchBar.classList.add("hidden");
    renderChat();
  }

  function deleteConversation() {
    const member = selectedMember();
    if (member) {
      member.messages = [];
    }
    state.messageQuery = "";
    selectors.messageSearchInput.value = "";
    selectors.messageSearchBar.classList.add("hidden");
    toggleChatMenu(false);
    renderChat();
    showToast("Conversation deleted");
  }

  function renderNotifications() {
    selectors.notificationList.innerHTML = notifications
      .map(
        (message) => `
          <div class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
            <span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan-400/15 text-cyan-200">
              <i data-lucide="message-square" class="h-4 w-4"></i>
            </span>
            <p class="text-sm leading-5 text-slate-300">${escapeHtml(message)}</p>
          </div>
        `
      )
      .join("");
  }

  function renderInviteProjects() {
    if (!selectors.inviteProjectsList) return;
    const projects = state.activeTeam?.projects || [];
    if (!projects.length) {
      selectors.inviteProjectsList.innerHTML = `<p class="text-xs text-slate-500">No projects in this workspace yet.</p>`;
      return;
    }
    selectors.inviteProjectsList.innerHTML = projects
      .map((project, index) => `
        <label class="flex items-center gap-2 text-sm text-gray-300">
          <input name="projects" value="${escapeHtml(project)}" class="h-4 w-4 rounded border-white/10 bg-slate-800 accent-purple-500" type="checkbox" ${index === 0 ? "checked" : ""}>
          ${escapeHtml(project)}
        </label>
      `)
      .join("");
  }

  function filterMembers() {
    const query = selectors.memberSearch.value.trim().toLowerCase();
    state.filteredMembers = members.filter((member) => {
      return `${member.name} ${member.role} ${member.status}`.toLowerCase().includes(query);
    });
    renderMembers();
  }

  function toggleSidebar(forceOpen) {
    const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : selectors.sidebar.classList.contains("-translate-x-full");
    selectors.sidebar.classList.toggle("-translate-x-full", !shouldOpen);
    selectors.sidebar.classList.toggle("translate-x-0", shouldOpen);
    selectors.sidebarOverlay.classList.toggle("hidden", !shouldOpen);
    app.classList.toggle("taskflow-sidebar-open", shouldOpen);
  }

  function setTheme(theme) {
    const activeTheme = window.TaskFlow?.theme
      ? window.TaskFlow.theme.apply(theme, { root: app, toggle: selectors.themeToggle })
      : theme;
    app.dataset.theme = activeTheme;
    document.documentElement.classList.toggle("dark", activeTheme !== "light");
    refreshIcons();
    return activeTheme;
  }

  function showToast(message) {
    if (toast) {
      toast.show(selectors.toast, message, { duration: 2200 });
      return;
    }
    selectors.toast.textContent = message;
    selectors.toast.classList.remove("hidden");
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => selectors.toast.classList.add("hidden"), 2200);
  }

  function connectWebSocket(friendId) {
    if (state.socket) {
      state.socket.close();
      state.socket = null;
    }

    const sortedIds = [currentUserId, friendId].sort((a, b) => a - b).join("_");
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/chat/${sortedIds}/`;

    state.socket = new WebSocket(wsUrl);

    state.socket.onmessage = function (event) {
      try {
        const data = JSON.parse(event.data);
        const friend = members.find((m) => m.id === friendId);
        if (friend) {
          friend.messages = friend.messages || [];
          // Avoid duplicating local-echoed/same message if received from room broadcast
          // Check if message with identical content exists from this sender in last 1.5 seconds if needed, or simply append.
          // Since Django broadcasts back, the standard logic is to append it here.
          friend.messages.push({
            body: data.message,
            sender_id: data.sender_id,
            sender_name: data.sender_name,
            time: data.time || "Just now",
          });
          if (state.selectedId === friendId) {
            renderChat();
          }
        }
      } catch (err) {
        console.error("Error parsing socket message:", err);
      }
    };

    state.socket.onclose = function () {
      console.log("Chat socket closed for room:", sortedIds);
    };

    state.socket.onerror = function (error) {
      console.error("Chat socket error:", error);
    };
  }

  async function loadFriendsList() {
    try {
      const activeWorkspaceId = window.localStorage.getItem("taskflow-active-workspace") || "";
      const url = new URL("/api/teams/data/", window.location.origin);
      if (activeWorkspaceId) {
        url.searchParams.set("workspace_id", activeWorkspaceId);
      }
      const data = await api.get(`${url.pathname}${url.search}`);
      state.activeTeam = data.team || null;
      if (state.activeTeam?.inviteUrl) {
        app.dataset.inviteUrl = state.activeTeam.inviteUrl;
        if (selectors.inviteForm) {
          selectors.inviteForm.dataset.inviteUrl = state.activeTeam.inviteUrl;
        }
      }
      renderInviteProjects();
      notifications = (data.notifications || []).map((item) => item.body || item);
      members = (data.members || []).map(m => ({
        ...m,
        messages: m.messages || []
      }));
      state.filteredMembers = members.slice();
      
      const memberCountBadge = document.querySelector("header span.rounded-full") || document.querySelector(".inline-flex.h-8.items-center.justify-center.rounded-full");
      if (memberCountBadge) {
        memberCountBadge.textContent = `${members.length} member${members.length === 1 ? "" : "s"}`;
      }
      
      if (members.length > 0 && !state.selectedId) {
        state.selectedId = members[0].id;
      }
    } catch (err) {
      console.error("Error loading workspace members:", err);
      showToast("Error loading workspace members list.");
    }
  }

  async function loadPendingRequests() {
    try {
      const data = await api.get("/api/friends/requests/");
      pendingRequests = data.data || [];
      renderRequestsTab();
    } catch (err) {
      console.error("Error loading requests:", err);
    }
  }

  function renderRequestsTab() {
    const count = pendingRequests.length;
    if (count > 0) {
      selectors.requestsCount.textContent = count;
      selectors.requestsCount.classList.remove("hidden");
    } else {
      selectors.requestsCount.classList.add("hidden");
    }

    if (pendingRequests.length === 0) {
      selectors.pendingRequestsList.innerHTML = `
        <p class="text-center text-xs text-slate-500 py-6">No pending friend requests.</p>
      `;
      return;
    }

    selectors.pendingRequestsList.innerHTML = pendingRequests
      .map(
        (req) => `
        <div class="flex flex-col gap-2.5 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-left">
          <div>
            <p class="text-xs font-bold text-white">${escapeHtml(req.sender_name)}</p>
            <p class="text-[10px] text-slate-400 truncate">${escapeHtml(req.sender_email)}</p>
          </div>
          <div class="flex items-center gap-2">
            <button class="accept-request-btn min-h-10 flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-xs font-bold text-white transition hover:brightness-110" type="button" data-request-id="${req.request_id}">Accept</button>
            <button class="decline-request-btn min-h-10 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-slate-300 transition" type="button" data-request-id="${req.request_id}">Decline</button>
          </div>
        </div>
      `
      )
      .join("");
  }

  function setupTabs() {
    selectors.tabFriends.addEventListener("click", () => switchTab("friends"));
    selectors.tabFindFriends.addEventListener("click", () => switchTab("find"));
    selectors.tabRequests.addEventListener("click", () => {
      switchTab("requests");
      loadPendingRequests();
    });
  }

  function switchTab(tabName) {
    state.activeTab = tabName;
    
    selectors.tabFriends.classList.toggle("bg-white/10", tabName === "friends");
    selectors.tabFriends.classList.toggle("text-white", tabName === "friends");
    selectors.tabFriends.classList.toggle("text-slate-400", tabName !== "friends");

    selectors.tabFindFriends.classList.toggle("bg-white/10", tabName === "find");
    selectors.tabFindFriends.classList.toggle("text-white", tabName === "find");
    selectors.tabFindFriends.classList.toggle("text-slate-400", tabName !== "find");

    selectors.tabRequests.classList.toggle("bg-white/10", tabName === "requests");
    selectors.tabRequests.classList.toggle("text-white", tabName === "requests");
    selectors.tabRequests.classList.toggle("text-slate-400", tabName !== "requests");

    selectors.friendsView.classList.toggle("hidden", tabName !== "friends");
    selectors.findFriendsView.classList.toggle("hidden", tabName !== "find");
    selectors.requestsView.classList.toggle("hidden", tabName !== "requests");
  }

  function invitePayload() {
    const formData = new FormData(selectors.inviteForm);
    return {
      email: String(formData.get("email") || "").trim(),
      role: String(formData.get("role") || "member").trim().toLowerCase(),
      positions: String(formData.get("positions") || "Member").trim(),
      projects: formData.getAll("projects").map((project) => String(project).trim()).filter(Boolean),
      message: String(formData.get("message") || "").trim(),
    };
  }

  function openInviteModal() {
    if (!state.activeTeam?.inviteUrl) {
      showToast("Create a workspace before inviting members.");
      return;
    }
    selectors.inviteModal.classList.remove("hidden");
    selectors.inviteModal.classList.add("flex");
    selectors.inviteModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("overflow-hidden");

    window.requestAnimationFrame(() => {
      selectors.inviteModal.classList.remove("opacity-0");
      selectors.inviteDialog.classList.remove("scale-95", "opacity-0");
      selectors.inviteDialog.classList.add("scale-100", "opacity-100");
      selectors.inviteForm.querySelector("input")?.focus();
    });
  }

  function closeInviteModal() {
    selectors.inviteModal.classList.add("opacity-0");
    selectors.inviteDialog.classList.add("scale-95", "opacity-0");
    selectors.inviteDialog.classList.remove("scale-100", "opacity-100");
    selectors.inviteModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("overflow-hidden");

    window.setTimeout(() => {
      selectors.inviteModal.classList.add("hidden");
      selectors.inviteModal.classList.remove("flex");
    }, 180);
  }

  function bindEvents() {
    selectors.sidebarToggle.addEventListener("click", () => toggleSidebar());
    selectors.sidebarOverlay.addEventListener("click", () => toggleSidebar(false));

    document.querySelectorAll(".team-nav-link").forEach((link) => {
      link.addEventListener("click", () => toggleSidebar(false));
    });

    selectors.memberSearch.addEventListener("input", filterMembers);

    selectors.memberList.addEventListener("click", (event) => {
      const memberButton = event.target.closest("[data-member-id]");
      if (!memberButton) return;
      state.selectedId = Number(memberButton.dataset.memberId);
      state.messageQuery = "";
      state.callActive = false;
      state.callConnected = false;
      window.clearTimeout(state.callConnectTimeout);
      window.clearInterval(state.callTimer);
      selectors.messageSearchInput.value = "";
      selectors.messageSearchBar.classList.add("hidden");
      selectors.callStatus.classList.add("hidden");
      setCallButtonState(false);
      renderMembers();
      renderChat();
      
      connectWebSocket(state.selectedId);
      
      refreshIcons();
    });

    selectors.messageForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const body = selectors.messageInput.value.trim();
      if (!body) return;

      if (state.socket && state.socket.readyState === WebSocket.OPEN) {
        state.socket.send(JSON.stringify({
          message: body
        }));
      } else {
        showToast("Chat socket is not connected.");
      }
      selectors.messageInput.value = "";
    });

    selectors.notificationToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      selectors.notificationDropdown.classList.toggle("hidden");
    });

    selectors.callButton.addEventListener("click", toggleCall);
    selectors.endCall.addEventListener("click", endCall);
    selectors.muteCall.addEventListener("click", () => toggleCallControl(selectors.muteCall, "bg-cyan-400/15", "Mute toggled"));
    selectors.speakerCall.addEventListener("click", () => toggleCallControl(selectors.speakerCall, "bg-cyan-400/15", "Speaker toggled"));
    
    if (selectors.videoToggle) {
      selectors.videoToggle.addEventListener("click", () => {
        state.cameraActive = !state.cameraActive;
        selectors.videoToggle.classList.toggle("bg-cyan-400/15", !state.cameraActive);
        
        if (state.cameraActive) {
          if (selectors.localVideo) selectors.localVideo.classList.remove("hidden");
          const localAvatar = selectors.localVideoFeed?.querySelector("#localVideoAvatar");
          if (localAvatar) localAvatar.classList.add("hidden");
          showToast("Camera enabled");
          
          if (state.localStream) {
            state.localStream.getVideoTracks().forEach(track => track.enabled = true);
          }
        } else {
          if (selectors.localVideo) selectors.localVideo.classList.add("hidden");
          const localAvatar = selectors.localVideoFeed?.querySelector("#localVideoAvatar");
          if (localAvatar) localAvatar.classList.remove("hidden");
          showToast("Camera disabled");
          
          if (state.localStream) {
            state.localStream.getVideoTracks().forEach(track => track.enabled = false);
          }
        }
        selectors.videoToggle.innerHTML = `<i data-lucide="${state.cameraActive ? "video" : "video-off"}" class="h-4 w-4"></i>`;
        refreshIcons();
      });
    }

    selectors.chatMenuButton.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleChatMenu();
    });
    selectors.searchMessagesButton.addEventListener("click", openMessageSearch);
    selectors.deleteConversationButton.addEventListener("click", deleteConversation);
    selectors.messageSearchInput.addEventListener("input", () => {
      state.messageQuery = selectors.messageSearchInput.value.trim();
      renderChat();
    });
    selectors.messageSearchClose.addEventListener("click", closeMessageSearch);

    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-empty-invite]")) {
        openInviteModal();
        return;
      }
      if (event.target.closest("[data-empty-find-friends]")) {
        switchTab("find");
        return;
      }
      if (!event.target.closest("#teamNotificationToggle") && !event.target.closest("#teamNotificationDropdown")) {
        selectors.notificationDropdown.classList.add("hidden");
      }
      if (!event.target.closest("#teamChatMenuButton") && !event.target.closest("#teamChatMenu")) {
        toggleChatMenu(false);
      }
    });

    selectors.themeToggle.addEventListener("click", () => {
      const nextTheme = app.dataset.theme === "light" ? "dark" : "light";
      const activeTheme = setTheme(nextTheme);
      showToast(`${activeTheme === "light" ? "Light" : "Dark"} mode enabled`);
    });

    selectors.inviteButton.addEventListener("click", openInviteModal);
    selectors.inviteClose.addEventListener("click", closeInviteModal);
    selectors.inviteCancel.addEventListener("click", closeInviteModal);

    selectors.inviteModal.addEventListener("click", (event) => {
      if (event.target === selectors.inviteModal) closeInviteModal();
    });

    selectors.inviteForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      selectors.inviteSubmit.disabled = true;
      selectors.inviteSubmit.innerHTML = '<i data-lucide="loader-2" class="h-4 w-4 animate-spin"></i> Sending...';
      refreshIcons();

      try {
        const data = await teamApi.sendInvite(app, selectors.inviteForm, invitePayload());
        closeInviteModal();
        showToast(data.message || "Invitation sent");
        selectors.inviteForm.reset();
      } catch (error) {
        showToast(error.message || "Could not send invitation");
      } finally {
        selectors.inviteSubmit.disabled = false;
        selectors.inviteSubmit.innerHTML = '<i data-lucide="mail" class="h-4 w-4"></i> Send Invitation';
        refreshIcons();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        toggleSidebar(false);
        selectors.notificationDropdown.classList.add("hidden");
        toggleChatMenu(false);
        if (!selectors.messageSearchBar.classList.contains("hidden")) closeMessageSearch();
        if (state.callActive) endCall();
        if (!selectors.inviteModal.classList.contains("hidden")) closeInviteModal();
      }
    });

    // Find Friends user input searching
    let searchTimeout = null;
    selectors.userSearchInput.addEventListener("input", () => {
      clearTimeout(searchTimeout);
      const query = selectors.userSearchInput.value.trim();
      if (!query) {
        selectors.userSearchResults.innerHTML = `<p class="text-center text-xs text-slate-500 py-4">Search users to add them as friends.</p>`;
        return;
      }
      searchTimeout = setTimeout(async () => {
        try {
          const res = await api.get(`/api/friends/search/?q=${encodeURIComponent(query)}`);
          const users = res.data || [];
          if (users.length === 0) {
            selectors.userSearchResults.innerHTML = `<p class="text-center text-xs text-slate-400 py-4">No users found matching query.</p>`;
            return;
          }

          selectors.userSearchResults.innerHTML = users
            .map(
              (u) => {
                let actionBtnHtml = "";
                if (u.friendship_status === "none") {
                  actionBtnHtml = `<button class="send-request-btn min-h-10 rounded-xl bg-white/10 hover:bg-white/15 px-3 text-xs font-bold text-white transition" type="button" data-user-id="${u.id}"><i data-lucide="user-plus" class="h-3 w-3 inline mr-1"></i>Add</button>`;
                } else if (u.friendship_status === "friends") {
                  actionBtnHtml = `<span class="text-xs font-semibold text-emerald-400"><i data-lucide="check" class="h-3 w-3 inline mr-1"></i>Friends</span>`;
                } else if (u.friendship_status === "pending_sent") {
                  actionBtnHtml = `<span class="text-xs font-medium text-slate-500">Requested</span>`;
                } else if (u.friendship_status === "pending_received") {
                  actionBtnHtml = `<button class="accept-request-btn min-h-10 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-3 text-xs font-bold text-white transition hover:brightness-110" type="button" data-request-id="${u.request_id}">Accept</button>`;
                }

                return `
                <div class="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-left">
                  <div class="min-w-0 flex-1">
                    <p class="text-xs font-bold text-white truncate">${escapeHtml(u.name)}</p>
                    <p class="text-[9px] text-slate-400 truncate">${escapeHtml(u.email)}</p>
                  </div>
                  <div>
                    ${actionBtnHtml}
                  </div>
                </div>
              `;
              }
            )
            .join("");
          refreshIcons();
        } catch (err) {
          console.error("Error searching users:", err);
        }
      }, 300);
    });

    // Friendship request action delegates
    document.addEventListener("click", async (event) => {
      // Add Friend request
      const reqBtn = event.target.closest(".send-request-btn");
      if (reqBtn) {
        event.preventDefault();
        const userId = reqBtn.dataset.userId;
        reqBtn.disabled = true;
        try {
          await api.post("/api/friends/request/", { user_id: userId });
          showToast("Friend request sent!");
          selectors.userSearchInput.dispatchEvent(new Event("input"));
        } catch (err) {
          showToast(err.message || "Failed to send request.");
          reqBtn.disabled = false;
        }
      }

      // Accept Friend request
      const acceptBtn = event.target.closest(".accept-request-btn");
      if (acceptBtn) {
        event.preventDefault();
        const requestId = acceptBtn.dataset.requestId;
        acceptBtn.disabled = true;
        try {
          await api.post("/api/friends/respond/", { request_id: requestId, action: "accept" });
          showToast("Friend request accepted!");
          await loadFriendsList();
          await loadPendingRequests();
          renderMembers();
          renderChat();
          if (state.activeTab === "find") {
            selectors.userSearchInput.dispatchEvent(new Event("input"));
          }
        } catch (err) {
          showToast(err.message || "Failed to accept request.");
          acceptBtn.disabled = false;
        }
      }

      // Decline Friend request
      const declineBtn = event.target.closest(".decline-request-btn");
      if (declineBtn) {
        event.preventDefault();
        const requestId = declineBtn.dataset.requestId;
        declineBtn.disabled = true;
        try {
          await api.post("/api/friends/respond/", { request_id: requestId, action: "decline" });
          showToast("Friend request declined.");
          await loadPendingRequests();
        } catch (err) {
          showToast(err.message || "Failed to decline request.");
          declineBtn.disabled = false;
        }
      }
    });
  }

  function refreshIcons() {
    if (window.TaskFlow && typeof window.TaskFlow.refreshIcons === "function") {
      window.TaskFlow.refreshIcons();
      return;
    }
    if (window.lucide) window.lucide.createIcons();
  }

  async function init() {
    if (initialized) return;
    initialized = true;
    setTheme(window.TaskFlow?.theme?.current() || "dark");
    
    await loadFriendsList();
    
    if (state.selectedId) {
      connectWebSocket(state.selectedId);
    }

    await loadPendingRequests();

    const userRole = app.dataset.userRole || "viewer";
    if (userRole === "viewer" || userRole === "member") {
      if (selectors.inviteButton) selectors.inviteButton.classList.add("hidden");
      if (selectors.deleteConversationButton) selectors.deleteConversationButton.classList.add("hidden");
    }

      const activeWorkspaceName = state.activeTeam?.name || window.localStorage.getItem("taskflow-active-project") || "TaskFlow Workspace";
    const workspaceNameEl = document.querySelector("#teamSidebar p.text-sm.font-bold.text-white");
    if (workspaceNameEl) {
      workspaceNameEl.textContent = activeWorkspaceName;
    }

    renderNotifications();
    renderMembers();
    renderChat();
    setupTabs();
    bindEvents();
    refreshIcons();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
