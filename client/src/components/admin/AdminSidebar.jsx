import { LogOut } from "lucide-react";
import { useDispatch } from "react-redux";
import { NavLink } from "react-router-dom";

import { logoutUser } from "../../features/auth/authSlice";

const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/orders", label: "Orders" },
];

function AdminSidebar() {
  const dispatch = useDispatch();

  return (
    <aside className="flex h-full flex-col rounded-[10px] bg-surface-sidebar px-5 py-6 text-white">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
          Control Room
        </p>
        <h2 className="mt-3 text-2xl font-black">haker-ecommerce</h2>
      </div>

      <nav className="space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              [
                "flex items-center rounded-[10px] px-4 py-3 text-sm font-semibold transition",
                isActive
                  ? "bg-white text-surface-sidebar"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
              ].join(" ")
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-4">
        <div className="rounded-[10px] bg-white/10 p-4 text-sm text-white/70">
          Manage products, users, and orders from one dedicated admin workspace.
        </div>

        <button
          type="button"
          onClick={() => dispatch(logoutUser())}
          className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-white/10 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
