import { Check, CheckCheck, Clock3 } from 'lucide-react';
import { formatMessageTime } from '../utils/time.js';

const StatusIcon = ({ status }) => {
  if (status === 'sending') {
    return <Clock3 size={13} aria-label="Sending" />;
  }

  if (status === 'read') {
    return <CheckCheck size={14} aria-label="Read" />;
  }

  return <Check size={14} aria-label="Delivered" />;
};

export function MessageBubble({ message, isOwn }) {
  return (
    <article className={`message-row ${isOwn ? 'own' : ''}`}>
      <div className="message-bubble">
        {!isOwn ? <p className="message-author">{message.username}</p> : null}
        <p className="message-text">{message.text}</p>
        <div className="message-meta">
          <time dateTime={message.createdAt}>{formatMessageTime(message.createdAt)}</time>
          {isOwn ? <StatusIcon status={message.status} /> : null}
        </div>
      </div>
    </article>
  );
}
