import React, { useState } from "react";
import ReactMarkdown from 'react-markdown';
import styles from './ChatUI.module.css';


export default function ChatUI({ user }: { user: any }) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const MarkdownRenderer = ({ content }: { content: string }) => (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        lineHeight: 1.6,
        padding: '1rem',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        color: '#333',
        whiteSpace: 'pre-wrap',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}
    >
      <ReactMarkdown components={{
        h1: ({ node, ...props }) => <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '1rem 0' }} {...props} />,
        h2: ({ node, ...props }) => <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', margin: '1rem 0' }} {...props} />,
        h3: ({ node, ...props }) => <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0.8rem 0' }} {...props} />,
        p: ({ node, ...props }) => <p style={{ margin: '0.75rem 0' }} {...props} />,
        ul: ({ node, ...props }) => <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }} {...props} />,
        li: ({ node, ...props }) => <li style={{ marginBottom: '0.5rem' }} {...props} />,
        code: ({ node, ...props }) => <code style={{ background: '#eee', padding: '2px 4px', borderRadius: '4px', fontSize: '0.9rem' }} {...props} />,
        pre: ({ node, ...props }) => <pre style={{ background: '#eee', padding: '12px', borderRadius: '6px', overflowX: 'auto' }} {...props} />,
      }}>{content}</ReactMarkdown>
    </div>
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);

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
      setQuery("");
      setLoading(false);
    }
  }

return (
  <div className={styles.chatContainer}>
    <div className={styles.chatBox}>
      {messages.map((msg, i) => (
        <div key={i} className={styles.message}>
          <div className={msg.role === 'user' ? styles.user : styles.assistant}>
            {msg.role === 'user' ? 'You' : 'Assistant'}:
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            {msg.role === 'assistant'
              ? <MarkdownRenderer content={msg.content} />
              : <p>{msg.content}</p>}
          </div>
        </div>
      ))}
    </div>

    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask a DevOps question..."
        className={styles.input}
        disabled={loading}
      />
      <button type="submit" className={styles.button} disabled={loading}>
        {loading ? "..." : "Ask"}
      </button>
    </form>
  </div>
);

}
