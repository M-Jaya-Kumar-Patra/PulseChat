import { SendHorizontal } from 'lucide-react';
import { useRef, useState } from 'react';

export function MessageComposer({
  disabled,
  onSend,
  onTypingStart,
  onTypingStop
}) {
  const [text, setText] = useState('');
  const typingTimer = useRef(null);

  const clearTypingTimer = () => {
    if (typingTimer.current) {
      window.clearTimeout(typingTimer.current);
      typingTimer.current = null;
    }
  };

  const handleChange = (event) => {
    setText(event.target.value);
    onTypingStart();
    clearTypingTimer();
    typingTimer.current = window.setTimeout(onTypingStop, 1200);
  };

  const submit = (event) => {
    event.preventDefault();
    const cleanText = text.trim();

    if (!cleanText) {
      return;
    }

    onSend(cleanText);
    setText('');
    clearTypingTimer();
    onTypingStop();
  };

  return (
    <form className="composer" onSubmit={submit}>
      <textarea
        value={text}
        rows={1}
        maxLength={1000}
        disabled={disabled}
        placeholder="Write a message"
        onChange={handleChange}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            submit(event);
          }
        }}
      />
      <button
        className="send-button"
        type="submit"
        aria-label="Send message"
        title="Send message"
        disabled={!text.trim() || disabled}
      >
        <SendHorizontal size={20} aria-hidden="true" />
      </button>
    </form>
  );
}
