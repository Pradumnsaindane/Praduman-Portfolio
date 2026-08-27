// ─────────────────────────────────────────────────────────────
//  EDIT ME — this is the single place for your personal content.
//  (Projects are managed from the /admin dashboard + database;
//   the list below is only a fallback shown if the API is offline.)
// ─────────────────────────────────────────────────────────────

const site = {
  name: 'Pradumn Saindane',
  initials: 'PS',
  role: ' Software Engineer',
  location: 'Pune,India',
  email: 'psaindane09@gmail.com',
  availability: 'Open to work',

  // The hero statement. Keep it specific and in your own voice.
  hero: {
    lead: 'I Build Something that is product centric',
    emphasis: 'It Works For me.',
    blurb:
      'I\'m a software engineer with an experience of 1 year. I love building products that are user-friendly and efficient. I am passionate about learning new technologies and implementing them in my work. ',
  },

  socials: [
    { label: 'GitHub', handle: 'Pradumnsaindane', url: 'https://github.com/Pradumnsaindane' },
    { label: 'LinkedIn', handle: 'Pradumn Saindane', url: 'https://www.linkedin.com/in/pradumn-saindane-20893539a/' },
    { label: 'Email', handle: 'psaindane09@gmail.com', url: 'mailto:psaindane09@gmail.com' }, 
  ],

  about: [
    'I care about the whole path a feature takes — from the shape of the data, through the API, to the moment it feels obvious on screen. Most of my work lives in the MERN stack: MongoDB and Express on the back, React on the front, Node holding it together.',
    'Before writing much code I try to get the model right, because a clean schema tends to make everything downstream simpler. I like readable code, tight feedback loops, and shipping something small that works over something large that might.',
    'Outside of client work I build small tools to scratch my own itches — a few are below.',
  ],

  glance: [
    { k: 'Focus', v: 'Full-Stack Development, Cloud & DevOps, APIs & Microservices, IoT, System Design, Generative AI, Open Source.' },
    { k: 'Stack', v: 'Java, JavaScript, TypeScript, SQL, HTML, CSS, Spring, Spring Boot, React, Node.js, Express.js, Next.js, REST APIs, Microservices, API Integration, MongoDB, Git, GitHub, Docker, CI/CD, Kubernetes (Basics), AWS, Microsoft Azure, Google Cloud Platform, ESP32, Sensors.' },
    { k: 'Based in', v: 'India' },
    { k: 'Experience', v: '1+ years' },
  ],

  skills: [
    { group: 'Languages', items: ['JavaScript', 'TypeScript', 'HTML', 'CSS', 'Python'] },
    { group: 'Frontend', items: ['React', 'React Router', 'Vite', 'Redux Toolkit', 'Tailwind'] },
    { group: 'Backend', items: ['Node.js', 'Express', 'REST APIs', 'JWT auth', 'Socket.IO'] },
    { group: 'Data', items: ['MongoDB', 'Mongoose', 'PostgreSQL'] },
    { group: 'Tooling', items: ['Git', 'GitHub', 'Docker', 'Vercel', 'Render'] },
  ],

  // Ordered most-recent first; the leading index is rendered as 01, 02, 03…
  experience: [
    {
      period: '2025',
      role: 'Design Coordinator',
      org: 'ITESA',
      note: 'Contributed to IT and design initiatives through technical problem-solving, system support, and coordination of digital projects.',
    },
    {
      period: '2026',
      role: 'Contributor/Mentee',
      org: 'GirlScript Summer of Code',
      note: 'Collaborating on open-source projects, contributing meaningful features, and strengthening development, problem-solving, code quality, and teamwork skills.',
    },
    {
      period: '2024 — 2028 (Ongoing)',
      role: 'Bachelor of Technology(Information and Technology)',
      org: 'Dr D.Y. Patil College Of Engineering , Akurdi , Pune',
      note: 'Studied algorithms, databases, and distributed systems; led several team projects and hackathon builds.',
    },
  ],

  // Fallback only — the live site pulls projects from the API/database.
  fallbackProjects: [
    {
      _id: 'f1',
      title: 'Commun.dev',
      summary:
        'Commun.dev is a platform for creators and developers to share their work and connect with others. ',
      tech: ['Next.js', 'Node.js', 'Express', 'MongoDB'],
      role: 'Project Owner',
      year: '2026',
      liveUrl: 'Ongoing',
      repoUrl: 'https://github.com/Pradumnsaindane/Commun.dev',
      featured: true,
    },
    {
      _id: 'f2',
      title: 'College Dhekho',
      summary:
        'Realtime team chat with threads, presence, and message search — built to stay fast in busy channels.',
      tech: ['React', 'Socket.IO', 'Express', 'MongoDB'],
      role: 'Project Owner',
      year: '2025',
      liveUrl: 'Ongoing',
      repoUrl: 'https://github.com/Pradumnsaindane/College-Dhekho',
      featured: true,
    },
    {
      _id: 'f3',
      title: 'Short-step',
      summary:
        'Short-steps is a productivity tool that helps you stay focused and achieve your goals. It uses a simple and intuitive interface to help you stay organized and on track.',
      tech: ['React', 'Node.js', 'Express', 'MongoDB'],
      role: 'Project Owner',
      year: '2026',
      liveUrl: 'Ongoing',
      repoUrl: 'https://github.com/Pradumnsaindane/Short-Step',
      featured: false,
    },
  ],
};

export default site;
