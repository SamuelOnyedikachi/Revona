import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/urls';

/**
 * useSocket
 * Returns { sendMessage, joinRoom } and handles connection lifecycle
 *
 * @param {string|null} requestId  — room to join (null = no socket needed)
 * @param {(msg) => void} onMessage — callback for received messages
 */
export default function useSocket(requestId, onMessage) {
  const socketRef = useRef(null);

  const getToken = () => localStorage.getItem('revora_token');

  useEffect(() => {
    if (!requestId) return;

    const token = getToken();
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_request_room', requestId);
    });

    socket.on('receive_message', (msg) => {
      onMessage?.(msg);
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [requestId]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = useCallback(
    (message) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('send_message', { requestId, message });
      }
    },
    [requestId]
  );

  const joinRoom = useCallback((id) => {
    socketRef.current?.emit('join_request_room', id);
  }, []);

  return { sendMessage, joinRoom };
}
