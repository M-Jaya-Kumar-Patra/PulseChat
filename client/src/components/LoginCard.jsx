import { MessageCircle, UserRound } from 'lucide-react';
import { useState } from 'react';

export function LoginCard({ onLogin }) {
  const [name, setName] = useState('');
  const [touched, setTouched] = useState(false);
  const cleanName = name.trim();
  const isInvalid = touched && cleanName.length < 2;

  const handleSubmit = (event) => {
    event.preventDefault();
    setTouched(true);

    if (cleanName.length < 2) {
      return;
    }

    onLogin(cleanName.slice(0, 24));
  };

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <div className="brand-block compact">
          <div className="brand-mark">
            <MessageCircle size={24} aria-hidden="true" />
          </div>
          <div>
            <p className="eyebrow">Pulse Chat</p>
            <h1 id="login-title">Join the room</h1>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <div className={`input-shell ${isInvalid ? 'input-error' : ''}`}>
            <UserRound size={18} aria-hidden="true" />
            <input
              id="username"
              value={name}
              maxLength={24}
              autoComplete="name"
              placeholder="e.g. Aisha"
              onBlur={() => setTouched(true)}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          {isInvalid ? (
            <p className="field-error">Use at least 2 characters.</p>
          ) : null}
          <button className="primary-button" type="submit">
            Enter chat
          </button>
        </form>
      </section>
    </main>
  );
}
