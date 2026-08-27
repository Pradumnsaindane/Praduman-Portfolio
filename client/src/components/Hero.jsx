import site from '../data/site.js';
import { ArrowRight, ArrowUpRight, Github, Linkedin, Mail } from './Icons.jsx';
// ⬇️ Replace with YOUR image file — drop it in src/assets/ and update the path
import profileImg from '../assets/Pofilepicture.jpeg';

const socialIcon = { GitHub: Github, LinkedIn: Linkedin, Email: Mail };

/**
 * Hero. The thesis of the page: a plain statement of what I do, plus a
 * "spec" panel that reads like a config/manifest file — including a live
 * project count pulled from the database. `projects`/`loading` come from Home
 * so we fetch the API only once.
 */
export default function Hero({ projects = [], loading = false }) {
  const count = projects.length;

  const go = (e, id) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="hero" id="top">
      <div className="container hero__grid">
        <div className="hero__intro">
          <p className="hero__meta">
            <span>{site.role}</span>
            <span className="dot">/</span>
            <span>{site.location}</span>
          </p>

          <h1 className="hero__title">
            {site.hero.lead} <em>{site.hero.emphasis}</em>
          </h1>

          <p className="hero__blurb">{site.hero.blurb}</p>

          <div className="hero__cta">
            <a className="btn btn--accent" href="#work" onClick={(e) => go(e, 'work')}>
              View selected work <ArrowRight size={16} className="btn__arrow" />
            </a>
            <a className="btn btn--ghost" href="#contact" onClick={(e) => go(e, 'contact')}>
              Get in touch
            </a>
          </div>

          <div className="hero__social">
            {site.socials.map((s) => {
              const I = socialIcon[s.label] || ArrowUpRight;
              return (
                <a key={s.label} href={s.url} target="_blank" rel="noreferrer">
                  <I size={15} /> {s.label}
                </a>
              );
            })}
          </div>
        </div>

        {/* Profile picture */}
        <div className="hero__right">
          <img
            className="hero__avatar"
            src={profileImg}
            alt={`${site.name} — profile photo`}
            width={280}
            height={280}
            loading="eager"
          />

          {/* Signature element: a manifest-style spec card */}
          <aside className="spec" aria-label="Profile summary">
            <div className="spec__bar">
              <span className="dots"><i /><i /><i /></span>
              profile.json
            </div>
          <div className="spec__body">
            <div className="spec__row">
              <span className="spec__k">role</span>
              <span className="spec__v"><strong>{site.role}</strong></span>
            </div>
            <div className="spec__row">
              <span className="spec__k">stack</span>
              <span className="spec__v">MongoDB · Express · React · Node</span>
            </div>
            <div className="spec__row">
              <span className="spec__k">based</span>
              <span className="spec__v">{site.location}</span>
            </div>
            <div className="spec__row">
              <span className="spec__k">shipped</span>
              <span className="spec__v live">
                {loading ? (
                  <span style={{ color: 'var(--faint)' }}>reading…</span>
                ) : (
                  <><b>{count}</b> {count === 1 ? 'project' : 'projects'} in the database</>
                )}
              </span>
            </div>
            <div className="spec__row">
              <span className="spec__k">status</span>
              <span className="spec__v">
                <span className="status-dot" />{site.availability}
              </span>
            </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
