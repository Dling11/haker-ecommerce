import { Outlet } from "react-router-dom";

import AdminSidebar from "../components/admin/AdminSidebar";
import AdminTopbar from "../components/admin/AdminTopbar";
import AppBootstrap from "../components/common/AppBootstrap";

function AdminLayout() {
  return (
    <div className="app-shell">
      <AppBootstrap />
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6">
        <div className="lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
          <AdminSidebar />
        </div>

        <div className="space-y-6 pb-8">
          <AdminTopbar />
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
