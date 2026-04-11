import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { useEffect } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { useDispatch, useSelector } from "react-redux";

import AdminStatCard from "../../components/admin/AdminStatCard";
import StatusMessage from "../../components/common/StatusMessage";
import { fetchDashboardStats } from "../../features/admin/adminSlice";
import { formatCurrency } from "../../utils/formatCurrency";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip
);

function AdminDashboardPage() {
  const dispatch = useDispatch();
  const { stats, isLoading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const statusLabels = [
    "pending",
    "need_payment",
    "processing",
    "out_for_delivery",
    "delivered",
    "cancelled",
  ];

  const statusChartData = {
    labels: statusLabels.map((label) => label.replaceAll("_", " ")),
    datasets: [
      {
        label: "Orders",
        data: statusLabels.map((label) => stats?.statusBreakdown?.[label] || 0),
        backgroundColor: [
          "#f59e0b",
          "#fb923c",
          "#366953",
          "#0ea5e9",
          "#22c55e",
          "#ef4444",
        ],
        borderWidth: 0,
      },
    ],
  };

  const summaryChartData = {
    labels: ["Users", "Orders", "Products"],
    datasets: [
      {
        label: "Totals",
        data: [stats?.usersCount || 0, stats?.ordersCount || 0, stats?.productsCount || 0],
        backgroundColor: ["#13271f", "#366953", "#e6893e"],
        borderRadius: 10,
      },
    ],
  };

  return (
    <section className="space-y-6">
      <StatusMessage type="error" message={error} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Total Users"
          value={stats?.usersCount || 0}
          hint="Registered customer and admin accounts"
        />
        <AdminStatCard
          label="Total Orders"
          value={stats?.ordersCount || 0}
          hint="All placed orders in the system"
        />
        <AdminStatCard
          label="Products"
          value={stats?.productsCount || 0}
          hint="Published and draft catalog items"
        />
        <AdminStatCard
          label="Revenue"
          value={formatCurrency(stats?.totalRevenue || 0)}
          hint="Calculated from non-cancelled orders"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="panel p-6">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">
              Store Activity
            </p>
            <h2 className="mt-2 text-2xl font-black text-brand-900">
              System totals overview
            </h2>
          </div>

          <div className="h-[320px]">
            <Bar
              data={summaryChartData}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
              }}
            />
          </div>
        </div>

        <div className="panel p-6">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">
              Order Pipeline
            </p>
            <h2 className="mt-2 text-2xl font-black text-brand-900">
              Status breakdown
            </h2>
          </div>

          <div className="h-[320px]">
            <Doughnut
              data={statusChartData}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom",
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="panel p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">
              Recent Orders
            </p>
            <h2 className="mt-2 text-2xl font-black text-brand-900">
              Latest activity snapshot
            </h2>
          </div>
          {isLoading ? <span className="text-sm text-ink-500">Refreshing...</span> : null}
        </div>

        <div className="grid gap-4">
          {(stats?.latestOrders || []).map((order) => (
            <article
              key={order._id}
              className="flex flex-col gap-3 rounded-[1.5rem] bg-surface-muted/60 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <h3 className="text-lg font-bold text-brand-900">
                  Order #{order._id.slice(-6).toUpperCase()}
                </h3>
                <p className="text-sm text-ink-500">
                  {order.user?.name || "Unknown"} - {order.user?.email || "No email"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="rounded-full bg-white px-3 py-1 font-semibold text-stone-900">
                  {order.orderStatus.replaceAll("_", " ")}
                </span>
                <span className="rounded-full bg-brand-50 px-3 py-1 font-semibold text-green-800">
                  {formatCurrency(order.totalPrice)}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AdminDashboardPage;
