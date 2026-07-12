import { useEffect, useState } from 'react';
import { ChatShell } from './components/ChatShell.jsx';
import { LoginCard } from './components/LoginCard.jsx';
import { useChat } from './hooks/useChat.js';

const STORAGE_KEY = 'pulse-chat-username';

export default function App() {
  const [username, setUsername] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || '';
  });

  const chat = useChat(username);

  useEffect(() => {
    if (username) {
      localStorage.setItem(STORAGE_KEY, username);
    }
  }, [username]);

  const handleLogin = (nextUsername) => {
    setUsername(nextUsername);
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUsername('');
  };

  if (!username) {
    return <LoginCard onLogin={handleLogin} />;
  }

  return (
    <ChatShell
      username={username}
      onLogout={handleLogout}
      {...chat}
    />
  );
}
