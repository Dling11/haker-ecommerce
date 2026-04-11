import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import StatusMessage from "../components/common/StatusMessage";
import { fetchMyOrders } from "../features/orders/orderSlice";
import { formatCurrency } from "../utils/formatCurrency";

const orderToneMap = {
  pending: "bg-amber-100 text-amber-800",
  need_payment: "bg-rose-100 text-rose-700",
  processing: "bg-sky-100 text-sky-700",
  out_for_delivery: "bg-violet-100 text-violet-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-slate-200 text-slate-700",
};

const paymentToneMap = {
  cod: "bg-violet-100 text-violet-700",
  gcash: "bg-cyan-100 text-cyan-700",
};

function OrdersPage() {
  const dispatch = useDispatch();
  const { items, isLoading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-500">Orders</p>
        <h1 className="text-3xl font-black text-slate-900">Your order history</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-500">
          Track progress, payment method, and overall order status with clearer visual
          indicators.
        </p>
      </div>

      <StatusMessage type="error" message={error} />
      {isLoading ? <p className="text-slate-500">Loading orders...</p> : null}

      {items.length === 0 && !isLoading ? (
        <div className="rounded-[10px] border border-violet-100 bg-white p-8 text-slate-500 shadow-soft">
          You have not placed any orders yet.
        </div>
      ) : null}

      <div className="space-y-4">
        {items.map((order) => (
          <article key={order._id} className="rounded-[10px] border border-violet-100 bg-white p-6 shadow-soft">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Order #{order._id.slice(-6).toUpperCase()}
                </h2>
                <p className="text-sm text-slate-500">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className={`rounded-[8px] px-3 py-1 font-semibold ${orderToneMap[order.orderStatus] || "bg-slate-100 text-slate-700"}`}>
                  {order.orderStatus.replaceAll("_", " ")}
                </span>
                <span className={`rounded-[8px] px-3 py-1 font-semibold ${paymentToneMap[order.paymentMethod] || "bg-slate-100 text-slate-700"}`}>
                  {order.paymentMethod.toUpperCase()}
                </span>
                <span className={`rounded-[8px] px-3 py-1 font-semibold ${order.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-700" : order.paymentStatus === "failed" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-800"}`}>
                  Payment: {order.paymentStatus}
                </span>
              </div>
            </div>
            <div className="mt-5 grid gap-3 rounded-[10px] bg-violet-50/70 p-4 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Items</p>
                <p className="mt-1 font-semibold text-slate-900">{order.orderItems.length} item(s)</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Payment Type</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {order.paymentMethod === "cod" ? "Cash on Delivery" : "GCash"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {formatCurrency(order.totalPrice)}
                </p>
              </div>
            </div>
            <div className="mt-4 text-sm text-slate-500">
              Shipping to: {order.shippingAddress?.fullName}, {order.shippingAddress?.city}
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-slate-500">Order total</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(order.totalPrice)}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default OrdersPage;
