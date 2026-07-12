export function TypingIndicator({ users }) {
  if (!users.length) {
    return <div className="typing-space" aria-hidden="true" />;
  }

  const label = users.length === 1
    ? `${users[0]} is typing`
    : `${users.slice(0, 2).join(', ')} are typing`;

  return (
    <div className="typing-indicator" aria-live="polite">
      <span>{label}</span>
      <span className="typing-dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    </div>
  );
}
