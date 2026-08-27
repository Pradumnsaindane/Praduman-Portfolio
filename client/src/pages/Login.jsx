import { useState } from 'react';
import { useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ArrowRight } from '../components/Icons.jsx';
import '../styles/admin.css';

export default function Login() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Already signed in? Skip the form.
  if (!loading && user) return <Navigate to={from} replace />;

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not sign in. Check your details and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__card">
        <div className="auth__head">
          <span className="eyebrow">Admin</span>
          <h1>Sign in</h1>
          <p>Manage projects and read messages. This area is private.</p>
        </div>

        <form className="auth__form" onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={onChange} placeholder="you@example.com" autoComplete="email" autoFocus />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" value={form.password} onChange={onChange} placeholder="••••••••" autoComplete="current-password" />
          </div>

          {error && <p className="auth__error" role="alert">{error}</p>}

          <button className="btn btn--accent btn--block" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : <>Sign in <ArrowRight size={16} className="btn__arrow" /></>}
          </button>
        </form>

        <Link className="auth__back" to="/">← Back to site</Link>
      </div>
    </div>
  );
}
