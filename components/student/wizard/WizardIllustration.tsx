'use client';

import type { WizardIllustrationKey } from '@/lib/models/wizard-copy';

/**
 * One picture per step, drawn inline so it is crisp at any size and needs no
 * request. Each sits on the same soft rounded backdrop, so the set reads as
 * one family however different the subjects are.
 */
export function WizardIllustration({ name }: { name: WizardIllustrationKey }) {
  return (
    <svg viewBox="0 0 320 240" className="wizard-illustration" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="wiBack" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e9f2ff" />
          <stop offset="1" stopColor="#f3ecff" />
        </linearGradient>
        <linearGradient id="wiEm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#34d399" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="wiSun" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe08a" />
          <stop offset="1" stopColor="#ffb356" />
        </linearGradient>
        <linearGradient id="wiSky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7cc4ff" />
          <stop offset="1" stopColor="#4f8cff" />
        </linearGradient>
      </defs>
      <rect width="320" height="240" rx="24" fill="url(#wiBack)" />
      <circle cx="160" cy="120" r="88" fill="#fff" opacity="0.55" />
      <circle cx="160" cy="120" r="62" fill="#fff" opacity="0.6" />
      {PICTURES[name]}
    </svg>
  );
}

const PICTURES: Record<WizardIllustrationKey, React.ReactNode> = {
  identity: (
    <g>
      <rect x="96" y="66" width="128" height="112" rx="14" fill="#fff" stroke="#d9e2f5" strokeWidth="3" />
      <circle cx="136" cy="112" r="20" fill="url(#wiEm)" />
      <path d="M110 154c4-16 15-22 26-22s22 6 26 22" fill="#a7f3d0" />
      <rect x="170" y="98" width="40" height="8" rx="4" fill="#c7d2ea" />
      <rect x="170" y="114" width="30" height="8" rx="4" fill="#dbe3f3" />
      <rect x="170" y="130" width="36" height="8" rx="4" fill="#dbe3f3" />
      <rect x="96" y="66" width="128" height="18" rx="9" fill="#4f8cff" opacity="0.9" />
      <g fill="#ffd166"><path d="M232 60l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" /><path d="M84 176l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" /></g>
    </g>
  ),
  destinations: (
    <g>
      <circle cx="160" cy="124" r="52" fill="url(#wiSky)" />
      <path d="M126 104c14-8 30-6 40 4s10 24 2 34-22 12-32 4-18-30-10-42z" fill="#6fe0b0" />
      <path d="M174 90c10 2 22 12 26 24s-2 26-12 26-14-16-16-28 0-20 2-22z" fill="#6fe0b0" />
      <ellipse cx="160" cy="124" rx="52" ry="14" fill="none" stroke="#fff" strokeWidth="2" opacity="0.6" />
      <g>
        <path d="M84 70c0-10 8-18 18-18s18 8 18 18c0 14-18 30-18 30S84 84 84 70z" fill="#f2545b" />
        <circle cx="102" cy="70" r="7" fill="#fff" />
        <path d="M212 44c0-8 6-14 14-14s14 6 14 14c0 11-14 24-14 24s-14-13-14-24z" fill="#ffb356" />
        <circle cx="226" cy="44" r="5" fill="#fff" />
        <path d="M228 168c0-8 6-14 14-14s14 6 14 14c0 11-14 24-14 24s-14-13-14-24z" fill="#4f8cff" />
        <circle cx="242" cy="168" r="5" fill="#fff" />
      </g>
      <path d="M72 200c30-20 60-12 84-30" fill="none" stroke="#c7d2ea" strokeWidth="3" strokeDasharray="6 8" />
      <path d="M0 0l22 4-22 4 4-4z" fill="#4f8cff" transform="translate(150 166)" />
    </g>
  ),
  academics: (
    <g>
      <rect x="90" y="132" width="140" height="18" rx="4" fill="#4f8cff" />
      <rect x="98" y="114" width="124" height="18" rx="4" fill="#ffb356" />
      <rect x="106" y="96" width="108" height="18" rx="4" fill="#6fe0b0" />
      <path d="M160 40l70 28-70 28-70-28z" fill="#1f2937" />
      <path d="M118 78v20c0 10 20 18 42 18s42-8 42-18V78" fill="none" stroke="#1f2937" strokeWidth="8" strokeLinecap="round" />
      <path d="M230 68v26" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" />
      <circle cx="230" cy="98" r="5" fill="#ffd166" />
      <g fill="#ffd166"><path d="M76 180l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" /><path d="M250 170l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" /></g>
    </g>
  ),
  language: (
    <g>
      <path d="M78 76h100a14 14 0 0 1 14 14v40a14 14 0 0 1-14 14h-56l-24 20v-20H78a14 14 0 0 1-14-14V90a14 14 0 0 1 14-14z" fill="#4f8cff" />
      <text x="128" y="124" textAnchor="middle" fill="#fff" fontSize="30" fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif">Aa</text>
      <path d="M156 118h84a14 14 0 0 1 14 14v34a14 14 0 0 1-14 14h-6v18l-22-18h-56a14 14 0 0 1-14-14v-34a14 14 0 0 1 14-14z" fill="#6fe0b0" />
      <text x="198" y="158" textAnchor="middle" fill="#064e3b" fontSize="24" fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif">7.5</text>
      <g fill="#ffd166"><path d="M232 56l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" /></g>
    </g>
  ),
  aptitude: (
    <g>
      <circle cx="150" cy="128" r="60" fill="#f2545b" />
      <circle cx="150" cy="128" r="42" fill="#fff" />
      <circle cx="150" cy="128" r="24" fill="#f2545b" />
      <circle cx="150" cy="128" r="8" fill="#fff" />
      <path d="M150 128l64-64" stroke="#1f2937" strokeWidth="5" strokeLinecap="round" />
      <path d="M214 64l-6 20-14-14z" fill="#1f2937" />
      <path d="M214 64l20-6-14 14z" fill="#ffb356" />
      <g fill="#ffd166"><path d="M70 70l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" /></g>
    </g>
  ),
  career: (
    <g>
      <rect x="84" y="94" width="152" height="96" rx="14" fill="#4f8cff" />
      <rect x="84" y="94" width="152" height="26" rx="12" fill="#3b6fe0" />
      <rect x="134" y="72" width="52" height="30" rx="8" fill="none" stroke="#3b6fe0" strokeWidth="8" />
      <rect x="146" y="128" width="28" height="18" rx="5" fill="#ffd166" />
      <path d="M100 150h30M190 150h30" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
      <g fill="#6fe0b0"><circle cx="236" cy="72" r="14" /><path d="M230 72l4 4 8-9" stroke="#064e3b" strokeWidth="3" fill="none" strokeLinecap="round" /></g>
    </g>
  ),
  funding: (
    <g>
      <ellipse cx="160" cy="140" rx="70" ry="50" fill="#f9a8d4" />
      <circle cx="222" cy="128" r="22" fill="#f9a8d4" />
      <circle cx="232" cy="124" r="4" fill="#1f2937" />
      <ellipse cx="240" cy="136" rx="9" ry="6" fill="#f472b6" />
      <path d="M110 100l12-16 10 16M118 84l-4-12" stroke="#f472b6" strokeWidth="6" strokeLinecap="round" fill="none" />
      <rect x="140" y="98" width="40" height="8" rx="4" fill="#1f2937" />
      <rect x="112" y="180" width="16" height="20" rx="6" fill="#f472b6" />
      <rect x="190" y="180" width="16" height="20" rx="6" fill="#f472b6" />
      <g>
        <circle cx="160" cy="60" r="18" fill="url(#wiSun)" />
        <text x="160" y="67" textAnchor="middle" fill="#7a4a00" fontSize="20" fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif">₹</text>
        <circle cx="96" cy="56" r="12" fill="url(#wiSun)" />
        <circle cx="216" cy="46" r="10" fill="url(#wiSun)" />
      </g>
    </g>
  ),
  achievements: (
    <g>
      <path d="M160 40c30 30 40 70 30 110h-60c-10-40 0-80 30-110z" fill="#fff" stroke="#c7d2ea" strokeWidth="3" />
      <circle cx="160" cy="100" r="16" fill="#4f8cff" />
      <path d="M130 130l-24 30 34-8zM190 130l24 30-34-8z" fill="#f2545b" />
      <path d="M144 150h32l-6 34h-20z" fill="#ffb356" />
      <path d="M150 184c0 12 10 24 10 24s10-12 10-24" fill="#ffd166" />
      <g fill="#ffd166"><path d="M76 84l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" /><path d="M240 70l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" /><path d="M250 160l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" /></g>
    </g>
  ),
  review: (
    <g>
      <rect x="96" y="56" width="128" height="140" rx="14" fill="#fff" stroke="#d9e2f5" strokeWidth="3" />
      <rect x="128" y="44" width="64" height="22" rx="8" fill="#4f8cff" />
      <g>
        <rect x="112" y="88" width="18" height="18" rx="5" fill="#6fe0b0" /><path d="M116 97l4 4 8-8" stroke="#064e3b" strokeWidth="3" fill="none" strokeLinecap="round" />
        <rect x="138" y="92" width="64" height="8" rx="4" fill="#dbe3f3" />
        <rect x="112" y="118" width="18" height="18" rx="5" fill="#6fe0b0" /><path d="M116 127l4 4 8-8" stroke="#064e3b" strokeWidth="3" fill="none" strokeLinecap="round" />
        <rect x="138" y="122" width="52" height="8" rx="4" fill="#dbe3f3" />
        <rect x="112" y="148" width="18" height="18" rx="5" fill="#6fe0b0" /><path d="M116 157l4 4 8-8" stroke="#064e3b" strokeWidth="3" fill="none" strokeLinecap="round" />
        <rect x="138" y="152" width="70" height="8" rx="4" fill="#dbe3f3" />
      </g>
      <circle cx="226" cy="176" r="26" fill="url(#wiEm)" />
      <path d="M214 176l8 8 16-16" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  )
};

/** The guide who asks the questions — a friendly cap-wearing spark. */
export function WizardGuide() {
  return (
    <svg viewBox="0 0 64 64" className="wizard-guide" aria-hidden="true" focusable="false">
      <circle cx="32" cy="36" r="22" fill="#4f8cff" />
      <circle cx="32" cy="36" r="22" fill="url(#wiEm)" opacity="0.15" />
      <circle cx="24" cy="36" r="5" fill="#fff" /><circle cx="40" cy="36" r="5" fill="#fff" />
      <circle cx="25" cy="37" r="2.4" fill="#1f2937" /><circle cx="41" cy="37" r="2.4" fill="#1f2937" />
      <path d="M24 46c4 4 12 4 16 0" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M32 6l24 10-24 10L8 16z" fill="#1f2937" />
      <path d="M18 20v9c0 4 6 7 14 7s14-3 14-7v-9" fill="#1f2937" />
      <path d="M54 16v10" stroke="#ffd166" strokeWidth="2" strokeLinecap="round" />
      <circle cx="54" cy="28" r="2.5" fill="#ffd166" />
    </svg>
  );
}
