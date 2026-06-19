import { cn } from "@/lib/utils";

/** App brand palette for auth illustration */
const C = {
  purple: "#5d21d0",
  purpleDark: "#4a1ca8",
  purpleLight: "#7c3aed",
  orange: "#ff9f1c",
  orangeDark: "#e8890a",
  blue: "#4f8cff",
  yellow: "#ffb800",
  green: "#35ed7e",
  surface: "#f3f4f6",
  grid: "#e8ecf1",
  text: "#1e293b",
  muted: "#64748b",
  white: "#ffffff",
  desk: "#d4d4d8",
} as const;

type AuthIllustrationProps = {
  className?: string;
  compact?: boolean;
};

function AuthIllustrationSvg({ compact }: { compact?: boolean }) {
  return (
    <svg
      viewBox="0 0 800 600"
      className={cn("h-auto w-full", compact ? "max-w-[min(100%,380px)]" : "w-full")}
      aria-hidden
      role="img"
    >
      <title>Learning platform sign in</title>

      <defs>
        <linearGradient id="auth-desk" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={C.desk} />
          <stop offset="100%" stopColor="#e4e4e7" />
        </linearGradient>
        <linearGradient id="auth-screen" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={C.white} />
          <stop offset="100%" stopColor="#fafafa" />
        </linearGradient>
        <filter id="auth-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#5d21d0" floodOpacity="0.12" />
        </filter>
        <filter id="auth-shadow-sm">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.1" />
        </filter>
      </defs>

      {/* Soft brand blobs — no solid box; sits on oval grid behind */}
      <circle cx="680" cy="110" r="90" fill={C.orange} opacity="0.12" />
      <circle cx="100" cy="90" r="70" fill={C.purple} opacity="0.1" />
      <circle cx="720" cy="500" r="80" fill={C.blue} opacity="0.1" />

      {/* Floating stats cards */}
      <g filter="url(#auth-shadow-sm)">
        <rect x="70" y="130" width="130" height="78" rx="14" fill={C.white} stroke={C.grid} strokeWidth="1.5" />
        <text x="92" y="162" fontSize="13" fill={C.muted} fontFamily="system-ui, sans-serif">
          Assignments
        </text>
        <text x="92" y="192" fontSize="28" fontWeight="700" fill={C.purple} fontFamily="system-ui, sans-serif">
          12
        </text>
        <rect x="92" y="198" width="48" height="4" rx="2" fill={C.orange} opacity="0.5" />
      </g>

      <g filter="url(#auth-shadow-sm)">
        <rect x="610" y="250" width="130" height="78" rx="14" fill={C.white} stroke={C.grid} strokeWidth="1.5" />
        <text x="632" y="282" fontSize="13" fill={C.muted} fontFamily="system-ui, sans-serif">
          Progress
        </text>
        <text x="632" y="312" fontSize="28" fontWeight="700" fill={C.green} fontFamily="system-ui, sans-serif">
          86%
        </text>
      </g>

      {/* Secure login badge */}
      <g transform="translate(620 105)" filter="url(#auth-shadow-sm)">
        <circle r="32" fill={C.white} stroke={C.grid} strokeWidth="1.5" />
        <path
          d="M0 -12 C0 -12 14 -12 14 -2 L14 12 L0 20 L-14 12 L-14 -2 C-14 -12 0 -12 0 -12 Z"
          fill={C.green}
        />
        <path
          d="M-5 2 L-1 7 L7 -3"
          stroke={C.white}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Desk */}
      <g filter="url(#auth-shadow)">
        <rect x="100" y="418" width="580" height="22" rx="11" fill="url(#auth-desk)" />
        <rect x="130" y="440" width="14" height="72" rx="4" fill="#71717a" />
        <rect x="636" y="440" width="14" height="72" rx="4" fill="#71717a" />
      </g>

      {/* Notebook on desk */}
      <g filter="url(#auth-shadow-sm)">
        <rect x="110" y="330" width="118" height="88" rx="12" fill={C.white} stroke={C.grid} strokeWidth="1.5" />
        <line x1="132" y1="354" x2="206" y2="354" stroke={C.grid} strokeWidth="2" />
        <line x1="132" y1="374" x2="206" y2="374" stroke={C.grid} strokeWidth="2" />
        <line x1="132" y1="394" x2="186" y2="394" stroke={C.grid} strokeWidth="2" />
        <rect x="118" y="338" width="6" height="72" rx="2" fill={C.orange} opacity="0.6" />
      </g>

      {/* Book stack — on desk surface */}
      <g filter="url(#auth-shadow-sm)">
        <rect x="110" y="404" width="88" height="14" rx="5" fill={C.orange} />
        <rect x="116" y="390" width="76" height="14" rx="5" fill={C.purple} />
        <rect x="122" y="376" width="64" height="14" rx="5" fill={C.blue} />
      </g>

      {/* Pencil cup — on desk */}
      <g filter="url(#auth-shadow-sm)">
        <rect x="680" y="386" width="36" height="32" rx="6" fill="#52525b" />
        <rect x="688" y="366" width="5" height="28" rx="2" fill={C.yellow} />
        <rect x="696" y="362" width="5" height="32" rx="2" fill={C.blue} />
        <rect x="704" y="368" width="5" height="26" rx="2" fill={C.purple} />
      </g>

      {/* Laptop — screen + base seated on desk (desk top y=418) */}
      <g filter="url(#auth-shadow)">
        {/* Screen lid */}
        <rect x="240" y="178" width="320" height="220" rx="18" fill={C.purpleDark} />
        <rect x="256" y="194" width="288" height="188" rx="12" fill="url(#auth-screen)" stroke={C.grid} strokeWidth="1" />

        {/* Login UI */}
        <circle cx="400" cy="218" r="14" fill={C.purple} opacity="0.15" />
        <path
          d="M394 218 L398 222 L406 212"
          stroke={C.purple}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <text
          x="400"
          y="248"
          textAnchor="middle"
          fontSize="16"
          fill={C.purple}
          fontWeight="700"
          fontFamily="system-ui, sans-serif"
        >
          School Portal
        </text>
        <text x="278" y="272" fontSize="11" fill={C.muted} fontFamily="system-ui, sans-serif">
          Email
        </text>
        <rect x="278" y="278" width="244" height="22" rx="8" fill={C.surface} stroke={C.grid} strokeWidth="1.5" />
        <rect x="288" y="286" width="120" height="6" rx="3" fill={C.muted} opacity="0.35" />

        <text x="278" y="316" fontSize="11" fill={C.muted} fontFamily="system-ui, sans-serif">
          Password
        </text>
        <rect x="278" y="322" width="244" height="22" rx="8" fill={C.surface} stroke={C.grid} strokeWidth="1.5" />
        <circle cx="504" cy="333" r="3" fill={C.muted} opacity="0.4" />
        <circle cx="512" cy="333" r="3" fill={C.muted} opacity="0.4" />
        <circle cx="520" cy="333" r="3" fill={C.muted} opacity="0.4" />

        <rect x="328" y="356" width="144" height="32" rx="16" fill={C.orange} />
        <text
          x="400"
          y="376"
          textAnchor="middle"
          fontSize="13"
          fill={C.white}
          fontWeight="700"
          fontFamily="system-ui, sans-serif"
        >
          Sign in
        </text>

        {/* Keyboard base — flush on desk */}
        <rect x="210" y="398" width="380" height="20" rx="10" fill={C.purple} />
        <rect x="370" y="412" width="60" height="6" rx="3" fill={C.purpleDark} />
      </g>
    </svg>
  );
}

export function AuthIllustration({ className, compact }: AuthIllustrationProps) {
  return (
    <div className={cn("flex w-full items-center justify-center", className)}>
      <AuthIllustrationSvg compact={compact} />
    </div>
  );
}

export function AuthIllustrationMobile({ className }: { className?: string }) {
  return (
    <div className={cn("flex w-full justify-center px-2", className)}>
      <AuthIllustrationSvg compact />
    </div>
  );
}

/** @deprecated Use AuthIllustration */
export const LoginIllustration = AuthIllustration;
