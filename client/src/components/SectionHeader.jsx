import useReveal from '../hooks/useReveal.js';

/**
 * Section heading with a mono "eyebrow" label. The eyebrow is a real
 * wayfinding device (it names the section), not decoration.
 */
export default function SectionHeader({ eyebrow, title, children }) {
  const [ref, shown] = useReveal();
  return (
    <div className={`section-head reveal ${shown ? 'is-in' : ''}`} ref={ref}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  );
}
