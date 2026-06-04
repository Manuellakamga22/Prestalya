export function IconMenage({ size = 32, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12l9-9 9 9" /><path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
    </svg>
  );
}

export function IconCanape({ size = 32, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 9V7a2 2 0 00-2-2H6a2 2 0 00-2 2v2" /><path d="M2 11a2 2 0 012 2v3h16v-3a2 2 0 012-2H2z" /><path d="M4 16v3m16-3v3" />
    </svg>
  );
}

export function IconDesinfection({ size = 32, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L4 6v6c0 4.4 3.4 8.5 8 9.5 4.6-1 8-5.1 8-9.5V6l-8-4z" /><path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function IconRepassage({ size = 32, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 18h16M3 14h14a4 4 0 000-8H3l-1 4 1 4z" /><circle cx="19" cy="10" r="1" fill={color} />
    </svg>
  );
}

export function IconBabysitting({ size = 32, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="3" /><path d="M5 21v-2a7 7 0 0114 0v2" />
      <path d="M9 11l-2 3 2 2" /><path d="M15 11l2 3-2 2" />
    </svg>
  );
}

export function IconInformatique({ size = 32, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
    </svg>
  );
}

export function IconCoiffure({ size = 32, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="2.5" /><circle cx="6" cy="18" r="2.5" />
      <path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12" />
    </svg>
  );
}

export function IconDepannage({ size = 32, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

export const serviceIcons = {
  "menage": IconMenage,
  "nettoyage-canape": IconCanape,
  "desinfection": IconDesinfection,
  "repassage": IconRepassage,
  "babysitting": IconBabysitting,
  "aide-informatique": IconInformatique,
  "coiffure": IconCoiffure,
  "depannage": IconDepannage,
};
