import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Download } from './Icons.jsx';

const CHARSET = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.:/+!?-&';
const scenes = [
  { label: 'PORTFOLIO', text: <>Hi, I&apos;m Debbie, a <em>UX designer</em>.</> },
  { label: 'TODAY', text: <>Today is a good day to <em>build</em> something.</> },
  { label: 'UX + UI', text: <>I shape how products <em>feel</em>, not just how they look.</> },
  { label: 'RESEARCH', text: <>I start with <em>people</em>, not pixels.</> },
  { label: 'FLOWS', text: <>Untangling the messy <em>middle</em> of every journey.</> },
  { label: 'SYSTEMS', text: <>Design systems that <em>scale</em> with your team.</> },
  { label: 'SHIP IT!', text: <>Then I make sure it <em>ships</em>.</> },
  { label: 'HIRE ME?', text: <>Open to new projects, <em>let&apos;s talk</em>.</> },
];

function today() {
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(new Date());
}

function Drum({ value, index, onHover }) {
  const target = value || ' ';
  const charIndex = CHARSET.indexOf(target);
  const faces = [-2, -1, 0, 1, 2, 3];
  return <div className="odometer__drum" onMouseEnter={() => onHover(index)} aria-hidden="true">
    <div className="odometer__faces">
      {faces.map((offset) => <span key={offset} className={`odometer__face ${offset === 0 ? 'is-current' : ''}`} style={{ '--offset': offset, '--index': charIndex }}>{CHARSET[(charIndex + offset + CHARSET.length) % CHARSET.length]}</span>)}
    </div>
    <i className="odometer__shade" />
  </div>;
}

export default function CinematicPortfolio() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [sound, setSound] = useState(false);
  const [clock, setClock] = useState('00:00:00');
  const [cardEjected, setCardEjected] = useState(false);
  const [cursor, setCursor] = useState({ x: -100, y: -100, label: '' });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const lastWheel = useRef(0);
  const scene = scenes[sceneIndex];
  const word = useMemo(() => scene.label.padEnd(9, ' ').slice(0, 9), [scene.label]);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date().toLocaleTimeString('en-GB', { hour12: false })), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setSceneIndex((current) => (current + 1) % scenes.length), 3800);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const move = (event) => {
      setCursor((current) => ({ ...current, x: event.clientX, y: event.clientY }));
      const x = (event.clientX / window.innerWidth - 0.5) * 8;
      const y = (event.clientY / window.innerHeight - 0.5) * -8;
      setTilt({ x: y, y: x });
    };
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, []);

  const next = (direction = 1) => setSceneIndex((current) => (current + direction + scenes.length) % scenes.length);
  const handleWheel = (event) => {
    if (Date.now() - lastWheel.current < 650) return;
    lastWheel.current = Date.now();
    next(event.deltaY > 0 ? 1 : -1);
  };

  return <main className="debbie-site" style={{ '--tilt-x': `${tilt.x}deg`, '--tilt-y': `${tilt.y}deg` }}>
    <div className="grain" aria-hidden="true" />
    <header className="debbie-nav">
      <a className="debbie-logo" href="#top">debbie<sup>®</sup></a>
      <nav className="debbie-links" aria-label="Primary navigation">
        {['Work', 'About', 'Process', 'Playground'].map((link, index) => <a key={link} href={`#${link.toLowerCase()}`}><span>{link}</span>{index === 0 && <sup>06</sup>}</a>)}
      </nav>
      <div className="debbie-actions">
        <time className="live-clock" aria-label="Current time">{clock}</time>
        <button className={`sound-toggle ${sound ? 'is-on' : ''}`} onClick={() => setSound(!sound)} aria-label="Toggle sound">Sound <i /><i /><i /></button>
        <a href="#contact" className="talk-button"><b />Let&apos;s talk</a>
      </div>
    </header>

    <section className="odometer-hero" id="top">
      <h1 className="sr-only">Debbie, UX Designer</h1>
      <div className="machine" onWheel={handleWheel} style={{ transform: `rotateX(var(--tilt-x)) rotateY(var(--tilt-y))` }}>
        <div className="scene-plate"><span>NO. {String(sceneIndex + 1).padStart(3, '0')} / 008</span><strong>{scene.label}</strong></div>
        <button className="odometer" onClick={() => next()} aria-label="Spin to next scene" aria-live="polite">
          <div className="odometer__window">{word.split('').map((char, index) => <Drum key={`${sceneIndex}-${index}`} value={char} index={index} onHover={() => {}} />)}<div className="card-slot" onClick={(event) => { event.stopPropagation(); setCardEjected(!cardEjected); }}><div className={`debbie-card ${cardEjected ? 'is-ejected' : ''}`}><b>UX</b><span>DEBBIE / DESIGN DEPT.</span><i /></div></div></div>
        </button>
        <button className="pull-knob" onClick={() => { setSceneIndex(Math.floor(Math.random() * scenes.length)); setCardEjected(false); }} aria-label="Pull to choose a random scene"><span>PULL</span></button>
        <p className="machine-caption">{scene.text}</p>
      </div>
      <div className="hero-hint">CLICK / SCROLL TO EXPLORE</div>
    </section>

    <footer className="bottom-rail">
      <p>UX / PRODUCT DESIGNER · RESEARCH · INTERACTION · SYSTEMS</p>
      <div className="progress-segments" aria-label="Scene progress">{scenes.map((item, index) => <i key={item.label} className={index <= sceneIndex ? 'is-filled' : ''} />)}</div>
      <a href="#work">SCROLL TO EXPLORE <span>↓</span></a>
    </footer>

    <section className="portfolio-strip" id="work">
      <div><span>SELECTED WORK</span><h2>Useful things, <em>made human.</em></h2></div>
      <a href="#contact" className="strip-link">View case studies <ArrowUpRight size={16} /></a>
    </section>
    <section className="portfolio-strip portfolio-strip--cream" id="about"><div><span>ABOUT DEBBIE</span><h2>Good design starts by <em>listening.</em></h2></div><a className="strip-link" href="#contact">More about me <ArrowUpRight size={16} /></a></section>
    <section className="portfolio-strip" id="contact"><div><span>HAVE A PROJECT?</span><h2>Let&apos;s make something <em>clear.</em></h2></div><div className="contact-actions"><a className="talk-button talk-button--light" href="mailto:hello@debbie.design">Say hello <ArrowUpRight size={16} /></a><a className="strip-link" href="#top"><Download size={15} /> CV / Resume</a></div></section>
    <div className={`custom-cursor ${cursor.label ? 'is-active' : ''}`} style={{ transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)` }}>{cursor.label || 'SPIN'}</div>
  </main>;
}
