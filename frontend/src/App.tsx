import { lazy, Suspense, useEffect, useState, type FormEvent } from 'react'
import useSWR from 'swr'
import { ArrowDownRight, ArrowUpRight, Github, Linkedin, Mail } from 'lucide-react'
import type { BrandLogo } from './components/ui/shadcn-studio-hero-section-44'
import { RadialScrollGallery } from './components/ui/portfolio-and-image-gallery'
import { Badge } from './components/ui/badge'

const HeroSection44 = lazy(() => import('./components/ui/shadcn-studio-hero-section-44'))

type Profile = {
  name: string
  title: string
  location: string
  email: string
  about: string
  resumeUrl: string
  linkedinUrl: string
  links: [string, string][]
}
type Content = {
  profile: Profile
  projects: [string, string, string][]
  stack: [string, string][]
  experience: { role: string; org: string; period: string; note: string }[]
}

const fetcher = async (url: string): Promise<Content> => {
  const response = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error('Portfolio details are temporarily unavailable.')
  return response.json()
}

const brandLogos: BrandLogo[] = [
  ['react', 'React'], ['nextdotjs', 'Next.js'], ['typescript', 'TypeScript'], ['nodedotjs', 'Node.js'],
  ['python', 'Python'], ['postgresql', 'PostgreSQL'], ['tailwindcss', 'Tailwind CSS'], ['vercel', 'Vercel'],
].map(([slug, name]) => ({ image: `https://cdn.simpleicons.org/${slug}`, name }))

const PROJECT_IMAGES = [
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80',
]

function ContactForm() {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    setError('')
    setMessage('')
    setSending(true)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          message: formData.get('message'),
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.errors?.join(' ') || data.error || 'Message could not be sent.')
      form.reset()
      setMessage('Thanks for reaching out. Your message has been received.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Message could not be sent.')
    } finally {
      setSending(false)
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <label>Name<input name="name" autoComplete="name" minLength={2} maxLength={120} required /></label>
      <label>Email<input name="email" type="email" autoComplete="email" required /></label>
      <label>Message<textarea name="message" minLength={10} maxLength={4000} rows={4} required /></label>
      {error && <p className="form-status error" role="alert">{error}</p>}
      {message && <p className="form-status" role="status">{message}</p>}
      <button className="button button-dark" type="submit" disabled={sending}>
        {sending ? 'Sending…' : 'Send a message'} <ArrowUpRight aria-hidden="true" />
      </button>
    </form>
  )
}

function useAmbientProjectGlow(projectCount: number, paused: boolean) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  useEffect(() => {
    if (projectCount === 0 || paused) {
      setActiveIndex(null)
      return
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let startTimer = 0
    let fadeTimer = 0
    let lastIndex = -1

    const clearTimers = () => {
      window.clearTimeout(startTimer)
      window.clearTimeout(fadeTimer)
    }

    const scheduleNext = () => {
      if (document.visibilityState !== 'visible' || reducedMotion.matches) return

      startTimer = window.setTimeout(() => {
        let nextIndex = Math.floor(Math.random() * projectCount)
        if (projectCount > 1 && nextIndex === lastIndex) nextIndex = (nextIndex + 1) % projectCount
        lastIndex = nextIndex
        setActiveIndex(nextIndex)
        fadeTimer = window.setTimeout(() => {
          setActiveIndex(null)
          scheduleNext()
        }, 900)
      }, 3000 + Math.random() * 4000)
    }

    const syncMotionAndVisibility = () => {
      clearTimers()
      setActiveIndex(null)
      scheduleNext()
    }

    scheduleNext()
    document.addEventListener('visibilitychange', syncMotionAndVisibility)
    reducedMotion.addEventListener('change', syncMotionAndVisibility)

    return () => {
      clearTimers()
      document.removeEventListener('visibilitychange', syncMotionAndVisibility)
      reducedMotion.removeEventListener('change', syncMotionAndVisibility)
    }
  }, [projectCount, paused])

  return activeIndex
}

function RadialProjectGallery({ projects }: { projects: Content['projects'] }) {
  if (!projects.length) return null

  return (
    <div className="w-full my-8 overflow-hidden">
      <div className="text-center mb-4 space-y-2">
        <Badge variant="secondary" className="px-3 py-1 text-xs tracking-wider uppercase bg-white/10 text-white border-white/20">
          Scroll-Driven Showcase
        </Badge>
        <p className="text-xs text-neutral-400">Scroll to rotate through selected projects</p>
      </div>

      <RadialScrollGallery
        className="!min-h-[560px]"
        baseRadius={420}
        mobileRadius={240}
        scrollDuration={2000}
        visiblePercentage={45}
      >
        {(hoveredIndex) =>
          projects.map(([name, summary, details], index) => {
            const isActive = hoveredIndex === index
            const image = PROJECT_IMAGES[index % PROJECT_IMAGES.length]

            return (
              <div
                key={name}
                className={`
                  w-[220px] h-[310px] sm:w-[260px] sm:h-[350px] 
                  rounded-2xl border overflow-hidden flex flex-col justify-between 
                  transition-all duration-500 shadow-2xl backdrop-blur-md
                  ${
                    isActive
                      ? 'bg-neutral-900/95 border-orange-500/80 text-white scale-100 shadow-orange-500/20'
                      : 'bg-neutral-950/85 border-white/10 text-neutral-300 scale-95 opacity-80'
                  }
                `}
              >
                <div className="relative h-32 sm:h-36 w-full overflow-hidden bg-neutral-900">
                  <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-black/30" />
                  <span className="absolute top-3 left-3 font-mono text-xs px-2 py-0.5 rounded-full bg-black/60 text-white/90 border border-white/10 backdrop-blur-sm">
                    0{index + 1}
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold tracking-tight text-white line-clamp-1 mb-1">
                      {name}
                    </h3>
                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {summary}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-neutral-400 truncate max-w-[170px]">
                      {details.split(',')[0]}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400" />
                  </div>
                </div>
              </div>
            )
          })
        }
      </RadialScrollGallery>
    </div>
  )
}

