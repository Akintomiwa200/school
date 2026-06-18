export function AuthWaveTop({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 390 130"
      className={className}
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        className="fill-brand-blue"
        d="M0,0 H390 V68 C310,85 240,94 195,78 C150,62 90,54 0,72 Z"
      />
      <path
        className="fill-brand-purple"
        d="M0,0 H390 V88 C320,108 255,118 195,100 C135,82 70,74 0,94 Z"
      />
    </svg>
  );
}

export function AuthWaveBottom({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 390 110"
      className={className}
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        className="fill-brand-blue"
        d="M0,48 C70,28 140,18 195,36 C250,54 320,64 390,44 V110 H0 Z"
      />
      <path
        className="fill-brand-purple"
        d="M0,32 C70,12 140,2 195,20 C250,38 320,48 390,28 V110 H0 Z"
      />
    </svg>
  );
}
