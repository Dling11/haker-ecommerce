import { Bell, Package, UserPlus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { fetchDashboardStats } from "../../features/admin/adminSlice";

const formatRelativeTime = (value) => {
  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return "";
  }

  const diffInSeconds = Math.round((timestamp - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const units = [
    { unit: "day", seconds: 86400 },
    { unit: "hour", seconds: 3600 },
    { unit: "minute", seconds: 60 },
  ];

  for (const { unit, seconds } of units) {
    if (Math.abs(diffInSeconds) >= seconds || unit === "minute") {
      return formatter.format(Math.round(diffInSeconds / seconds), unit);
    }
  }

  return "just now";
};

function AdminTopbar() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { stats } = useSelector((state) => state.admin);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef(null);
  const activityFeed = stats?.activityFeed || [];
  const notificationPreview = useMemo(() => activityFeed.slice(0, 5), [activityFeed]);
  const unreadCount = Math.min(activityFeed.length, 9);

  useEffect(() => {
    if (!stats) {
      dispatch(fetchDashboardStats());
    }
  }, [dispatch, stats]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!notificationsRef.current?.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  return (
    <div className="panel relative z-20 flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent-600">
          Admin Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-black text-white">
          Welcome back, {user?.name || "Admin"}
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div ref={notificationsRef} className="relative z-30">
          <button
            type="button"
            onClick={() => setIsNotificationsOpen((current) => !current)}
            className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/80 transition hover:bg-white/[0.08] hover:text-white"
            aria-label="Toggle notifications"
          >
            <Bell size={18} />
            {unreadCount ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white shadow-[0_0_0_4px_rgba(9,11,15,0.85)]">
                {unreadCount}
              </span>
            ) : null}
          </button>

          {isNotificationsOpen ? (
            <div className="absolute right-0 z-50 mt-3 w-[340px] overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#0e1319]/95 shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur">
              <div className="border-b border-white/8 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-600">
                  Notifications
                </p>
                <p className="mt-2 text-sm text-white/55">
                  Recent orders and registrations across the store.
                </p>
              </div>

              <div className="max-h-[360px] space-y-1 overflow-y-auto p-3">
                {notificationPreview.length ? (
                  notificationPreview.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-start gap-3 rounded-[1rem] px-3 py-3 text-sm transition hover:bg-white/[0.04]"
                    >
                      <span className="mt-0.5 rounded-full bg-white/8 p-2 text-accent-600">
                        {item.type === "order" ? <Package size={14} /> : <UserPlus size={14} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="line-clamp-2 font-semibold text-white">{item.title}</p>
                          <span className="shrink-0 text-[11px] font-medium text-white/35">
                            {formatRelativeTime(item.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-white/45">{item.subtitle}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-6 text-center text-sm text-white/45">
                    No recent activity yet.
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        <Link to="/shop" className="btn-secondary">
          Back to Store
        </Link>
      </div>
    </div>
  );
}

export default AdminTopbar;
