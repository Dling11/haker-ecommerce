import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300/80">
        404 Page
      </p>
      <h1 className="text-4xl font-black text-white">Page not found</h1>
      <p className="max-w-md text-white/60">
        The page you requested does not exist yet. We can add it when we build the
        next feature.
      </p>
      <Link
        to="/shop"
        className="rounded-[10px] bg-white px-5 py-3 text-sm font-semibold text-[#0f141b] transition hover:bg-white/90"
      >
        Back to home
      </Link>
    </section>
  );
}

export default NotFoundPage;
