import type { SVGProps } from 'react';

/**
 * Inline icon set for the landing page.
 *
 * The Stitch export pulled Material Symbols from Google Fonts; inlining the
 * handful of glyphs we actually use avoids a render-blocking webfont, keeps the
 * strokes optically consistent with the design system, and adds no dependency.
 */
const PATHS = {
  'arrow-right': 'M5 12h13M13 6l6 6-6 6',
  check: 'M20 6 9 17l-5-5',
  'check-circle': 'M21 12a9 9 0 1 1-4.2-7.6M22 5 12 15l-3-3',
  verified: 'M12 2.8 14.4 5l3-.2.9 2.9 2.5 1.6-1.2 2.7 1.2 2.7-2.5 1.6-.9 2.9-3-.2L12 21.2 9.6 19l-3 .2-.9-2.9L3.2 14.7 4.4 12 3.2 9.3l2.5-1.6.9-2.9 3 .2ZM8.9 12.1l2.1 2.1 4.1-4.3',
  lock: 'M6 10.5h12v10H6zM8.6 10.5V7.4a3.4 3.4 0 0 1 6.8 0v3.1M12 14.6v2.2',
  mail: 'M3 6.5h18v11H3zM3.6 7.2 12 13l8.4-5.8',
  'mail-unread': 'M3 7.8h12.4v9.7H3zM3.5 8.3l5.7 4 5.7-4M19 4.5a2.4 2.4 0 1 1 0 4.9 2.4 2.4 0 0 1 0-4.9Z',
  'mail-out': 'M3 6.5h11v11H3zM3.5 7.1 8.5 11l5-3.9M16.5 12.5h5m0 0-2.4-2.4m2.4 2.4-2.4 2.4',
  school: 'M2.6 8.8 12 4.4l9.4 4.4L12 13.2 2.6 8.8ZM6.4 10.6v4.9c0 1.6 2.5 2.9 5.6 2.9s5.6-1.3 5.6-2.9v-4.9M20.4 9.3v5.2',
  award: 'M12 3.2a5.6 5.6 0 1 1 0 11.2 5.6 5.6 0 0 1 0-11.2ZM9.4 8.8l1.7 1.7 3.3-3.3M8.6 14.1 7.2 20.8l4.8-2.3 4.8 2.3-1.4-6.7',
  payments: 'M2.8 6.6h14.6v8.2H2.8zM2.8 9.4h14.6M20.4 9v8.4H6.6',
  cpu: 'M7.4 7.4h9.2v9.2H7.4zM10.6 10.6h2.8v2.8h-2.8M9.6 4v2.4M14.4 4v2.4M9.6 17.6V20M14.4 17.6V20M4 9.6h2.4M4 14.4h2.4M17.6 9.6H20M17.6 14.4H20',
  network: 'M12 3.4a2.6 2.6 0 1 1 0 5.2 2.6 2.6 0 0 1 0-5.2ZM5.4 15.4a2.6 2.6 0 1 1 0 5.2 2.6 2.6 0 0 1 0-5.2ZM18.6 15.4a2.6 2.6 0 1 1 0 5.2 2.6 2.6 0 0 1 0-5.2ZM10.4 8.8 6.6 15.2M13.6 8.8l3.8 6.4M8 18h8',
  shield: 'M12 3.2 4.8 6v6.1c0 4.2 3 7.1 7.2 8.7 4.2-1.6 7.2-4.5 7.2-8.7V6L12 3.2Z',
  'shield-check': 'M12 3.2 4.8 6v6.1c0 4.2 3 7.1 7.2 8.7 4.2-1.6 7.2-4.5 7.2-8.7V6L12 3.2ZM8.9 11.8l2.2 2.2 4-4.2',
  security: 'M12 3.2 4.8 6v6.1c0 4.2 3 7.1 7.2 8.7 4.2-1.6 7.2-4.5 7.2-8.7V6L12 3.2ZM12 8.6v3.2M12 15.1h.01',
  'search-off': 'M15.6 15.6a6 6 0 1 1 0-8.5M20.4 20.4 16 16M4 20 20 4',
  'edit-note': 'M4 6.4h9M4 11h9M4 15.6h5M14.6 19.6l5.8-5.8-2.6-2.6-5.8 5.8-.6 3.2 3.2-.6Z',
  hourglass: 'M7 3.6h10M7 20.4h10M7.6 3.6v3.1c0 2 4.4 3.6 4.4 5.3 0 1.7-4.4 3.3-4.4 5.3v3.1M16.4 3.6v3.1c0 2-4.4 3.6-4.4 5.3 0 1.7 4.4 3.3 4.4 5.3v3.1',
  badge: 'M4 6.4h16v13.2H4zM9 4v2.4h6V4M12 10.6a1.9 1.9 0 1 1 0 3.8 1.9 1.9 0 0 1 0-3.8ZM8.6 17.4c.5-1.5 1.8-2.3 3.4-2.3s2.9.8 3.4 2.3',
  eye: 'M2.6 12S6.2 6 12 6s9.4 6 9.4 6-3.6 6-9.4 6-9.4-6-9.4-6ZM12 9.4a2.6 2.6 0 1 1 0 5.2 2.6 2.6 0 0 1 0-5.2Z',
  bookmark: 'M6.4 3.8h11.2v16.4L12 16.4l-5.6 3.8V3.8ZM9.4 9.6l1.9 1.9 3.4-3.6',
  filter: 'M3.4 5.6h17.2l-6.6 7.7v5.6l-4-2.2v-3.4L3.4 5.6Z',
  'trending-up': 'M3.4 16.6 9.2 10.8l3.4 3.4 7.4-7.4M15.6 6.8h4.4v4.4',
  bank: 'M3 9.6 12 4.4l9 5.2M4.8 9.6v8.2M9.6 9.6v8.2M14.4 9.6v8.2M19.2 9.6v8.2M3 19.6h18',
  flask: 'M9.6 3.6v5.2L4.8 17a2.6 2.6 0 0 0 2.3 3.9h9.8a2.6 2.6 0 0 0 2.3-3.9l-4.8-8.2V3.6M8.2 3.6h7.6M7 14.4h10',
  globe: 'M12 3.4a8.6 8.6 0 1 1 0 17.2 8.6 8.6 0 0 1 0-17.2ZM3.6 12h16.8M12 3.4c2.2 2.3 3.4 5.3 3.4 8.6S14.2 18.3 12 20.6c-2.2-2.3-3.4-5.3-3.4-8.6S9.8 5.7 12 3.4Z',
  sparkle: 'M12 3.4 13.8 9 19.4 10.8 13.8 12.6 12 18.2 10.2 12.6 4.6 10.8 10.2 9 12 3.4Z',
  clock: 'M12 3.6a8.4 8.4 0 1 1 0 16.8 8.4 8.4 0 0 1 0-16.8ZM12 7.4V12l3.1 1.9',
  menu: 'M4 7.5h16M4 12h16M4 16.5h16',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM13 13h7v7h-7zM4 13h7v7H4z',
  compass: 'M12 3.2a8.8 8.8 0 1 1 0 17.6 8.8 8.8 0 0 1 0-17.6ZM15.6 8.4l-1.7 5-5 1.7 1.7-5 5-1.7Z',
  sliders: 'M4 7h9M17 7h3M4 12h3M11 12h9M4 17h13M20 17h0M15 5v4M9 10v4M17 15v4',
  bell: 'M6.4 9.6a5.6 5.6 0 0 1 11.2 0c0 5 2.1 6.4 2.1 6.4H4.3s2.1-1.4 2.1-6.4M10 20a2.2 2.2 0 0 0 4 0',
  bolt: 'M13.2 3 5.4 13.2h5.2L10.2 21l8-10.4h-5.4L13.2 3Z',
  search: 'M10.6 4a6.6 6.6 0 1 1 0 13.2 6.6 6.6 0 0 1 0-13.2ZM20.4 20.4l-4.5-4.5',
  gauge: 'M12 4.4a8.4 8.4 0 0 1 8.2 10.2H3.8A8.4 8.4 0 0 1 12 4.4ZM12 14.4l4-3.4',
  chevron: 'M9 6l6 6-6 6',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  unfold: 'M8 9l4-4 4 4M8 15l4 4 4-4',
  calendar: 'M4.5 6.4h15v14h-15zM4.5 10.4h15M8.4 3.6v3.4M15.6 3.6v3.4',
  close: 'M6 6l12 12M18 6 6 18'
} as const;

export type IconName = keyof typeof PATHS;

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 20, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
