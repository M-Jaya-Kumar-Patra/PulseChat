import {
  LogOut,
  MessageCircle,
  RefreshCw,
  UsersRound,
  Wifi,
  WifiOff
} from 'lucide-react';
import { MessageBubble } from './MessageBubble.jsx';
import { MessageComposer } from './MessageComposer.jsx';
import { PresenceBar } from './PresenceBar.jsx';
import { TypingIndicator } from './TypingIndicator.jsx';

export function ChatShell({
  username,
  onLogout,
  messages,
  onlineUsers,
  typingUsers,
  connectionState,
  error,
  isLoading,
  sendMessage,
  startTyping,
  stopTyping,
  refreshMessages
}) {
  const visibleTypingUsers = typingUsers.filter((name) => name !== username);

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Chat details">
        <div className="brand-block">
          <div className="brand-mark">
            <MessageCircle size={24} aria-hidden="true" />
          </div>
          <div>
            <p className="eyebrow">Pulse Chat</p>
            <h1>Study Room</h1>
          </div>
        </div>

        <div className="profile-panel">
          <div className="avatar">{username.slice(0, 1).toUpperCase()}</div>
          <div>
            <p className="profile-name">{username}</p>
            <span className="status-line">
              {connectionState === 'connected' ? (
                <Wifi size={14} aria-hidden="true" />
              ) : (
                <WifiOff size={14} aria-hidden="true" />
              )}
              {connectionState}
            </span>
          </div>
        </div>

        <section className="online-panel" aria-label="Online users">
          <div className="section-title">
            <UsersRound size={16} aria-hidden="true" />
            <span>Online</span>
          </div>
          <PresenceBar users={onlineUsers} currentUsername={username} />
        </section>

        <button className="ghost-button" type="button" onClick={onLogout}>
          <LogOut size={17} aria-hidden="true" />
          Change username
        </button>
      </aside>

      <section className="chat-panel" aria-label="Messages">
        <header className="chat-header">
          <div>
            <p className="eyebrow">Live room</p>
            <h2>General chat</h2>
          </div>
          <button
            className="icon-button"
            type="button"
            aria-label="Refresh history"
            title="Refresh history"
            onClick={refreshMessages}
          >
            <RefreshCw size={18} aria-hidden="true" />
          </button>
        </header>

        {error ? <div className="error-banner">{error}</div> : null}

        <div className="messages-wrap">
          {isLoading ? (
            <div className="empty-state">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="empty-state">No messages yet.</div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.username === username}
              />
            ))
          )}
        </div>

        <TypingIndicator users={visibleTypingUsers} />

        <MessageComposer
          disabled={connectionState === 'connecting'}
          onSend={sendMessage}
          onTypingStart={startTyping}
          onTypingStop={stopTyping}
        />
      </section>
    </main>
  );
}
