import { useEffect, useMemo, useRef, useState } from 'react';
import site from '../data/site.js';
import profileImg from '../assets/Pofilepicture.jpeg';

const SCENES = {
  introOut: [0.03, 0.18],
  reveal: [0.15, 0.35],
  storyA: [0.25, 0.44],
  storyB: [0.48, 0.69],
  catalog: [0.74, 1],
};

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (value) => value * value * (3 - 2 * value);
const rangeProgress = (value, [start, end]) => clamp((value - start) / (end - start));
const segmentInOut = (value, [start, end], fade = 0.18) => {
  const progress = rangeProgress(value, [start, end]);
  const enter = smoothstep(clamp(progress / fade));
  const exit = smoothstep(clamp((1 - progress) / fade));
  return enter * exit;
};

function useTimeline(sectionRef) {
  const [progress, setProgress] = useState(0);
  const target = useRef(0);
  const frame = useRef(0);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const request = () => {
      if (!frame.current) frame.current = requestAnimationFrame(render);
    };
    const render = () => {
      frame.current = 0;
      const section = sectionRef.current;
      if (!section) return;
      const max = Math.max(1, section.offsetHeight - window.innerHeight);
      target.current = clamp((window.scrollY - section.offsetTop) / max);
      setProgress((current) => {
        const next = reduced.current ? target.current : lerp(current, target.current, 0.12);
        if (Math.abs(next - target.current) > 0.001) request();
        return next;
      });
    };
    const onScroll = () => request();
    const onResize = () => request();
    request();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [sectionRef]);

  return progress;
}

function Narrative({ className, eyebrow, title, body, visible }) {
  return (
    <article className={`cinematic-copy ${className} ${visible > 0.02 ? 'is-visible' : ''}`} style={{ '--copy-progress': visible }}>
      <span className="cinematic-copy__eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{body}</p>
    </article>
  );
}

export default function CinematicPortfolio({ projects = [] }) {
  const sectionRef = useRef(null);
  const progress = useTimeline(sectionRef);
  const [activeCard, setActiveCard] = useState(0);
  const cards = useMemo(() => projects.length ? projects : site.fallbackProjects, [projects]);
  const intro = 1 - smoothstep(rangeProgress(progress, SCENES.introOut));
  const reveal = smoothstep(rangeProgress(progress, SCENES.reveal));
  const storyA = segmentInOut(progress, SCENES.storyA);
  const storyB = segmentInOut(progress, SCENES.storyB);
  const catalog = smoothstep(rangeProgress(progress, SCENES.catalog));

  const jump = (target) => {
    const section = sectionRef.current;
    if (!section) return;
    const max = section.offsetHeight - window.innerHeight;
    const positions = { work: 0.85, about: 0.58, contact: 1 };
    window.scrollTo({ top: section.offsetTop + max * (positions[target] ?? 0), behavior: 'smooth' });
  };

  return (
    <main className="cinematic-site">
      <a className="skip-link" href="#cinematic-work">Skip to selected work</a>
      <section className="cinematic-scroll" ref={sectionRef} id="top" aria-label="Pradumn Saindane portfolio">
        <div className="cinematic-stage">
          <div className="cinematic-world" aria-hidden="true">
            <div className="world-sky" style={{ transform: `scale(${1 + reveal * 0.06}) translate3d(0, ${reveal * -1.5}%, 0)` }} />
            <div className="world-horizon" style={{ transform: `translate3d(${reveal * -2}%, ${reveal * 1.5}%, 0) scale(${1 + reveal * 0.08})` }} />
            <div className="world-grid" style={{ opacity: 0.22 + reveal * 0.2 }} />
            <div className="world-window world-window--left" style={{ transform: `translate3d(${-reveal * 30}%, ${reveal * 2}%, 0)` }} />
            <div className="world-window world-window--right" style={{ transform: `translate3d(${reveal * 30}%, ${reveal * 2}%, 0)` }} />
            <div className="world-subject" style={{ transform: `translate3d(0, ${reveal * -3}%, 0) scale(${1 + reveal * 0.2})`, opacity: 0.38 + reveal * 0.62 }}>
              <img src={profileImg} alt="" width="900" height="900" />
            </div>
            <div className="world-shade" style={{ opacity: intro * 0.3 + storyB * 0.22 }} />
          </div>

          <header className="cinematic-nav">
            <a className="cinematic-brand" href="#top">PS<span>.</span></a>
            <nav aria-label="Primary navigation">
              <button type="button" onClick={() => jump('about')}>About</button>
              <button type="button" onClick={() => jump('work')}>Work</button>
              <button type="button" onClick={() => jump('contact')}>Contact</button>
            </nav>
            <span className="cinematic-progress">{String(Math.round(progress * 100)).padStart(2, '0')} / 100</span>
          </header>

          <div className="cinematic-intro" style={{ opacity: intro, transform: `translate3d(0, ${intro * 0}px, 0)` }}>
            <p className="cinematic-kicker">Software engineer / Pune, India</p>
            <h1>Building digital products with <em>clarity.</em></h1>
            <p className="cinematic-intro__body">{site.hero.blurb}</p>
            <button className="cinematic-cta" type="button" onClick={() => jump('work')}>Explore the work <span>↘</span></button>
          </div>

          <Narrative className="cinematic-copy--a" eyebrow="01 — The approach" title="Make the complex feel obvious." body="From data models to the final interaction, I care about the whole path a feature takes. Good software should feel calm on the surface." visible={storyA} />
          <Narrative className="cinematic-copy--b" eyebrow="02 — The practice" title="Small, considered systems." body="I work across the stack to ship useful things: readable code, tight feedback loops, and interfaces that respect the person using them." visible={storyB} />

          <section className="cinematic-catalog" id="cinematic-work" style={{ opacity: catalog, transform: `translate3d(${(1 - catalog) * 8}%, 0, 0)` }} aria-label="Selected work">
            <div className="catalog-heading">
              <div><span className="cinematic-kicker">Selected work</span><h2>Things I&apos;ve built.</h2></div>
              <div className="catalog-controls"><button type="button" aria-label="Previous project" onClick={() => setActiveCard((activeCard - 1 + cards.length) % cards.length)}>←</button><span>{String(activeCard + 1).padStart(2, '0')} / {String(cards.length).padStart(2, '0')}</span><button type="button" aria-label="Next project" onClick={() => setActiveCard((activeCard + 1) % cards.length)}>→</button></div>
            </div>
            <div className="catalog-rail" role="list">
              {cards.map((project, index) => <article className={`catalog-card ${index === activeCard ? 'is-active' : ''}`} key={project._id || project.title} role="listitem"><span className="catalog-card__index">{String(index + 1).padStart(2, '0')}</span><h3>{project.title}</h3><p>{project.summary}</p><div className="catalog-card__meta">{project.tech?.slice(0, 3).join(' · ')}</div></article>)}
            </div>
            <p className="catalog-footer"><span>Available for thoughtful collaborations</span><a href={`mailto:${site.email}`}>Start a conversation ↗</a></p>
          </section>
        </div>
      </section>
      <section className="cinematic-after" id="about"><span className="cinematic-kicker">A little more</span><h2>Useful things, made with intention.</h2><p>{site.about[0]}</p><a href={`mailto:${site.email}`} id="contact">{site.email} ↗</a></section>
    </main>
  );
}
