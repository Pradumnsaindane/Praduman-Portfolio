import { useEffect, useState, useCallback } from 'react';
import api from '../../api/client.js';

const EMPTY = {
  title: '',
  summary: '',
  description: '',
  tech: '',
  role: '',
  year: '',
  liveUrl: '',
  repoUrl: '',
  image: '',
  featured: false,
  order: 0,
};

// The DB stores tech as an array; the form edits it as a comma string.
const toForm = (p) => ({ ...EMPTY, ...p, tech: Array.isArray(p.tech) ? p.tech.join(', ') : p.tech || '' });
const toPayload = (f) => ({
  ...f,
  tech: f.tech.split(',').map((t) => t.trim()).filter(Boolean),
  order: Number(f.order) || 0,
});

export default function ProjectsPanel() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // 'new' | project object | null
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api
      .get('/projects')
      .then((res) => setProjects(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Could not load projects.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setForm(EMPTY);
    setEditing('new');
    setError('');
  };
  const openEdit = (p) => {
    setForm(toForm(p));
    setEditing(p);
    setError('');
  };
  const close = () => {
    setEditing(null);
    setForm(EMPTY);
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const flash = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3000);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.summary.trim()) {
      setError('Title and summary are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = toPayload(form);
      if (editing === 'new') {
        await api.post('/projects', payload);
        flash('Project created.');
      } else {
        await api.put(`/projects/${editing._id}`, payload);
        flash('Project updated.');
      }
      close();
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the project.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete “${p.title}”? This can’t be undone.`)) return;
    try {
      await api.delete(`/projects/${p._id}`);
      flash('Project deleted.');
      setProjects((list) => list.filter((x) => x._id !== p._id));
    } catch {
      setError('Could not delete that project.');
    }
  };

  return (
    <div className="panel">
      <div className="panel__head">
        <div>
          <span className="eyebrow">Projects</span>
          <h1 className="panel__title">Manage work</h1>
        </div>
        <button className="btn btn--accent" onClick={openNew}>+ New project</button>
      </div>

      {notice && <p className="panel__notice">{notice}</p>}
      {error && !editing && <p className="panel__error">{error}</p>}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : projects.length === 0 ? (
        <p className="muted">No projects yet. Create your first one.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Tech</th>
              <th>Year</th>
              <th className="table__c">Featured</th>
              <th className="table__r">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p._id}>
                <td>
                  <strong>{p.title}</strong>
                  <span className="table__sub">{p.summary}</span>
                </td>
                <td className="table__tech">{Array.isArray(p.tech) ? p.tech.join(', ') : ''}</td>
                <td>{p.year || '—'}</td>
                <td className="table__c">{p.featured ? <span className="pill">Featured</span> : '—'}</td>
                <td className="table__r">
                  <button className="link-btn" onClick={() => openEdit(p)}>Edit</button>
                  <button className="link-btn link-btn--danger" onClick={() => remove(p)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editing && (
        <div className="drawer" role="dialog" aria-modal="true" aria-label={editing === 'new' ? 'New project' : 'Edit project'}>
          <div className="drawer__scrim" onClick={close} />
          <form className="drawer__panel" onSubmit={save}>
            <div className="drawer__head">
              <h2>{editing === 'new' ? 'New project' : 'Edit project'}</h2>
              <button type="button" className="icon-btn" onClick={close} aria-label="Close">✕</button>
            </div>

            <div className="drawer__body">
              <div className="field">
                <label htmlFor="title">Title *</label>
                <input id="title" name="title" value={form.title} onChange={onChange} placeholder="Project name" />
              </div>
              <div className="field">
                <label htmlFor="summary">Summary * <span className="field__hint">shown in the list (max ~280 chars)</span></label>
                <textarea id="summary" name="summary" value={form.summary} onChange={onChange} rows={2} maxLength={280} placeholder="One or two sentences." />
              </div>
              <div className="field">
                <label htmlFor="description">Description <span className="field__hint">optional, longer detail</span></label>
                <textarea id="description" name="description" value={form.description} onChange={onChange} rows={3} placeholder="The fuller story." />
              </div>
              <div className="field">
                <label htmlFor="tech">Tech <span className="field__hint">comma-separated</span></label>
                <input id="tech" name="tech" value={form.tech} onChange={onChange} placeholder="React, Node.js, MongoDB" />
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="role">Role</label>
                  <input id="role" name="role" value={form.role} onChange={onChange} placeholder="Full-stack build" />
                </div>
                <div className="field">
                  <label htmlFor="year">Year</label>
                  <input id="year" name="year" value={form.year} onChange={onChange} placeholder="2025" />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="liveUrl">Live URL</label>
                  <input id="liveUrl" name="liveUrl" value={form.liveUrl} onChange={onChange} placeholder="https://…" />
                </div>
                <div className="field">
                  <label htmlFor="repoUrl">Repo URL</label>
                  <input id="repoUrl" name="repoUrl" value={form.repoUrl} onChange={onChange} placeholder="https://github.com/…" />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="order">Sort order <span className="field__hint">lower = first</span></label>
                  <input id="order" name="order" type="number" value={form.order} onChange={onChange} />
                </div>
                <label className="check">
                  <input type="checkbox" name="featured" checked={form.featured} onChange={onChange} />
                  <span>Featured</span>
                </label>
              </div>

              {error && <p className="panel__error">{error}</p>}
            </div>

            <div className="drawer__foot">
              <button type="button" className="btn btn--ghost" onClick={close}>Cancel</button>
              <button type="submit" className="btn btn--accent" disabled={saving}>
                {saving ? 'Saving…' : editing === 'new' ? 'Create project' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
