import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

function AdminTopbar() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="panel flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent-600">
          Admin Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-black text-white">
          Welcome back, {user?.name || "Admin"}
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link to="/shop" className="btn-secondary">
          Back to Store
        </Link>
      </div>
    </div>
  );
}

export default AdminTopbar;
