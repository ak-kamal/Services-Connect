import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { X, Send } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * ChatWindow
 *
 * Props:
 *  - offerId        {string}  MongoDB _id of the offer (used as socket room)
 *  - offerDate      {string}  ISO date string of the offer
 *  - offerTimeSlot  {string}  e.g. "8:00 AM - 12:00 PM"
 *  - otherPartyName {string}  Display name of the person on the other side
 *  - currentUserId  {string}  The logged-in user's MongoDB _id
 *  - token          {string}  JWT from localStorage
 *  - onClose        {fn}      Called when the user closes the chat
 */
function ChatWindow({ offerId, offerDate, offerTimeSlot, otherPartyName, currentUserId, token, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  // Load history + connect socket when chat opens
  useEffect(() => {
  let socket;
  let isMounted = true;

  const init = async () => {
    // 1. Fetch persisted message history
    try {
      const res = await fetch(`${API_BASE_URL}/api/messages/${offerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && isMounted) setMessages(data.messages);
    } catch (err) {
      console.error('Failed to load message history:', err);
    } finally {
      if (isMounted) setLoading(false);
    }

    // 2. Connect to socket and join the offer room
    socket = io(API_BASE_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.emit('join_room', offerId);

    //  FIX: Remove any existing listener before adding new one
    socket.off('receive_message');
    
    socket.on('receive_message', (msg) => {
      if (!isMounted) return;
      setMessages((prev) => {
        // Prevent duplicates by checking _id
        const exists = prev.some(m => m._id === msg._id);
        if (exists) return prev;
        return [...prev, msg];
      });
    });
  };

  init();

  return () => {
    isMounted = false;
    if (socket) {
      socket.off('receive_message'); // Clean up listener
      socket.emit('leave_room', offerId);
      socket.disconnect();
    }
  };
}, [offerId, token]);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed || !socketRef.current?.connected) return;
    socketRef.current.emit('send_message', { offerId, content: trimmed });
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 sm:w-96 h-[480px] bg-base-100 rounded-2xl shadow-2xl flex flex-col border border-base-300">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-content rounded-t-2xl shrink-0">
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">{otherPartyName}</p>
          {offerDate && (
            <p className="text-xs opacity-70 truncate">
              {new Date(offerDate).toLocaleDateString()} &middot; {offerTimeSlot}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="btn btn-circle btn-ghost btn-xs ml-2 shrink-0"
          aria-label="Close chat"
        >
          <X size={14} />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <span className="loading loading-spinner text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-base-content/40 mt-10">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId?.toString() === currentUserId?.toString();
            return (
              <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm break-words ${
                    isMe
                      ? 'bg-primary text-primary-content rounded-br-none'
                      : 'bg-base-200 text-base-content rounded-bl-none'
                  }`}
                >
                  {!isMe && (
                    <p className="text-xs font-semibold mb-0.5 opacity-60">{msg.senderName}</p>
                  )}
                  <p className="leading-snug whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? 'opacity-60 text-right' : 'opacity-40'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="px-3 pb-3 pt-2 border-t border-base-300 flex gap-2 shrink-0">
        <input
          type="text"
          className="input input-bordered input-sm flex-1 text-sm"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={500}
          autoFocus
        />
        <button
          className="btn btn-primary btn-sm btn-circle"
          onClick={sendMessage}
          disabled={!input.trim()}
          aria-label="Send message"
        >
          <Send size={13} />
        </button>
      </div>

    </div>
  );
}

export default ChatWindow;
