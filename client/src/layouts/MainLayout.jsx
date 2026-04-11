import { Outlet } from "react-router-dom";

import AppBootstrap from "../components/common/AppBootstrap";
import Header from "../components/common/Header";

function MainLayout() {
  return (
    <div className="min-h-screen text-slate-800">
      <AppBootstrap />
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
