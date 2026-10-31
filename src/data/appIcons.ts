// High-fidelity standalone base64 SVG app icons that load instantly with zero external network dependencies

export const ICON_NIO_FIBRA = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="28" fill="#14D855"/>
  <rect x="2" y="2" width="124" height="124" rx="26" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
  <text x="64" y="78" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="900" fill="#000000" text-anchor="middle" letter-spacing="-2">nio</text>
</svg>
`)}`;

export const ICON_BRASPRESS = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="bpBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#003399"/>
      <stop offset="100%" stop-color="#001a4d"/>
    </linearGradient>
    <linearGradient id="bpAccent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00c853"/>
      <stop offset="100%" stop-color="#009624"/>
    </linearGradient>
  </defs>
  <!-- Background with squircle radius -->
  <rect width="128" height="128" rx="28" fill="url(#bpBg)"/>
  
  <!-- Subtle inner border -->
  <rect x="2" y="2" width="124" height="124" rx="26" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>

  <!-- Fast Delivery Speed Lines -->
  <path d="M22 42 H48 M18 52 H42 M24 62 H38" stroke="rgba(255,255,255,0.4)" stroke-width="4" stroke-linecap="round"/>

  <!-- Logistics Truck & Arrow Emblem -->
  <!-- Truck Cab & Body -->
  <path d="M46 36 H86 C88.2 36 90 37.8 90 40 V68 H42 V40 C42 37.8 43.8 36 46 36 Z" fill="#ffffff"/>
  <path d="M90 48 H102 C104 48 106 50 107 52 L112 60 C113 62 114 64 114 66 V78 C114 80 112 82 110 82 H102 M90 78 V68 H114" fill="#00c853"/>
  <rect x="92" y="52" width="14" height="12" rx="2" fill="#001a4d"/>

  <!-- Truck Wheels -->
  <circle cx="58" cy="84" r="10" fill="#1e293b" stroke="#ffffff" stroke-width="3"/>
  <circle cx="58" cy="84" r="4" fill="#ffffff"/>
  <circle cx="98" cy="84" r="10" fill="#1e293b" stroke="#ffffff" stroke-width="3"/>
  <circle cx="98" cy="84" r="4" fill="#ffffff"/>

  <!-- Dynamic Green Express Arrow -->
  <path d="M36 96 L82 96 L74 88 M82 96 L74 104" stroke="#00e676" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`)}`;

export const ICON_NOVASPHERE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="nsBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#08090b"/>
    </linearGradient>
    <linearGradient id="nsCyan" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="28" fill="url(#nsBg)"/>
  <rect x="2" y="2" width="124" height="124" rx="26" fill="none" stroke="rgba(56,189,248,0.3)" stroke-width="2"/>
  <!-- TV Monitor Screen -->
  <rect x="24" y="32" width="80" height="56" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="3"/>
  <!-- Play Polygon -->
  <polygon points="56,46 78,60 56,74" fill="url(#nsCyan)"/>
  <!-- Stand -->
  <path d="M54 88 H74 M64 88 V96 M50 96 H78" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
</svg>
`)}`;

export const ICON_FINTRACK = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="ftBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064e3b"/>
      <stop offset="100%" stop-color="#022c22"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="28" fill="url(#ftBg)"/>
  <rect x="2" y="2" width="124" height="124" rx="26" fill="none" stroke="rgba(16,185,129,0.3)" stroke-width="2"/>
  <!-- Wallet Shape -->
  <rect x="28" y="40" width="72" height="48" rx="6" fill="#10b981"/>
  <path d="M28 50 H100" stroke="#047857" stroke-width="3"/>
  <circle cx="82" cy="64" r="6" fill="#ffffff"/>
  <circle cx="82" cy="64" r="2.5" fill="#064e3b"/>
</svg>
`)}`;

export const ICON_DELIVERY = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="delBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ea580c"/>
      <stop offset="100%" stop-color="#c2410c"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="28" fill="url(#delBg)"/>
  <rect x="2" y="2" width="124" height="124" rx="26" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
  <!-- Scooter / Food Bell Emblem -->
  <path d="M40 76 H88 M50 76 C50 64 60 54 72 54 C84 54 88 64 88 76" stroke="#ffffff" stroke-width="5" stroke-linecap="round" fill="none"/>
  <circle cx="72" cy="46" r="5" fill="#ffffff"/>
  <circle cx="48" cy="84" r="8" fill="#1c1917" stroke="#ffffff" stroke-width="3"/>
  <circle cx="84" cy="84" r="8" fill="#1c1917" stroke="#ffffff" stroke-width="3"/>
