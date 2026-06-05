export function LoadingSpinner({ label = "Loading" }: { label?: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground shadow-soft">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        {label}
      </div>
    </main>
  );
}
