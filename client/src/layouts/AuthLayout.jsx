import { Outlet } from "react-router-dom";

import AppBootstrap from "../components/common/AppBootstrap";
import hackerAnonymousImage from "../assets/hacker-annonymous.png";

function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#090b0f] text-white">
      <AppBootstrap />
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(34,211,238,0.12),transparent_24%),radial-gradient(circle_at_85%_20%,rgba(59,130,246,0.1),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.05),transparent_32%),linear-gradient(145deg,#06080b_0%,#0b0f14_45%,#05070a_100%)]" />
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:42px_42px]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.38))]" />

          <div className="relative z-10 flex w-full items-center justify-center p-12">
            <div className="flex w-full max-w-xl flex-col items-center justify-center gap-8 text-center">
              <div>
                <p className="font-display text-3xl font-bold tracking-[0.28em] text-white">
                  HAKER-ECOMMERCE
                </p>
                <p className="mt-4 max-w-md text-sm leading-7 text-white/70">
                  A focused storefront for apparel, collectibles, and everyday picks
                  wrapped in a cleaner shopping experience.
                </p>
              </div>

              <div className="relative mx-auto flex w-full max-w-md items-center justify-center rounded-[2.4rem] border border-white/8 bg-white/[0.03] p-10 shadow-[0_30px_100px_rgba(0,0,0,0.55)] backdrop-blur-sm">
                <div className="absolute inset-0 rounded-[2.4rem] bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.1),transparent_44%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.1),transparent_44%)]" />
                <img
                  src={hackerAnonymousImage}
                  alt="Haker storefront emblem"
                  className="relative z-10 h-80 w-80 object-contain drop-shadow-[0_18px_45px_rgba(8,145,178,0.18)]"
                />
              </div>
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
