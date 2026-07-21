import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="gradient-text text-7xl font-extrabold">404</p>
      <h1 className="mt-4 text-2xl font-bold text-white">Page not found</h1>
      <p className="mt-3 max-w-md text-slate-400">
        That page doesn&apos;t exist or has moved. Let&apos;s get you back on track.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">
          Home
        </Link>
        <Link href="/blog" className="btn-ghost">
          Writing
        </Link>
        <Link href="/tools" className="btn-ghost">
          Tools
        </Link>
      </div>
    </div>
  );
}
