import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center px-6 text-center">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="display mt-6 text-6xl">This path leads nowhere</h1>
        <p className="mt-6 text-sand">But the lawn is still open.</p>
        <Link href="/" className="btn btn-gold mt-10">Return home</Link>
      </div>
    </main>
  );
}
