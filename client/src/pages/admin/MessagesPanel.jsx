import { useEffect, useState, useCallback } from 'react';
import api from '../../api/client.js';

export default function MessagesPanel() {
  const [messages, setMessages] = useState([]);
  const [meta, setMeta] = useState({ count: 0, unread: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all | unread

  const load = useCallback(() => {
    setLoading(true);
    api
      .get('/messages')
      .then((res) => {
        setMessages(res.data?.messages || []);
        setMeta({ count: res.data?.count ?? 0, unread: res.data?.unread ?? 0 });
      })
      .catch(() => setError('Could not load messages.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleRead = async (m) => {
    try {
      const res = await api.patch(`/messages/${m._id}/read`);
      const updated = res.data?.message || { ...m, read: !m.read };
      setMessages((list) => list.map((x) => (x._id === m._id ? { ...x, read: updated.read } : x)));
      setMeta((mt) => ({ ...mt, unread: mt.unread + (updated.read ? -1 : 1) }));
    } catch {
      setError('Could not update that message.');
    }
  };

  const remove = async (m) => {
    if (!window.confirm(`Delete the message from ${m.name}?`)) return;
    try {
      await api.delete(`/messages/${m._id}`);
      setMessages((list) => list.filter((x) => x._id !== m._id));
      setMeta((mt) => ({ count: mt.count - 1, unread: mt.unread - (m.read ? 0 : 1) }));
    } catch {
      setError('Could not delete that message.');
    }
  };

  const shown = filter === 'unread' ? messages.filter((m) => !m.read) : messages;

  return (
    <div className="panel">
      <div className="panel__head">
        <div>
          <span className="eyebrow">Messages</span>
          <h1 className="panel__title">Inbox</h1>
        </div>
        <div className="seg">
          <button className={`seg__btn ${filter === 'all' ? 'is-on' : ''}`} onClick={() => setFilter('all')}>
            All <span>{meta.count}</span>
          </button>
          <button className={`seg__btn ${filter === 'unread' ? 'is-on' : ''}`} onClick={() => setFilter('unread')}>
            Unread <span>{meta.unread}</span>
          </button>
        </div>
      </div>

      {error && <p className="panel__error">{error}</p>}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : shown.length === 0 ? (
        <p className="muted">{filter === 'unread' ? 'No unread messages.' : 'No messages yet.'}</p>
      ) : (
        <ul className="msg-list">
          {shown.map((m) => (
            <li key={m._id} className={`msg ${m.read ? '' : 'is-unread'}`}>
              <div className="msg__head">
                <div className="msg__from">
                  {!m.read && <span className="msg__dot" aria-label="Unread" />}
                  <strong>{m.name}</strong>
                  <a className="msg__email" href={`mailto:${m.email}`}>{m.email}</a>
                </div>
                <time className="msg__date">{new Date(m.createdAt).toLocaleString()}</time>
              </div>
              <p className="msg__body">{m.message}</p>
              <div className="msg__actions">
                <a className="link-btn" href={`mailto:${m.email}?subject=Re: your message`}>Reply</a>
                <button className="link-btn" onClick={() => toggleRead(m)}>
                  Mark {m.read ? 'unread' : 'read'}
                </button>
                <button className="link-btn link-btn--danger" onClick={() => remove(m)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
