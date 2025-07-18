import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import styles from './ChatUI.module.css';


export default function ChatUI({ user }: { user: any }) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  const TextRenderer = ({ content }: { content: string }) => {
    // Split by double newlines for paragraphs
    const paragraphs = content.split(/\n{2,}/);
    // Accept headings with or without colon and extra whitespace
    const headingRegex = /^(Problem Analysis|Root Cause|Solution Steps|Verification|Prevention)\s*:? 0*$/i;

    return (
      <div
        style={{
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          color: '#1f2937', // darker gray for better readability
          fontSize: '1rem',
          lineHeight: 1.65,
        }}
      >
          {paragraphs.map((para, idx) => {
    const trimmed = para.trim();
    if (headingRegex.test(trimmed)) {
      return (
        <div
          key={idx}
          style={{
            fontWeight: 700,
            fontSize: '1.2rem',
            color: '#4f46e5', // deep indigo
            margin: '2rem 0 1rem',
            letterSpacing: '0.01em',
          }}
        >
          {trimmed.replace(/:$/, '')}
        </div>
      );
    }
          // For normal paragraphs, split by single newlines for line breaks
          const lines = para.split(/\n/);
          return (
            <p
              key={idx}
              style={{
                margin: '0 0 1.25rem',
                fontWeight: 400,
                color: '#374151',
              }}
            >
              {lines.map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < lines.length - 1 && <br />}
                </React.Fragment>
              ))}
            </p>
          );
        })}
      </div>
    );
  };

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setQuery("");

    const newMessages = [...messages, { role: 'user', content: query }];
    setMessages(newMessages);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, user_id: user.id }),
      });
      const data = await res.json();
      const formatted = data.formattedAnswer || "No answer found.";
      setMessages(prev => [...prev, { role: 'assistant', content: formatted }]);
    } catch (err) {
      console.error("Error:", err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Something went wrong." }]);
    } finally {
      
      setLoading(false);
    }
  }

return (
  <div className={styles.chatContainer}>
    <div className={styles.chatBox} ref={chatBoxRef}>
      {messages.map((msg, i) => (
        <div
          key={i}
          className={
            msg.role === 'assistant'
              ? `${styles.message} ${styles.assistantMsg}`
              : styles.message
          }
        >
          <div className={msg.role === 'user' ? styles.user : styles.assistant}>
            {msg.role === 'user' ? 'You' : 'Assistant'}:
          </div>
          <div
            className={
              msg.role === 'user' ? `${styles.bubble} ${styles.userBubble}` : `${styles.bubble} ${styles.assistantBubble}`
            }
          >
            {msg.role === 'assistant' ? (
              <TextRenderer content={msg.content} />
            ) : (
              <div style={{ color: '#374151' }}>{msg.content}</div>
            )}
          </div>
        </div>
      ))}
    </div>

    <form onSubmit={handleSubmit} className={styles.form}>
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask a DevOps question..."
        className={styles.input}
        disabled={loading}
        rows={1}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as any);
          }
        }}
      />
      <button type="submit" className={styles.button} disabled={loading}>
        {loading ? (
          <span className={styles.loading}>
            Thinking
          </span>
        ) : (
          "Ask Question"
        )}
      </button>
    </form>
  </div>
);

}
