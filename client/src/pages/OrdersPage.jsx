import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import StatusMessage from "../components/common/StatusMessage";
import { fetchMyOrders } from "../features/orders/orderSlice";
import { formatCurrency } from "../utils/formatCurrency";

function OrdersPage() {
  const dispatch = useDispatch();
  const { items, isLoading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-700">Orders</p>
        <h1 className="text-3xl font-black text-brand-900">Your order history</h1>
      </div>

      <StatusMessage type="error" message={error} />
      {isLoading ? <p className="text-slate-600">Loading orders...</p> : null}

      {items.length === 0 && !isLoading ? (
        <div className="rounded-[2rem] bg-white/90 p-8 text-slate-600 shadow-soft">
          You have not placed any orders yet.
        </div>
      ) : null}

      <div className="space-y-4">
        {items.map((order) => (
          <article key={order._id} className="rounded-[2rem] bg-white/90 p-6 shadow-soft">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-brand-900">
                  Order #{order._id.slice(-6).toUpperCase()}
                </h2>
                <p className="text-sm text-slate-500">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                  {order.orderStatus}
                </span>
                <span className="rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-700">
                  {order.paymentMethod.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between text-sm">
              <span>{order.orderItems.length} item(s)</span>
              <span className="font-semibold text-brand-900">
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
