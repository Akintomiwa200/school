export function AuthDivider({ label = "or continue with" }: { label?: string }) {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <div className="w-full border-t border-marketing-grid" />
      </div>
      <p className="relative mx-auto w-fit bg-marketing-bg px-3 text-xs uppercase tracking-wide text-marketing-muted">
        {label}
      </p>
    </div>
  );
}