function ProjectList({ projects }: { projects: Content['projects'] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const ambientGlowIndex = useAmbientProjectGlow(projects.length, hoveredIndex !== null)
  const activeGlowIndex = hoveredIndex === null ? ambientGlowIndex : null

  return (
    <div className="project-list">
      {projects.map(([name, summary, details], index) => (
        <article className="project-row" key={`${name}-${index}`}>
          <span className="project-index">0{index + 1}</span>
          <div>
            <h3>
              <span
                className={activeGlowIndex === index ? 'project-name project-name--ambient' : 'project-name'}
                onPointerEnter={() => setHoveredIndex(index)}
                onPointerLeave={() => setHoveredIndex(null)}
              >
                {name}
              </span>
            </h3>
            <p>{summary}</p>
          </div>
          <span className="project-stack">{details}</span>
        </article>
      ))}
    </div>
  )
}

export default function App() {
  const { data, error, isLoading, mutate } = useSWR<Content>('/api/content', fetcher)

  if (isLoading) return <main className="loading-screen" role="status">Loading portfolio…</main>
  if (error || !data) return (
    <main className="loading-screen error-screen" role="alert">
      <p>{error?.message ?? 'Portfolio details are unavailable.'}</p>
      <button className="button button-dark" onClick={() => void mutate()}>Try again</button>
    </main>
  )

  const { profile, projects, stack, experience } = data
  const displayName = profile.name

  return (
    <>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Pradumn, back to top">pradumn<sup>®</sup></a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#work">Work</a><a href="#about">About</a><a href="#stack">Stack</a><a href="#experience">Experience</a>
        </nav>
        <a className="header-contact" href={`mailto:${profile.email}`}><span className="availability-dot" />Let&apos;s connect</a>
      </header>

      <main id="top">
        <Suspense fallback={<section className="hero-fallback" aria-busy="true"><p className="eyebrow">Interactive portfolio</p><h1>{displayName}<br /><em>Software engineer.</em></h1><p>Loading the interactive introduction…</p></section>}>
          <HeroSection44
            greetings={['Hello', 'Ciao', 'Hola', 'Bonjour']}
            name={displayName}
            role={profile.title.split('|').map((part) => part.trim()).join(' · ')}
            description={profile.about}
            availabilityLabel="Open to opportunities"
            profileImage="/Pofilepicture.jpeg"
            downloadAction={{ label: profile.resumeUrl ? 'Download résumé' : 'Explore my work', href: profile.resumeUrl || '#work' }}
            connectAction={{ label: 'Get in touch', href: `mailto:${profile.email}` }}
            brandLogos={brandLogos}
            className="portfolio-hero"
          />
        </Suspense>

        <section className="content-section theme-dark-section" id="work" aria-labelledby="work-heading">
          <div className="section-heading">
            <p className="eyebrow">Selected projects</p>
            <h2 id="work-heading">Work that moves<br /><em>ideas forward.</em></h2>
            <ArrowDownRight aria-hidden="true" />
          </div>

          <RadialProjectGallery projects={projects} />

          <ProjectList projects={projects} />
        </section>

        <section className="content-section about-section" id="about" aria-labelledby="about-heading">
          <p className="eyebrow">A little about me</p><h2 id="about-heading">Building useful things,<br /><em>with care and curiosity.</em></h2>
          <p className="about-copy">{profile.about}</p>
          <p className="location-label">Based in {profile.location}</p>
        </section>

        <section className="content-section stack-section theme-dark-section" id="stack" aria-labelledby="stack-heading">
          <p className="eyebrow">Tools I work with</p><h2 id="stack-heading">My stack</h2>
          <div className="stack-list">{stack.map(([category, tools]) => <div className="stack-row" key={category}><h3>{category}</h3><p>{tools}</p></div>)}</div>
        </section>

        <section className="content-section experience-section theme-dark-section" id="experience" aria-labelledby="experience-heading">
          <p className="eyebrow">The path so far</p><h2 id="experience-heading">Experience</h2>
          {experience.length ? <div className="project-list">{experience.map((item, index) => <article className="project-row" key={`${item.org}-${index}`}><span className="project-index">0{index + 1}</span><div><h3>{item.role}, {item.org}</h3><p>{item.note}</p></div><span className="project-stack">{item.period}</span></article>)}</div> : <p className="experience-note">I&apos;m focused on building thoughtful software and growing through hands-on projects.</p>}
        </section>

        <section className="contact-section" id="contact" aria-labelledby="contact-heading">
          <div className="contact-copy"><p className="eyebrow">Have something in mind?</p><h2 id="contact-heading">Let&apos;s make<br /><em>it happen.</em></h2><a className="contact-email" href={`mailto:${profile.email}`}><Mail aria-hidden="true" />{profile.email}</a>
            <div className="social-links">{profile.links.map(([label, href]) => <a href={href} key={label} target="_blank" rel="noreferrer">{label}<ArrowUpRight aria-hidden="true" /></a>)}{profile.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noreferrer"><Linkedin aria-hidden="true" />LinkedIn<ArrowUpRight aria-hidden="true" /></a>}</div>
          </div>
          <ContactForm />
        </section>
      </main>
      <footer className="site-footer"><a className="wordmark" href="#top">pradumn<sup>®</sup></a><span>Software, thoughtfully made.</span><a href="https://github.com/Pradumnsaindane" target="_blank" rel="noreferrer"><Github aria-hidden="true" /> GitHub</a></footer>
    </>
  )
}
