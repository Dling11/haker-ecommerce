import { Eye, LoaderCircle, RotateCcw, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import AppModal from "../components/common/AppModal";
import ConfirmModal from "../components/common/ConfirmModal";
import StatusMessage from "../components/common/StatusMessage";
import {
  cancelMyOrder,
  continuePaymongoPayment,
  fetchMyOrders,
} from "../features/orders/orderSlice";
import { addCartItem, openCartDrawer } from "../features/cart/cartSlice";
import { getColorOptionLabel } from "../utils/colorOptions";
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
  const { isLoading: isCartLoading } = useSelector((state) => state.cart);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isReordering, setIsReordering] = useState(false);
  const [pendingCancelOrder, setPendingCancelOrder] = useState(null);
  const [isCancellingOrder, setIsCancellingOrder] = useState(false);
  const [payingOrderId, setPayingOrderId] = useState(null);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const reorderableItems = useMemo(
    () => selectedOrder?.orderItems?.filter((item) => item.isAvailable) || [],
    [selectedOrder]
  );
  const canCancelOrder = (order) =>
    ["pending", "need_payment"].includes(order.orderStatus);
  const canContinuePayment = (order) =>
    order.paymentMethod === "gcash" &&
    order.paymentStatus !== "paid" &&
    order.orderStatus === "need_payment";

  const handleReorder = async (order) => {
    const availableItems = order.orderItems.filter((item) => item.isAvailable);

    if (availableItems.length === 0) {
      toast.error("None of the items in this order are currently available.");
      return;
    }

    setIsReordering(true);
    let successfulAdds = 0;

    for (const item of availableItems) {
      const result = await dispatch(
        addCartItem({
          productId: item.product,
          quantity: Math.max(1, Math.min(item.quantity, item.availableQuantity || item.quantity)),
          color: item.color || "",
          size: item.size || "",
        })
      );

      if (addCartItem.fulfilled.match(result)) {
        successfulAdds += 1;
      }
    }

    if (successfulAdds > 0) {
      toast.success(
        successfulAdds === availableItems.length
          ? "Available items were added to your cart."
          : "Some available items were added to your cart."
      );
      dispatch(openCartDrawer());
    } else {
      toast.error("We could not add any items from this order to your cart.");
    }

    setIsReordering(false);
  };

  const handleCancelOrder = async () => {
    if (!pendingCancelOrder) {
      return;
    }

    setIsCancellingOrder(true);
    const result = await dispatch(cancelMyOrder(pendingCancelOrder._id));

    if (cancelMyOrder.fulfilled.match(result)) {
      toast.success("Order cancelled successfully.");
      setPendingCancelOrder(null);
      if (selectedOrder?._id === result.payload._id) {
        setSelectedOrder(result.payload);
      }
    } else {
      toast.error(result.payload || "Failed to cancel order.");
    }

    setIsCancellingOrder(false);
  };

  const handleContinuePayment = async (order) => {
    setPayingOrderId(order._id);
    const result = await dispatch(continuePaymongoPayment(order._id));

    if (continuePaymongoPayment.fulfilled.match(result) && result.payload.checkoutUrl) {
      window.location.href = result.payload.checkoutUrl;
      return;
    }

    toast.error(result.payload || "We could not continue the GCash payment.");
    setPayingOrderId(null);
  };

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
            <div className="mt-4 flex flex-col gap-3 border-t border-violet-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm">
                <span className="text-slate-500">Order total</span>
                <span className="ml-3 font-semibold text-slate-900">
                  {formatCurrency(order.totalPrice)}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(order)}
                  className="inline-flex items-center gap-2 rounded-[10px] border border-violet-200 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
                >
                  <Eye size={16} />
                  View details
                </button>
                {order.canReorder ? (
                  <button
                    type="button"
                    onClick={() => handleReorder(order)}
                    disabled={isReordering || isCartLoading}
                    className="inline-flex items-center gap-2 rounded-[10px] bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {isReordering ? <LoaderCircle size={16} className="animate-spin" /> : <RotateCcw size={16} />}
                    {isReordering ? "Adding..." : "Order Again"}
                  </button>
                ) : null}
                {canContinuePayment(order) ? (
                  <button
                    type="button"
                    onClick={() => handleContinuePayment(order)}
                    disabled={payingOrderId === order._id}
                    className="inline-flex items-center gap-2 rounded-[10px] border border-cyan-200 px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                  >
                    {payingOrderId === order._id ? (
                      <LoaderCircle size={16} className="animate-spin" />
                    ) : (
                      <RotateCcw size={16} />
                    )}
                    {payingOrderId === order._id ? "Redirecting..." : "Continue GCash"}
                  </button>
                ) : null}
                {canCancelOrder(order) ? (
                  <button
                    type="button"
                    onClick={() => setPendingCancelOrder(order)}
                    className="inline-flex items-center gap-2 rounded-[10px] border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                  >
                    <XCircle size={16} />
                    Cancel order
                  </button>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>

      <AppModal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={
          selectedOrder
            ? `Order #${selectedOrder._id.slice(-6).toUpperCase()}`
            : "Order details"
        }
        description="Review the items, shipping details, and current reorder availability for this order."
        variant="light"
        width="max-w-4xl"
      >
        {selectedOrder ? (
          <div className="space-y-5">
            <div className="grid gap-4 rounded-[10px] border border-violet-100 bg-violet-50/70 p-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Ordered</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Status</p>
                <p className="mt-1 font-semibold capitalize text-slate-900">
                  {selectedOrder.orderStatus.replaceAll("_", " ")}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Payment</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {selectedOrder.paymentMethod === "cod" ? "Cash on Delivery" : "GCash"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {formatCurrency(selectedOrder.totalPrice)}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900">Items in this order</h3>
              <div className="space-y-3">
                {selectedOrder.orderItems.map((item, index) => (
                  <article
                    key={`${selectedOrder._id}-${item.product}-${index}`}
                    className="grid gap-4 rounded-[10px] border border-slate-200 bg-white p-4 sm:grid-cols-[72px_1fr_auto]"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-[72px] w-[72px] rounded-[10px] object-cover"
                    />
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.quantity} x {formatCurrency(item.price)}
                      </p>
                      {item.color || item.size ? (
                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-500">
                          {[item.color ? getColorOptionLabel(item.color) : "", item.size]
                            .filter(Boolean)
                            .join(" / ")}
                        </p>
                      ) : null}
                      <p className="mt-2 text-sm text-slate-500">
                        Current availability:{" "}
                        <span className={item.isAvailable ? "font-semibold text-emerald-700" : "font-semibold text-rose-600"}>
                          {item.isAvailable
                            ? `${item.availableQuantity} in stock`
                            : "Currently unavailable"}
                        </span>
                      </p>
                    </div>
                    <div className="flex flex-col items-start gap-2 sm:items-end">
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                      <span
                        className={`rounded-[8px] px-3 py-1 text-xs font-semibold ${
                          item.isAvailable
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {item.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-base font-bold text-slate-900">Shipping details</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {selectedOrder.shippingAddress?.fullName}
                <br />
                {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city}
                {selectedOrder.shippingAddress?.state ? `, ${selectedOrder.shippingAddress.state}` : ""}
                {selectedOrder.shippingAddress?.postalCode ? ` ${selectedOrder.shippingAddress.postalCode}` : ""}
                <br />
                {selectedOrder.shippingAddress?.country}
                <br />
                {selectedOrder.shippingAddress?.phone}
              </p>
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              {canCancelOrder(selectedOrder) ? (
                <button
                  type="button"
                  onClick={() => setPendingCancelOrder(selectedOrder)}
                  className="inline-flex items-center gap-2 rounded-[10px] border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                >
                  <XCircle size={16} />
                  Cancel this order
                </button>
              ) : null}
              {reorderableItems.length > 0 ? (
                <button
                  type="button"
                  onClick={() => handleReorder(selectedOrder)}
                  disabled={isReordering || isCartLoading}
                  className="inline-flex items-center gap-2 rounded-[10px] bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isReordering ? <LoaderCircle size={16} className="animate-spin" /> : <RotateCcw size={16} />}
                  {isReordering ? "Adding..." : "Order available items again"}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="inline-flex items-center gap-2 rounded-[10px] border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </AppModal>

      <ConfirmModal
        isOpen={Boolean(pendingCancelOrder)}
        onClose={() => setPendingCancelOrder(null)}
        onConfirm={handleCancelOrder}
        title="Cancel this order?"
        description={`This will cancel order #${
          pendingCancelOrder?._id?.slice(-6).toUpperCase() || ""
        } and restore the available stock.`}
        confirmLabel="Cancel order"
        loadingLabel="Cancelling..."
        isLoading={isCancellingOrder}
      />
    </section>
  );
}

export default OrdersPage;
