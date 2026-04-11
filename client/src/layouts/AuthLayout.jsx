import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#13161d] text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_28%),radial-gradient(circle_at_80%_30%,rgba(168,85,247,0.14),transparent_26%),radial-gradient(circle_at_50%_100%,rgba(34,197,94,0.12),transparent_28%),linear-gradient(135deg,#11151d_0%,#181d26_48%,#0e1117_100%)]" />
          <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:42px_42px]" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12">
            <div>
              <p className="font-display text-3xl font-bold tracking-[0.35em] text-white">
                HAKER
              </p>
              <p className="mt-4 max-w-md text-sm leading-7 text-white/70">
                Modern commerce control for customers and admins, built for a clean
                real-world workflow.
              </p>
            </div>

            <div className="max-w-xl space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/80">
                Secure Entry
              </p>
              <h1 className="font-display text-5xl font-bold leading-[1.05] text-white">
                A sharper, calmer way to manage your store.
              </h1>
              <p className="max-w-lg text-base leading-8 text-white/70">
                Access your orders, products, users, and payments from one focused
                platform designed for everyday operations.
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md rounded-[10px] border border-white/10 bg-[#1a1f29] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <Outlet />
          </div>
        </section>
      </div>
    </div>
  );
}

export default AuthLayout;
