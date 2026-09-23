import { io } from 'socket.io-client';

let socket = null;
const SOCKET_URL = 'http://localhost:9092';

/**
 * Initialize or get singleton Socket.IO connection with JWT authentication.
 */
export const getSocket = () => {
  const token = sessionStorage.getItem('adalat_token') || localStorage.getItem('adalat_token');

  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      query: { token: token || '' },
      auth: { token: token || '' },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('✅ Connected to Adalat Socket.IO server:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('⚠️ Socket.IO connect error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket.IO disconnected:', reason);
    });
  } else if (socket.disconnected) {
    if (socket.io && socket.io.opts) {
      socket.io.opts.query = { token: token || '' };
      socket.io.opts.auth = { token: token || '' };
    }
    socket.connect();
  }

  return socket;
};

/**
 * Join a specific consultation chat room.
 */
export const joinConsultationRoom = (consultationRequestId) => {
  if (!consultationRequestId) return;
  const s = getSocket();
  const cId = Number(consultationRequestId);

  const doJoin = () => {
    if (s && s.connected) {
      s.emit('join_consultation', { consultationRequestId: cId });
      console.log(`📡 Joined consultation room: consultation:${cId}`);
    }
  };

  if (s && s.connected) {
    doJoin();
  } else if (s) {
    s.once('connect', doJoin);
  }
};

/**
 * Leave consultation chat room.
 */
export const leaveConsultationRoom = (consultationRequestId) => {
  if (!consultationRequestId || !socket) return;
  const cId = Number(consultationRequestId);
  if (socket.connected) {
    socket.emit('leave_consultation', { consultationRequestId: cId });
  }
};

/**
 * Emit message read/seen event to mark messages as read in real time.
 */
export const emitMessageRead = (consultationRequestId, messageIds) => {
  if (!consultationRequestId) return;
  const s = getSocket();
  if (s && s.connected) {
    s.emit('message_read', { 
      consultationRequestId: Number(consultationRequestId),
      messageIds: messageIds || []
    });
    s.emit('message_seen', { 
      consultationRequestId: Number(consultationRequestId),
      messageIds: messageIds || []
    });
  }
};

export const emitMessageSeen = (consultationRequestId, messageIds) => {
  emitMessageRead(consultationRequestId, messageIds);
};

/**
 * Emit message delivered event when recipient socket receives the message.
 */
export const emitMessageDelivered = (consultationRequestId, messageIds) => {
  if (!consultationRequestId) return;
  const s = getSocket();
  if (s && s.connected) {
    s.emit('message_delivered', { 
      consultationRequestId: Number(consultationRequestId),
      messageIds: messageIds || []
    });
  }
};
