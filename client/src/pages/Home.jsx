import { useEffect, useState } from 'react';
import api from '../api/client.js';
import site from '../data/site.js';
import CinematicPortfolio from '../components/CinematicPortfolio.jsx';

export default function Home() {
  const [projects, setProjects] = useState(site.fallbackProjects);

  useEffect(() => {
    let alive = true;
    api.get('/projects').then(({ data }) => {
      if (alive && Array.isArray(data) && data.length) setProjects(data);
    }).catch(() => {}).finally(() => { alive = false; });
    return () => { alive = false; };
  }, []);

  return <CinematicPortfolio projects={projects} />;
}
