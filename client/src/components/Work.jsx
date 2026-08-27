import SectionHeader from './SectionHeader.jsx';
import useReveal from '../hooks/useReveal.js';
import { ArrowUpRight, Github, Link } from './Icons.jsx';

function WorkItem({ project, index }) {
  const [ref, shown] = useReveal();
  return (
    <article className={`work-item reveal ${shown ? 'is-in' : ''}`} ref={ref}>
      <span className="work-item__idx">{String(index + 1).padStart(2, '0')}</span>

      <div className="work-item__main">
        <h3 className="work-item__title">
          {project.title}
          {project.featured && <span className="flag">Featured</span>}
        </h3>
        <p className="work-item__summary">{project.summary}</p>
        {Array.isArray(project.tech) && project.tech.length > 0 && (
          <ul className="work-item__tech">
            {project.tech.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="work-item__aside">
        <span className="work-item__meta">
          {[project.role, project.year].filter(Boolean).join(' · ')}
        </span>
        <div className="work-item__links">
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noreferrer">
              <Link size={15} /> Live
            </a>
          )}
          {project.repoUrl && (
            <a href={project.repoUrl} target="_blank" rel="noreferrer">
              <Github size={15} /> Code
            </a>
          )}
          {!project.liveUrl && !project.repoUrl && (
            <span className="work-item__meta">Case study on request</span>
          )}
        </div>
      </div>
    </article>
  );
}

/**
 * Selected work, pulled from the API/database (with a graceful note if the
 * API is unreachable — the fallback list is handled one level up in Home).
 */
export default function Work({ projects = [], loading = false, error = false, usingFallback = false }) {
  return (
    <section className="section section--alt" id="work">
      <div className="container">
        <SectionHeader eyebrow="Selected work" title="Things I've built.">
          A few projects worth showing. Each one taught me something I still use.
        </SectionHeader>

        {loading ? (
          <p className="work__empty">Loading projects…</p>
        ) : projects.length === 0 ? (
          <p className="work__empty">No projects published yet — check back soon.</p>
        ) : (
          <div className="work__list">
            {projects.map((p, i) => (
              <WorkItem key={p._id || p.slug || i} project={p} index={i} />
            ))}
          </div>
        )}

        {(error || usingFallback) && !loading && (
          <p className="work__note">
            ↳ Showing a cached selection — the live project feed is warming up.
          </p>
        )}
      </div>
    </section>
  );
}
