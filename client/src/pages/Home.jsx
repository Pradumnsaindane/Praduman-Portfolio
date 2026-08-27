import { useEffect, useState } from 'react';
import api from '../api/client.js';
import site from '../data/site.js';
import useTheme from '../hooks/useTheme.js';

import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import About from '../components/About.jsx';
import Work from '../components/Work.jsx';
import Skills from '../components/Skills.jsx';
import Experience from '../components/Experience.jsx';
import Contact from '../components/Contact.jsx';
import Footer from '../components/Footer.jsx';
import BackToTop from '../components/BackToTop.jsx';

/**
 * The public landing page. Projects are fetched once here and shared with the
 * Hero (live count) and Work (list). If the API is unreachable we fall back to
 * a curated list from site.js so the page never looks broken.
 */
export default function Home() {
  const { theme, toggle } = useTheme();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let alive = true;
    api
      .get('/projects')
      .then((res) => {
        if (!alive) return;
        const list = Array.isArray(res.data) ? res.data : [];
        if (list.length) {
          setProjects(list);
        } else {
          setProjects(site.fallbackProjects);
          setUsingFallback(true);
        }
      })
      .catch(() => {
        if (!alive) return;
        setProjects(site.fallbackProjects);
        setError(true);
        setUsingFallback(true);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <a className="skip-link" href="#work">Skip to work</a>
      <Navbar theme={theme} toggle={toggle} />
      <main id="main">
        <Hero projects={projects} loading={loading} />
        <About />
        <Work projects={projects} loading={loading} error={error} usingFallback={usingFallback} />
        <Skills />
        <Experience />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
