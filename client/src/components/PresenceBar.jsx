export function PresenceBar({ users, currentUsername }) {
  if (!users.length) {
    return <p className="muted-text">No one online.</p>;
  }

  return (
    <ul className="presence-list">
      {users.map((user) => (
        <li key={user.username} className="presence-item">
          <span className="presence-dot" aria-hidden="true" />
          <span>
            {user.username}
            {user.username === currentUsername ? ' (you)' : ''}
          </span>
          {user.connections > 1 ? (
            <span className="connection-count">{user.connections}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
