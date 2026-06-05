import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">404</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.02em] text-foreground text-balance">
        Page not found
      </h1>
      <p className="mt-4 text-muted-foreground">The page you are looking for is not available.</p>
      <Link
        className="mt-8 rounded-md bg-gradient-brand px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:-translate-y-0.5 hover:shadow-lifted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        href="/"
      >
        Return home
      </Link>
    </main>
  );
}
