'use client';

/**
 * The world behind the profile wizard: sky, sun, clouds, far-off landmarks the
 * student might be heading for, and a green foreground. Pure inline SVG so it
 * ships with the page, scales to any viewport, and costs no image requests.
 * Decorative only — hidden from assistive tech.
 */
export function WizardScene() {
  return (
    <svg
      className="wizard-scene-svg"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="wzHill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9fd8c4" />
          <stop offset="1" stopColor="#6fc3a6" />
        </linearGradient>
        <linearGradient id="wzGrass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5fbf9a" />
          <stop offset="1" stopColor="#3f9f7c" />
        </linearGradient>
        <linearGradient id="wzSun" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff3b0" />
          <stop offset="1" stopColor="#ffc46b" />
        </linearGradient>
        <linearGradient id="wzWater" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bfe4ff" />
          <stop offset="1" stopColor="#8fcbf5" />
        </linearGradient>
      </defs>

      {/* sun */}
      <circle cx="1240" cy="190" r="74" fill="url(#wzSun)" opacity="0.9" />
      <circle cx="1240" cy="190" r="110" fill="#ffd98a" opacity="0.18" />

      {/* clouds */}
      <g className="wz-cloud wz-cloud-a" fill="#fff" opacity="0.92">
        <ellipse cx="300" cy="150" rx="90" ry="34" />
        <ellipse cx="350" cy="130" rx="60" ry="40" />
        <ellipse cx="250" cy="140" rx="55" ry="30" />
      </g>
      <g className="wz-cloud wz-cloud-b" fill="#fff" opacity="0.85">
        <ellipse cx="900" cy="90" rx="110" ry="36" />
        <ellipse cx="960" cy="70" rx="70" ry="44" />
        <ellipse cx="840" cy="80" rx="60" ry="32" />
      </g>
      <g className="wz-cloud wz-cloud-c" fill="#fff" opacity="0.8">
        <ellipse cx="1420" cy="330" rx="80" ry="28" />
        <ellipse cx="1460" cy="312" rx="50" ry="34" />
      </g>

      {/* birds */}
      <g fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.9">
        <path d="M560 210c10-12 22-12 32 0M592 210c10-12 22-12 32 0" />
        <path d="M1390 120c8-10 18-10 26 0M1416 120c8-10 18-10 26 0" />
      </g>

      {/* plane */}
      <g className="wz-plane" fill="#fff" stroke="#c9d4ff" strokeWidth="2">
        <path d="M0 0l70 12-70 12 12-12z" transform="translate(120 60)" />
        <path d="M0 0h-40" transform="translate(110 72)" stroke="#fff" strokeWidth="3" strokeDasharray="6 8" opacity="0.7" />
      </g>

      {/* far hills */}
      <path d="M0 520c150-70 300-90 460-60s280 90 460 40 300-110 480-60 200 80 200 80v100H0z" fill="url(#wzHill)" opacity="0.75" />
      <path d="M0 560c200-40 360-70 560-30s330 70 520 20 320-40 520-10v120H0z" fill="url(#wzHill)" />

      {/* water */}
      <rect x="0" y="600" width="1600" height="80" fill="url(#wzWater)" opacity="0.9" />

      {/* landmarks — left: a tower and a skyline */}
      <g fill="#7f93e8">
        <rect x="140" y="470" width="70" height="140" rx="6" />
        <rect x="90" y="520" width="40" height="90" rx="4" fill="#98a8f0" />
        <rect x="220" y="540" width="46" height="70" rx="4" fill="#98a8f0" />
        <g fill="#fff" opacity="0.6">
          <rect x="152" y="490" width="10" height="12" /><rect x="170" y="490" width="10" height="12" /><rect x="188" y="490" width="10" height="12" />
          <rect x="152" y="512" width="10" height="12" /><rect x="170" y="512" width="10" height="12" /><rect x="188" y="512" width="10" height="12" />
          <rect x="152" y="534" width="10" height="12" /><rect x="170" y="534" width="10" height="12" /><rect x="188" y="534" width="10" height="12" />
        </g>
      </g>
      <g>
        <rect x="292" y="300" width="8" height="310" fill="#e8ecf5" />
        <ellipse cx="296" cy="400" rx="30" ry="16" fill="#dfe5f2" />
        <rect x="266" y="392" width="60" height="18" rx="9" fill="#c6d0ea" />
        <rect x="292" y="270" width="8" height="34" fill="#f26d6d" />
      </g>

      {/* landmarks — right: an arch gate */}
      <g fill="#f4b264">
        <rect x="1240" y="470" width="220" height="16" rx="4" fill="#f7c887" />
        <rect x="1250" y="486" width="18" height="124" /><rect x="1290" y="486" width="18" height="124" />
        <rect x="1330" y="486" width="18" height="124" /><rect x="1370" y="486" width="18" height="124" /><rect x="1410" y="486" width="18" height="124" />
        <rect x="1236" y="454" width="228" height="18" rx="4" fill="#e9a453" />
        <circle cx="1350" cy="436" r="16" fill="#7fc6a4" />
      </g>

      {/* landmarks — middle: a dome */}
      <g>
        <ellipse cx="700" cy="560" rx="56" ry="46" fill="#f7d6e4" />
        <rect x="644" y="560" width="112" height="50" fill="#f9e0ea" />
        <rect x="696" y="505" width="8" height="26" fill="#f0b8cf" />
        <rect x="654" y="575" width="14" height="35" rx="7" fill="#fff" opacity="0.7" />
        <rect x="693" y="575" width="14" height="35" rx="7" fill="#fff" opacity="0.7" />
        <rect x="732" y="575" width="14" height="35" rx="7" fill="#fff" opacity="0.7" />
      </g>

      {/* foreground grass */}
      <path d="M0 700c180-60 330-70 520-30s360 60 560 10 340-60 520-20v240H0z" fill="url(#wzGrass)" />
      <ellipse cx="200" cy="900" rx="320" ry="120" fill="#3f9f7c" />
      <ellipse cx="1420" cy="900" rx="360" ry="130" fill="#3f9f7c" />

      {/* trees and shrubs */}
      <g>
        <circle cx="1180" cy="720" r="40" fill="#63c39d" /><rect x="1174" y="740" width="12" height="40" fill="#8a5a3c" />
        <circle cx="1250" cy="740" r="28" fill="#79cfae" /><rect x="1246" y="756" width="8" height="30" fill="#8a5a3c" />
        <circle cx="330" cy="750" r="34" fill="#63c39d" /><rect x="325" y="770" width="10" height="34" fill="#8a5a3c" />
        <ellipse cx="90" cy="790" rx="60" ry="30" fill="#79cfae" />
        <ellipse cx="1540" cy="800" rx="70" ry="34" fill="#79cfae" />
      </g>
      <g stroke="#2f8b69" strokeWidth="4" strokeLinecap="round" opacity="0.8">
        <path d="M430 820l-10-30M440 822l4-32M450 824l12-26" />
        <path d="M1100 850l-8-28M1112 852l6-30M1122 850l14-24" />
      </g>
    </svg>
  );
}
