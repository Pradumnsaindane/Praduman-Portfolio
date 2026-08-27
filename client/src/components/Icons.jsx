// A small, hand-picked SVG icon set. Stroke-based, 1.6px, currentColor —
// so every icon inherits text color and theme automatically.
const S = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

// Forwards size + className (and any extra props) onto the <svg>.
const wrap = (children, { size = 18, className, ...rest } = {}) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
    {...S}
    {...rest}
  >
    {children}
  </svg>
);

export const Sun = (p) => wrap(<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>, p);
export const Moon = (p) => wrap(<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />, p);
export const Menu = (p) => wrap(<path d="M3 6h18M3 12h18M3 18h18" />, p);
export const Close = (p) => wrap(<path d="M6 6l12 12M18 6L6 18" />, p);
export const ArrowRight = (p) => wrap(<path d="M5 12h14M13 6l6 6-6 6" />, p);
export const ArrowUpRight = (p) => wrap(<path d="M7 17L17 7M8 7h9v9" />, p);
export const ArrowUp = (p) => wrap(<path d="M12 19V5M6 11l6-6 6 6" />, p);
export const Github = (p) =>
  wrap(
    <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />,
    p
  );
export const Linkedin = (p) =>
  wrap(<><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 11v5M8 8v.01M12 16v-3a2 2 0 0 1 4 0v3M12 16v-5" /></>, p);
export const Mail = (p) => wrap(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>, p);
export const Link = (p) => wrap(<path d="M9 15l6-6M10 6l1-1a4 4 0 0 1 6 6l-1 1M14 18l-1 1a4 4 0 0 1-6-6l1-1" />, p);

const Icons = { Sun, Moon, Menu, Close, ArrowRight, ArrowUpRight, ArrowUp, Github, Linkedin, Mail, Link };
export default Icons;
