import { useState } from 'react';
import site from '../data/site.js';
import api from '../api/client.js';
import SectionHeader from './SectionHeader.jsx';
import { ArrowRight, Github, Linkedin, Mail } from './Icons.jsx';

const socialIcon = { GitHub: Github, LinkedIn: Linkedin, Email: Mail };
const EMPTY = { name: '', email: '', message: '' };

export default function Contact() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState({ state: 'idle', msg: '' });

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus({ state: 'err', msg: 'Please fill in every field.' });
      return;
    }
    setStatus({ state: 'sending', msg: 'Sending…' });
    try {
      const res = await api.post('/messages', form);
      setStatus({ state: 'ok', msg: res.data?.message || 'Thanks — I’ll be in touch soon.' });
      setForm(EMPTY);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Something went wrong sending that. Email me directly and I’ll reply.';
      setStatus({ state: 'err', msg });
    }
  };

  const sending = status.state === 'sending';

  return (
    <section className="section contact" id="contact">
      <div className="container">
        <SectionHeader eyebrow="Contact" title="Let’s build something.">
          Have a project, a role, or a rough idea? Tell me a little about it.
        </SectionHeader>

        <div className="contact__grid">
          <div>
            <p className="contact__lead">
              I’m {site.availability.toLowerCase()}. The form goes straight to my inbox or reach me directly:
            </p>
            <div className="contact__detail">
              {site.socials.map((s) => {
                const I = socialIcon[s.label] || Mail;
                return (
                  <a key={s.label} href={s.url} target={s.label === 'Email' ? undefined : '_blank'} rel="noreferrer">
                    <I size={15} /> &nbsp;{s.handle}
                  </a>
                );
              })}
            </div>
          </div>

          <form className="form" onSubmit={onSubmit} noValidate>
            <div className="form__field">
              <label htmlFor="name">Name</label>
              <input id="name" name="name" value={form.name} onChange={onChange} placeholder="Your name" autoComplete="name" />
            </div>
            <div className="form__field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={onChange} placeholder="you@example.com" autoComplete="email" />
            </div>
            <div className="form__field">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" value={form.message} onChange={onChange} placeholder="What are you working on?" />
            </div>

            <button className="btn btn--accent btn--block" type="submit" disabled={sending}>
              {sending ? 'Sending…' : <>Send message <ArrowRight size={16} className="btn__arrow" /></>}
            </button>

            <p className={`form__status ${status.state === 'ok' ? 'ok' : status.state === 'err' ? 'err' : ''}`} role="status" aria-live="polite">
              {status.msg}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
