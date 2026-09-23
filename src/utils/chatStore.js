import { consultationApi } from '../api/consultationApi';
import { getSocket, joinConsultationRoom, leaveConsultationRoom, emitMessageDelivered, emitMessageRead } from './socket';

const CHAT_PREFIX = 'adalat_chat_msgs_';
const TIMER_PREFIX = 'adalat_timer_start_';

/**
 * Retrieve cached chat messages from local storage without dummy data.
 */
export const getChatMessages = (consultationId) => {
  if (!consultationId) return [];
  try {
    const raw = localStorage.getItem(`${CHAT_PREFIX}${consultationId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(m => m && ((m.text || m.message || '').trim().length > 0 || m.attachmentUrl));
      }
    }
  } catch (e) {}

  // Return empty array - NO dummy data
  return [];
};

/**
 * Send chat message, upload attachments if provided, persist to MySQL database via Backend REST API & Socket.IO, and update UI state.
 */
export const sendChatMessage = async (consultationId, sender, text, file = null, attachmentMeta = null) => {
  if (!consultationId) return [];
  const hasText = text && String(text).trim().length > 0;
  const hasFile = file != null;
  const hasMeta = attachmentMeta && (attachmentMeta.attachmentUrl || attachmentMeta.url);

  if (!hasText && !hasFile && !hasMeta) return getChatMessages(consultationId);

  const textToSend = hasText ? String(text).trim() : '';
  const cId = Number(consultationId);
  let savedDto = null;

  // 1. If physical File object is passed, upload directly via multipart endpoint
  if (hasFile) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (textToSend) {
        formData.append('text', textToSend);
        formData.append('message', textToSend);
      }

      const res = sender === 'CUSTOMER'
        ? await consultationApi.uploadConsultationAttachmentCustomer(cId, formData)
        : await consultationApi.uploadConsultationAttachmentLawyer(cId, formData);

      savedDto = res && res.data ? (res.data.data || res.data) : null;
    } catch (e) {
      console.warn('Backend attachment upload error:', e);
    }
  } else {
    // 1b. Post directly to MySQL Database via backend REST API (with optional attachment meta)
    try {
      const attachmentPayload = hasMeta ? attachmentMeta : null;
      const res = sender === 'CUSTOMER'
        ? await consultationApi.sendConsultationMessageCustomer(cId, textToSend, attachmentPayload)
        : await consultationApi.sendConsultationMessageLawyer(cId, textToSend, attachmentPayload);

      savedDto = res && res.data ? (res.data.data || res.data) : null;
    } catch (e) {
      console.warn('Backend REST API message save error:', e);
    }
  }

  // 2. Also emit send_message_direct over socket as instant broadcast backup
  try {
    const socket = getSocket();
    if (socket && socket.connected && savedDto) {
      socket.emit('send_message_direct', savedDto);
    }
  } catch (e) {}

  // 3. Build real message object with initial status SENT (1 grey tick ✓)
  const current = getChatMessages(cId);
  const newMsg = {
    id: savedDto?.id || Date.now(),
    sender: savedDto?.senderType || sender,
    senderType: savedDto?.senderType || sender,
    senderName: savedDto?.senderName || (sender === 'CUSTOMER' ? 'You' : 'Advocate'),
    text: savedDto?.message || textToSend,
    message: savedDto?.message || textToSend,
    attachmentUrl: savedDto?.attachmentUrl || attachmentMeta?.attachmentUrl || attachmentMeta?.url || null,
    attachmentName: savedDto?.attachmentName || attachmentMeta?.attachmentName || file?.name || null,
    attachmentType: savedDto?.attachmentType || attachmentMeta?.attachmentType || file?.type || null,
    attachmentSize: savedDto?.attachmentSize || attachmentMeta?.attachmentSize || file?.size || null,
    status: (savedDto?.status || 'SENT').toUpperCase(), // Initial status is SENT (1 grey tick ✓)
    createdAt: savedDto?.createdAt || new Date().toISOString(),
    deliveredAt: savedDto?.deliveredAt || null,
    seenAt: savedDto?.seenAt || null,
    timestamp: savedDto?.createdAt 
      ? new Date(savedDto.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const updated = [...current.filter(m => m.id !== newMsg.id), newMsg];
  try {
    localStorage.setItem(`${CHAT_PREFIX}${cId}`, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('adalat_chat_update', { detail: { consultationId: cId } }));
  } catch (e) {}

  return updated;
};

const isUserViewingChat = (isChatOpen) => {
  if (!isChatOpen) return false;
  if (typeof document === 'undefined') return false;
  if (document.hidden || document.visibilityState === 'hidden') return false;
  return true;
};

/**
 * Subscribe to real-time chat updates directly from MySQL Database and Socket.IO with WhatsApp-style tick transitions.
 */
export const subscribeToChat = (consultationId, onUpdate, isLawyer = false, isChatOpen = true) => {
  if (!consultationId) return () => {};

  const cId = Number(consultationId);
  const myRole = isLawyer ? 'LAWYER' : 'CUSTOMER';

  // 1. Join room on Socket.IO
  joinConsultationRoom(cId);

  // Helper to mark unread incoming messages as SEEN only when user is genuinely viewing
  const markIncomingAsSeen = (specificIds = null) => {
    if (!isUserViewingChat(isChatOpen)) return;

    let targetIds = specificIds;
    if (!targetIds) {
      const current = getChatMessages(cId);
      targetIds = current
        .filter(m => (m.sender !== myRole && m.senderType !== myRole) && m.status !== 'SEEN')
        .map(m => m.id);
    }

    if (targetIds && targetIds.length > 0) {
      emitMessageRead(cId, targetIds);
      if (isLawyer) {
        consultationApi.markConsultationMessagesSeenLawyer(cId, targetIds);
      } else {
        consultationApi.markConsultationMessagesSeenCustomer(cId, targetIds);
      }
    }
  };

  // Initial read trigger if viewing
  if (isUserViewingChat(isChatOpen)) {
    markIncomingAsSeen();
  }

  // 3. Database Sync Function
  const syncFromDb = async () => {
    try {
      const apiCall = isLawyer 
        ? consultationApi.getConsultationMessagesLawyer(cId)
        : consultationApi.getConsultationMessagesCustomer(cId);

      const res = await apiCall;
      const dbMsgs = res && res.data ? (res.data.data || res.data) : [];
      if (Array.isArray(dbMsgs)) {
        const unreadIncomingIds = [];
        const undeliveredIncomingIds = [];
        const isViewing = isUserViewingChat(isChatOpen);

        const formatted = dbMsgs
          .filter(m => m && ((m.message || m.text || '').trim().length > 0 || m.attachmentUrl))
          .map(m => {
            const status = (m.status || 'SENT').toUpperCase();
            const isIncoming = m.senderType !== myRole;

            if (isIncoming && status === 'SENT') {
              undeliveredIncomingIds.push(m.id);
            }
            if (isIncoming && isViewing && status !== 'SEEN') {
              unreadIncomingIds.push(m.id);
            }

            return {
              id: m.id,
              sender: m.senderType || 'CUSTOMER',
              senderType: m.senderType || 'CUSTOMER',
              senderName: m.senderName || '',
              text: m.message || m.text || '',
              message: m.message || m.text || '',
              attachmentUrl: m.attachmentUrl || null,
              attachmentName: m.attachmentName || null,
              attachmentType: m.attachmentType || null,
              attachmentSize: m.attachmentSize || null,
              status: (isIncoming && isViewing ? 'SEEN' : status), // 'SENT' | 'DELIVERED' | 'SEEN'
              createdAt: m.createdAt,
              deliveredAt: m.deliveredAt,
              seenAt: m.seenAt,
              timestamp: m.createdAt 
                ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                : 'Just now'
            };
          });

        // Acknowledge delivery for all undelivered incoming messages
        if (undeliveredIncomingIds.length > 0) {
          emitMessageDelivered(cId, undeliveredIncomingIds);
          if (isLawyer) {
            consultationApi.markConsultationMessagesDeliveredLawyer(cId, undeliveredIncomingIds);
          } else {
            consultationApi.markConsultationMessagesDeliveredCustomer(cId, undeliveredIncomingIds);
          }
        }

        // Acknowledge read only if the user is actively viewing this room
        if (isViewing && unreadIncomingIds.length > 0) {
          markIncomingAsSeen(unreadIncomingIds);
        }

        localStorage.setItem(`${CHAT_PREFIX}${cId}`, JSON.stringify(formatted));
        onUpdate(formatted);
        return;
      }
    } catch (e) {}

    const msgs = getChatMessages(cId);
    onUpdate(msgs);
  };

  syncFromDb();

  // 4. Socket.IO Real-Time Event Handlers
  const socket = getSocket();

  const handleSocketNewMessage = (msgDto) => {
    if (!msgDto || Number(msgDto.consultationRequestId) !== cId) return;
    const msgText = (msgDto.message || msgDto.text || '').trim();
    if (!msgText && !msgDto.attachmentUrl) return; // Skip empty messages with no attachment

    const isIncoming = msgDto.senderType !== myRole;
    let finalStatus = (msgDto.status || 'SENT').toUpperCase();

    if (isIncoming) {
      // Always acknowledge delivery immediately
      emitMessageDelivered(cId, [msgDto.id]);
      if (isLawyer) {
        consultationApi.markConsultationMessagesDeliveredLawyer(cId, [msgDto.id]);
      } else {
        consultationApi.markConsultationMessagesDeliveredCustomer(cId, [msgDto.id]);
      }
      finalStatus = 'DELIVERED';

      // Only acknowledge read if user is actively viewing and focused on this room
      if (isUserViewingChat(isChatOpen)) {
        markIncomingAsSeen([msgDto.id]);
        finalStatus = 'SEEN';
      }
    }

    const current = getChatMessages(cId);
    const incoming = {
      id: msgDto.id,
      sender: msgDto.senderType || 'CUSTOMER',
      senderType: msgDto.senderType || 'CUSTOMER',
      senderName: msgDto.senderName || '',
      text: msgText,
      message: msgText,
      attachmentUrl: msgDto.attachmentUrl || null,
      attachmentName: msgDto.attachmentName || null,
      attachmentType: msgDto.attachmentType || null,
      attachmentSize: msgDto.attachmentSize || null,
      status: finalStatus,
      createdAt: msgDto.createdAt || new Date().toISOString(),
      deliveredAt: msgDto.deliveredAt,
      seenAt: msgDto.seenAt,
      timestamp: msgDto.createdAt 
        ? new Date(msgDto.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        : 'Just now'
    };

    const exists = current.some(m => m.id === incoming.id);
    const updated = exists 
      ? current.map(m => m.id === incoming.id ? incoming : m)
      : [...current, incoming];

    localStorage.setItem(`${CHAT_PREFIX}${cId}`, JSON.stringify(updated));
    onUpdate(updated);
  };

  // Handler for message_status_updated / messages_seen / messages_delivered
  const handleStatusUpdate = (data) => {
    if (!data || Number(data.consultationRequestId) !== cId) return;

    const targetStatus = (data.status || 'DELIVERED').toUpperCase();
    const targetIds = Array.isArray(data.messageIds) ? data.messageIds.map(Number) : [];

    const current = getChatMessages(cId);
    let changed = false;

    const updated = current.map(m => {
      const isOutgoing = m.sender === myRole || m.senderType === myRole;
      if (!isOutgoing) return m;

      // If specific messageIds provided, only match those; otherwise update all matching
      const idMatches = targetIds.length === 0 || targetIds.includes(Number(m.id));
      if (!idMatches) return m;

      // Progress status: SENT -> DELIVERED -> SEEN
      if (targetStatus === 'SEEN' && m.status !== 'SEEN') {
        changed = true;
        return { ...m, status: 'SEEN', seenAt: data.seenAt || new Date().toISOString() };
      } else if (targetStatus === 'DELIVERED' && m.status === 'SENT') {
        changed = true;
        return { ...m, status: 'DELIVERED', deliveredAt: data.deliveredAt || new Date().toISOString() };
      }

      return m;
    });

    if (changed) {
      localStorage.setItem(`${CHAT_PREFIX}${cId}`, JSON.stringify(updated));
      onUpdate(updated);
    }
  };

  if (socket) {
    socket.on('new_message', handleSocketNewMessage);
    socket.on('message_status_updated', handleStatusUpdate);
    socket.on('messages_seen', handleStatusUpdate);
    socket.on('messages_delivered', handleStatusUpdate);
  }

  // 5. Cross-tab and Local Storage Listeners
  const handleUpdate = () => {
    const msgs = getChatMessages(cId);
    onUpdate(msgs);
  };

  const handleFocusOrVisible = () => {
    if (isUserViewingChat(isChatOpen)) {
      markIncomingAsSeen();
    }
  };

  const windowListener = (e) => {
    if (e.type === 'adalat_chat_update' && e.detail?.consultationId === cId) {
      handleUpdate();
    }
    if (e.type === 'storage' && e.key === `${CHAT_PREFIX}${cId}`) {
      handleUpdate();
    }
  };

  window.addEventListener('adalat_chat_update', windowListener);
  window.addEventListener('storage', windowListener);
  window.addEventListener('focus', handleFocusOrVisible);
  window.addEventListener('click', handleFocusOrVisible);
  document.addEventListener('visibilitychange', handleFocusOrVisible);

  // 6. Polling fallback (every 2s) to guarantee database consistency
  const intervalId = setInterval(syncFromDb, 2000);

  return () => {
    window.removeEventListener('adalat_chat_update', windowListener);
    window.removeEventListener('storage', windowListener);
    window.removeEventListener('focus', handleFocusOrVisible);
    window.removeEventListener('click', handleFocusOrVisible);
    document.removeEventListener('visibilitychange', handleFocusOrVisible);
    clearInterval(intervalId);

    if (socket) {
      socket.off('new_message', handleSocketNewMessage);
      socket.off('message_status_updated', handleStatusUpdate);
      socket.off('messages_seen', handleStatusUpdate);
      socket.off('messages_delivered', handleStatusUpdate);
    }

    leaveConsultationRoom(cId);
  };
};

export const resetConsultationTimer = (consultationId) => {
  if (!consultationId) return;
  const key = `${TIMER_PREFIX}${consultationId}`;
  localStorage.setItem(key, String(Date.now()));
};

export const getSharedTimerSeconds = (consultationId, totalDurationSeconds = 120) => {
  if (!consultationId) return totalDurationSeconds;
  const key = `${TIMER_PREFIX}${consultationId}`;
  try {
    let startTime = localStorage.getItem(key);
    if (!startTime) {
      startTime = String(Date.now());
      localStorage.setItem(key, startTime);
    }
    const elapsedSeconds = Math.floor((Date.now() - parseInt(startTime, 10)) / 1000);
    const remaining = totalDurationSeconds - elapsedSeconds;
    return remaining > 0 ? remaining : 0;
  } catch (e) {
    return totalDurationSeconds;
  }
};
