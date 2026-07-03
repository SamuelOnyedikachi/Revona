import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, TextField, IconButton, Paper,
  Avatar, Chip, Divider, CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import useSocket from '../../hooks/useSocket';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

/**
 * ChatWindow
 * Props:
 *   requestId: string
 *   otherUser: { _id, name, role }
 *   request: Request object (for context header)
 */
export default function ChatWindow({ requestId, otherUser, request }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connecting, setConnecting] = useState(true);
  const bottomRef = useRef(null);

  const handleIncoming = (msg) => {
    setMessages((prev) => [...prev, msg]);
    setConnecting(false);
  };

  const { sendMessage } = useSocket(requestId, handleIncoming);

  // Set connecting=false after short delay (socket connects async)
  useEffect(() => {
    const t = setTimeout(() => setConnecting(false), 1500);
    return () => clearTimeout(t);
  }, [requestId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // Optimistic update
    const optimistic = {
      sender: { _id: user._id, name: user.name },
      message: trimmed,
      timestamp: new Date().toISOString(),
      local: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    sendMessage(trimmed);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isMe = (msg) => msg.sender?._id === user?._id || msg.local;

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 480,
        border: '1.5px solid',
        borderColor: 'divider',
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          background: 'linear-gradient(135deg,#1b4332,#2d6a4f)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Avatar sx={{ width: 36, height: 36, bgcolor: '#52b788', fontSize: 14 }}>
          {otherUser?.name?.[0]}
        </Avatar>
        <Box flexGrow={1}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#fff' }}>
            {otherUser?.name}
          </Typography>
          <Chip
            label={otherUser?.role}
            size="small"
            sx={{ height: 18, fontSize: 10, color: '#d8f3dc', bgcolor: 'rgba(255,255,255,0.15)' }}
          />
        </Box>
        {connecting && <CircularProgress size={16} sx={{ color: '#fff' }} />}
      </Box>

      {/* Context strip */}
      {request?.listing && (
        <Box sx={{ px: 2.5, py: 1, bgcolor: '#f0faf4', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            Re: <strong>{request.listing.title}</strong> · {request.listing.quantityKg} kg
          </Typography>
        </Box>
      )}

      {/* Messages */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {messages.length === 0 && !connecting && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No messages yet. Start the conversation!
            </Typography>
          </Box>
        )}
        {messages.map((msg, i) => {
          const mine = isMe(msg);
          return (
            <Box
              key={i}
              sx={{
                display: 'flex',
                flexDirection: mine ? 'row-reverse' : 'row',
                alignItems: 'flex-end',
                gap: 1,
              }}
            >
              {!mine && (
                <Avatar sx={{ width: 28, height: 28, bgcolor: '#52b788', fontSize: 11, flexShrink: 0 }}>
                  {msg.sender?.name?.[0]}
                </Avatar>
              )}
              <Box
                sx={{
                  maxWidth: '72%',
                  bgcolor: mine ? '#2d6a4f' : '#f3f4f6',
                  color: mine ? '#fff' : 'text.primary',
                  px: 2,
                  py: 1.2,
                  borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                }}
              >
                <Typography variant="body2" sx={{ lineHeight: 1.5, wordBreak: 'break-word' }}>
                  {msg.message}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ opacity: 0.65, display: 'block', textAlign: 'right', mt: 0.3, fontSize: 10 }}
                >
                  {format(new Date(msg.timestamp), 'HH:mm')}
                </Typography>
              </Box>
            </Box>
          );
        })}
        <div ref={bottomRef} />
      </Box>

      <Divider />

      {/* Input */}
      <Box sx={{ px: 2, py: 1.5, display: 'flex', gap: 1, alignItems: 'flex-end' }}>
        <TextField
          fullWidth
          multiline
          maxRows={3}
          size="small"
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: 3, fontSize: 14 },
          }}
        />
        <IconButton
          onClick={handleSend}
          disabled={!input.trim()}
          sx={{
            bgcolor: 'primary.main',
            color: '#fff',
            width: 40,
            height: 40,
            flexShrink: 0,
            '&:hover': { bgcolor: 'primary.dark' },
            '&:disabled': { bgcolor: 'action.disabledBackground' },
          }}
        >
          <SendIcon fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  );
}
