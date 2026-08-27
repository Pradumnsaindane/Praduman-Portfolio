import site from '../data/site.js';
import SectionHeader from './SectionHeader.jsx';
import useReveal from '../hooks/useReveal.js';

/**
 * Experience as a typed timeline. The leading index is genuinely sequential
 * (most-recent first), so a number here encodes real order — not decoration.
 */
export default function Experience() {
  const [ref, shown] = useReveal();
  return (
    <section className="section" id="experience">
      <div className="container">
        <SectionHeader eyebrow="Track record" title="Where I've been.">
          A short history of the work and study that got me here.
        </SectionHeader>

        <div className={`timeline reveal ${shown ? 'is-in' : ''}`} ref={ref}>
          {site.experience.map((item, i) => (
            <div className="tl-item" key={`${item.role}-${i}`}>
              <span className="tl-item__idx">{String(i + 1).padStart(2, '0')}</span>
              <span className="tl-item__period">{item.period}</span>
              <div className="tl-item__body">
                <h3 className="tl-item__role">{item.role}</h3>
                <div className="tl-item__org">{item.org}</div>
                <p className="tl-item__note">{item.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
