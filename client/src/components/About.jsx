import site from '../data/site.js';
import SectionHeader from './SectionHeader.jsx';
import useReveal from '../hooks/useReveal.js';

export default function About() {
  const [ref, shown] = useReveal();
  return (
    <section className="section" id="about">
      <div className="container">
        <SectionHeader eyebrow="About" title="A developer who sweats the whole stack.">
          How I think about building software, and what I care about while doing it.
        </SectionHeader>

        <div className={`about__grid reveal ${shown ? 'is-in' : ''}`} ref={ref}>
          <div className="about__body">
            {site.about.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          <div className="glance" aria-label="At a glance">
            {site.glance.map((row) => (
              <div className="glance__row" key={row.k}>
                <span className="glance__k">{row.k}</span>
                <span className="glance__v">{row.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
