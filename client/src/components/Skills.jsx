import site from '../data/site.js';
import SectionHeader from './SectionHeader.jsx';
import useReveal from '../hooks/useReveal.js';

export default function Skills() {
  const [ref, shown] = useReveal();
  return (
    <section className="section section--alt" id="skills">
      <div className="container">
        <SectionHeader eyebrow="Toolkit" title="What I reach for.">
          The tools I use most. I try to stay deep in a focused set rather than shallow across everything.
        </SectionHeader>

        <div className={`skills__grid reveal ${shown ? 'is-in' : ''}`} ref={ref}>
          {site.skills.map((col) => (
            <div className="skillcol" key={col.group}>
              <h3 className="skillcol__h">{col.group}</h3>
              <ul className="skillcol__list">
                {col.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
