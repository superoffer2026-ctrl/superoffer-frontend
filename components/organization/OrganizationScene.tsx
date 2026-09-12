'use client';

/**
 * The world behind the organization workspace.
 *
 * The student portal sits in the profile wizard's sky — clouds, a plane, green
 * hills — because a student is being walked somewhere. An admissions officer or
 * a loan manager is at their desk all day, so the same scenery would read as a
 * toy. This is its institutional counterpart: a faint drawing grid, a low
 * skyline of the buildings these organisations actually are — a columned hall,
 * a dome, a clock tower, a bank front — and the beacon arcs from the SuperOffer
 * mark opening over them.
 *
 * Everything is low-contrast and bottom-weighted: the content column covers the
 * middle of the viewport, so only silhouettes and the horizon are ever visible.
 * Pure inline SVG, decorative, hidden from assistive tech.
 */
export function OrganizationScene() {
  return (
    <svg
      className="org-scene-svg"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* One drawing grid, the scale an architect would use. */}
        <pattern id="orgGrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0v40" fill="none" stroke="#0f2f28" strokeWidth="1" opacity="0.055" />
        </pattern>
        <linearGradient id="orgFar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a7bfc6" stopOpacity="0.30" />
          <stop offset="1" stopColor="#a7bfc6" stopOpacity="0.10" />
        </linearGradient>
        <linearGradient id="orgNear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#56807a" stopOpacity="0.34" />
          <stop offset="1" stopColor="#56807a" stopOpacity="0.13" />
        </linearGradient>
        <linearGradient id="orgGround" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.55" stopColor="#ffffff" stopOpacity="0.62" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.92" />
        </linearGradient>
        <linearGradient id="orgHaze" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="1600" height="900" fill="url(#orgGrid)" />

      {/* The beacon from the brand mark, opened out over the skyline: a
          signal reaching further with each arc. */}
      <g fill="none" stroke="#047857" strokeLinecap="round" opacity="0.16">
        <circle cx="1268" cy="392" r="9" fill="#047857" stroke="none" />
        <path d="M1232 368a62 62 0 0 1 72 0" strokeWidth="5" />
        <path d="M1196 338a120 120 0 0 1 144 0" strokeWidth="5" opacity="0.62" />
        <path d="M1160 308a178 178 0 0 1 216 0" strokeWidth="5" opacity="0.34" />
      </g>

      {/* Far bank: the city these organisations sit in, barely there. */}
      <g fill="url(#orgFar)">
        <rect x="60" y="560" width="88" height="340" />
        <rect x="168" y="612" width="64" height="288" />
        <rect x="250" y="588" width="104" height="312" />
        <rect x="430" y="624" width="72" height="276" />
        <rect x="1040" y="600" width="96" height="300" />
        <rect x="1152" y="642" width="60" height="258" />
        <rect x="1400" y="574" width="92" height="326" />
        <rect x="1508" y="628" width="76" height="272" />
      </g>

      {/* A dome — the older institution on the left. */}
      <g fill="url(#orgNear)">
        <path d="M286 706a74 74 0 0 1 148 0z" />
        <rect x="354" y="654" width="12" height="34" rx="6" />
        <rect x="272" y="706" width="176" height="194" />
        <g fill="#ffffff" opacity="0.34">
          <rect x="300" y="742" width="18" height="58" rx="9" />
          <rect x="342" y="742" width="18" height="58" rx="9" />
          <rect x="384" y="742" width="18" height="58" rx="9" />
        </g>
      </g>

      {/* The columned hall at the centre — the register both a university and a
          bank are built in. Pediment, six columns, steps. */}
      <g fill="url(#orgNear)">
        <path d="M636 618L800 534l164 84z" />
        <rect x="628" y="618" width="344" height="26" rx="4" />
        <g>
          <rect x="656" y="656" width="30" height="212" rx="6" />
          <rect x="714" y="656" width="30" height="212" rx="6" />
          <rect x="772" y="656" width="30" height="212" rx="6" />
          <rect x="830" y="656" width="30" height="212" rx="6" />
          <rect x="888" y="656" width="30" height="212" rx="6" />
        </g>
        <rect x="612" y="868" width="376" height="14" rx="4" />
        <rect x="592" y="882" width="416" height="18" rx="4" />
      </g>

      {/* A clock tower on the right — the working day, kept. */}
      <g fill="url(#orgNear)">
        <rect x="1188" y="560" width="104" height="340" rx="6" />
        <path d="M1176 560l64-52 64 52z" />
        <circle cx="1240" cy="638" r="27" fill="#ffffff" opacity="0.42" />
        <g stroke="#3f6b62" strokeWidth="4" strokeLinecap="round" opacity="0.55">
          <path d="M1240 638v-16M1240 638l12 8" />
        </g>
        <g fill="#ffffff" opacity="0.3">
          <rect x="1206" y="702" width="20" height="42" rx="10" />
          <rect x="1254" y="702" width="20" height="42" rx="10" />
          <rect x="1206" y="774" width="20" height="42" rx="10" />
          <rect x="1254" y="774" width="20" height="42" rx="10" />
        </g>
      </g>

      {/* Two slow bands of haze — the only thing that moves, because a desk is
          not a journey. */}
      <rect className="org-haze org-haze-a" x="-600" y="596" width="620" height="120" fill="url(#orgHaze)" />
      <rect className="org-haze org-haze-b" x="-600" y="716" width="760" height="96" fill="url(#orgHaze)" />

      {/* The ground the content column rests on. */}
      <rect x="0" y="560" width="1600" height="340" fill="url(#orgGround)" />
    </svg>
  );
}
