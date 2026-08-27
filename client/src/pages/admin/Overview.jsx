import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';

export default function Overview() {
  const [stats, setStats] = useState({ projects: 0, featured: 0, messages: 0, unread: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    Promise.all([api.get('/projects'), api.get('/messages')])
      .then(([pRes, mRes]) => {
        if (!alive) return;
        const projects = Array.isArray(pRes.data) ? pRes.data : [];
        const messages = mRes.data?.messages || [];
        setStats({
          projects: projects.length,
          featured: projects.filter((p) => p.featured).length,
          messages: mRes.data?.count ?? messages.length,
          unread: mRes.data?.unread ?? messages.filter((m) => !m.read).length,
        });
        setRecent(messages.slice(0, 4));
      })
      .catch(() => alive && setError('Could not load dashboard data.'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const cards = [
    { k: 'Projects', v: stats.projects, to: '/admin/projects', hint: 'in the database' },
    { k: 'Featured', v: stats.featured, to: '/admin/projects', hint: 'shown with a flag' },
    { k: 'Messages', v: stats.messages, to: '/admin/messages', hint: 'total received' },
    { k: 'Unread', v: stats.unread, to: '/admin/messages', hint: 'awaiting reply' },
  ];

  return (
    <div className="panel">
      <div className="panel__head">
        <div>
          <span className="eyebrow">Overview</span>
          <h1 className="panel__title">Dashboard</h1>
        </div>
      </div>

      {error && <p className="panel__error">{error}</p>}

      <div className="stat-grid">
        {cards.map((c) => (
          <Link className="stat" to={c.to} key={c.k}>
            <span className="stat__k">{c.k}</span>
            <span className="stat__v">{loading ? '—' : c.v}</span>
            <span className="stat__hint">{c.hint}</span>
          </Link>
        ))}
      </div>

      <div className="panel__block">
        <div className="panel__block-head">
          <h2>Recent messages</h2>
          <Link className="tlink" to="/admin/messages">View all</Link>
        </div>

        {loading ? (
          <p className="muted">Loading…</p>
        ) : recent.length === 0 ? (
          <p className="muted">No messages yet.</p>
        ) : (
          <ul className="mini-list">
            {recent.map((m) => (
              <li key={m._id} className={`mini-list__item ${m.read ? '' : 'is-unread'}`}>
                <div className="mini-list__top">
                  <strong>{m.name}</strong>
                  <span className="muted">{new Date(m.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="mini-list__excerpt">{m.message}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
