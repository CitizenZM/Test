import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh]">
      <div className="rounded-2xl border border-slate-200/60 bg-white p-12 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <p className="text-6xl font-bold text-slate-200">404</p>
        <p className="mt-4 text-lg font-semibold text-slate-700">Page not found</p>
        <p className="mt-2 text-sm text-slate-500">The page you are looking for does not exist.</p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-indigo-500/20 hover:shadow-lg transition-all"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
