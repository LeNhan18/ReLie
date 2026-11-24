import Link from "next/link";

export function BigButton({ href, title, hint }: { href: string; title: string; hint: string }) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm active:scale-[0.99]"
    >
      <div className="text-lg font-semibold">{title}</div>
      <div className="mt-1 text-sm text-slate-600">{hint}</div>
    </Link>
  );
}
