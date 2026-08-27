import { useEffect, useState } from 'react';
import ThemeToggle from './ThemeToggle.jsx';
import { Menu, Close } from './Icons.jsx';

const LINKS = [
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
];

export default function Navbar({ theme, toggle }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');

  // Solidify the bar once the hero scrolls past.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scrollspy — highlight the section currently in view.
  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(Boolean);
    if (!sections.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Lock scrolling while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => (document.body.style.overflow = '');
  }, [open]);

  const go = (e, id) => {
    e.preventDefault();
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''}`}>
      <nav className="container nav__inner" aria-label="Primary">
        <a className="nav__brand" href="#top" onClick={(e) => go(e, 'top')}>
          <em>Pradumn</em>&nbsp;Saindane<span>.</span>
        </a>

        <div className="nav__links">
          {LINKS.map((l, i) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className={`nav__link ${active === l.id ? 'is-active' : ''}`}
              onClick={(e) => go(e, l.id)}
            >
              <span className="idx">{String(i + 1).padStart(2, '0')}</span>
              {l.label}
            </a>
          ))}
        </div>

        <div className="nav__actions">
          <ThemeToggle theme={theme} toggle={toggle} />
          <button
            className="icon-btn nav__burger"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <Close /> : <Menu />}
          </button>
        </div>
      </nav>

      <div className={`nav__mobile ${open ? 'is-open' : ''}`}>
        {LINKS.map((l, i) => (
          <a key={l.id} href={`#${l.id}`} onClick={(e) => go(e, l.id)}>
            <span className="idx">{String(i + 1).padStart(2, '0')}</span>
            {l.label}
          </a>
        ))}
      </div>
    </header>
  );
}
