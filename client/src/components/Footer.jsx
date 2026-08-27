import site from '../data/site.js';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div>
          <div className="footer__brand">
            Pradumn Saindane<span>.</span>
          </div>
          <p className="footer__colophon">
            Built with the MERN stack, deployed on AWS, managed with docker. Set in Fraunces, Hanken Grotesk, and JetBrains Mono.
            © {year} — all rights reserved.
          </p>
        </div>
        <nav className="footer__links" aria-label="Footer">
          {site.socials.map((s) => (
            <a key={s.label} href={s.url} target={s.label === 'Email' ? undefined : '_blank'} rel="noreferrer">
              {s.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