</svg>
`)}`;

export const ICON_SHOPPING = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="shopBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#5b21b6"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="28" fill="url(#shopBg)"/>
  <rect x="2" y="2" width="124" height="124" rx="26" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
  <!-- Shopping Bag -->
  <path d="M38 46 H90 L84 94 H44 Z" fill="#ffffff"/>
  <path d="M50 46 V36 C50 28.3 56.3 22 64 22 C71.7 22 78 28.3 78 36 V46" stroke="#ffffff" stroke-width="6" stroke-linecap="round" fill="none"/>
  <polygon points="64,58 68,68 78,68 70,74 73,84 64,78 55,84 58,74 50,68 60,68" fill="#7c3aed"/>
</svg>
`)}`;

export const ICON_SECURITY = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="secBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="28" fill="url(#secBg)"/>
  <rect x="2" y="2" width="124" height="124" rx="26" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
  <!-- Shield and Lock -->
  <path d="M64 26 L94 40 V62 C94 80 81 96 64 102 C47 96 34 80 34 62 V40 Z" fill="#ffffff"/>
  <path d="M56 64 V56 C56 51.6 59.6 48 64 48 C68.4 48 72 51.6 72 56 V64" stroke="#0284c7" stroke-width="4" stroke-linecap="round" fill="none"/>
  <rect x="52" y="64" width="24" height="18" rx="3" fill="#0284c7"/>
</svg>
`)}`;

export const PRESET_ICONS = [
  { name: 'Braspress Logística', icon: ICON_BRASPRESS, category: 'Transporte & Cargas' },
  { name: 'Streaming TV Pro', icon: ICON_NOVASPHERE, category: 'Mídia & IPTV' },
  { name: 'Banco & Carteira', icon: ICON_FINTRACK, category: 'Finanças & Contas' },
  { name: 'Food Delivery Express', icon: ICON_DELIVERY, category: 'Entregas & Restaurantes' },
  { name: 'E-Commerce Store', icon: ICON_SHOPPING, category: 'Compras & Varejo' },
  { name: 'Segurança & VPN', icon: ICON_SECURITY, category: 'Ferramentas & Proteção' },
];

/**
 * Generates a modern 100% SVG vector icon for any application name
 * using Google Play squircle curvature and smooth multi-stop gradients.
 */
export function generateVectorAppIcon(appName: string, category: string = 'Aplicativo'): string {
  const firstLetter = (appName || 'A').trim().charAt(0).toUpperCase();
  const colors: Array<{ start: string; end: string; accent: string }> = [
    { start: '#01875F', end: '#00583F', accent: '#34A853' }, // Official Play Green
    { start: '#0086F8', end: '#00529C', accent: '#60A5FA' }, // Google Blue
    { start: '#7C3AED', end: '#4C1D95', accent: '#A78BFA' }, // Violet
    { start: '#EA580C', end: '#9A3412', accent: '#FB923C' }, // Orange
    { start: '#0D9488', end: '#115E59', accent: '#2DD4BF' }, // Teal
    { start: '#E11D48', end: '#9F1239', accent: '#FB7185' }, // Rose
  ];

  let hash = 0;
  for (let i = 0; i < appName.length; i++) {
    hash = (hash << 5) - hash + appName.charCodeAt(i);
  }
  const colorIndex = Math.abs(hash) % colors.length;
  const { start, end, accent } = colors[colorIndex];

  return `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="genBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${start}"/>
      <stop offset="100%" stop-color="${end}"/>
    </linearGradient>
    <linearGradient id="genGlow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.3)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </linearGradient>
  </defs>
  <!-- Squircle Base -->
  <rect width="128" height="128" rx="28" fill="url(#genBg)"/>
  
  <!-- Subtle Top Glaze -->
  <path d="M0 28 C0 12.5 12.5 0 28 0 L100 0 C115.5 0 128 12.5 128 28 L128 64 C80 64 48 32 0 44 Z" fill="url(#genGlow)" opacity="0.4"/>
  
  <!-- Outer Bevel Line -->
  <rect x="2" y="2" width="124" height="124" rx="26" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>

  <!-- Geometric Abstract Badge -->
  <circle cx="64" cy="64" r="32" fill="rgba(255,255,255,0.12)" stroke="${accent}" stroke-width="2"/>
  
  <!-- Vector Letter Glyph -->
  <text x="64" y="74" font-family="'Google Sans', 'Roboto', 'Arial', sans-serif" font-size="34" font-weight="800" fill="#ffffff" text-anchor="middle" dominant-baseline="central">
    ${firstLetter}
  </text>
</svg>
`)}`;
}
