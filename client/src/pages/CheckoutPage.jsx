import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import StatusMessage from "../components/common/StatusMessage";
import { clearLatestOrder, createOrder } from "../features/orders/orderSlice";
import { formatCurrency } from "../utils/formatCurrency";

function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { isLoading, error, latestOrder } = useSelector((state) => state.orders);

  const [formData, setFormData] = useState({
    fullName: user?.shippingAddress?.fullName || user?.name || "",
    phone: user?.shippingAddress?.phone || user?.phone || "",
    street: user?.shippingAddress?.street || "",
    city: user?.shippingAddress?.city || "",
    state: user?.shippingAddress?.state || "",
    postalCode: user?.shippingAddress?.postalCode || "",
    country: user?.shippingAddress?.country || "Philippines",
    paymentMethod: "cod",
    gcashReference: "",
    notes: "",
  });

  useEffect(() => {
    if (latestOrder) {
      navigate("/shop/orders", { replace: true });
      dispatch(clearLatestOrder());
    }
  }, [dispatch, latestOrder, navigate]);

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const result = await dispatch(
      createOrder({
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        paymentMethod: formData.paymentMethod,
        gcashReference: formData.gcashReference,
        notes: formData.notes,
      })
    );

    if (createOrder.fulfilled.match(result)) {
      toast.success("Order placed successfully.");
    } else if (createOrder.rejected.match(result)) {
      toast.error(result.payload || "Failed to place order.");
    }
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-[10px] border border-violet-100 bg-white p-8 shadow-soft"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-500">
            Checkout
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">Place your order</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Confirm shipping details, choose a payment method, and review everything
            before placing the order.
          </p>
        </div>

        <StatusMessage type="error" message={error} />

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Full name</span>
            <input name="fullName" value={formData.fullName} onChange={handleChange} className="field" required />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Phone</span>
            <input name="phone" value={formData.phone} onChange={handleChange} className="field" required />
          </label>
        </div>

        <label className="space-y-2 block">
          <span className="text-sm font-semibold text-slate-700">Street</span>
          <input name="street" value={formData.street} onChange={handleChange} className="field" required />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">City</span>
            <input name="city" value={formData.city} onChange={handleChange} className="field" required />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Province / State</span>
            <input name="state" value={formData.state} onChange={handleChange} className="field" />
          </label>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Postal code</span>
            <input name="postalCode" value={formData.postalCode} onChange={handleChange} className="field" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Country</span>
            <input name="country" value={formData.country} onChange={handleChange} className="field" />
          </label>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">Payment method</p>
          <label className="flex items-center gap-3 rounded-[10px] border border-violet-100 bg-violet-50/60 px-4 py-3">
            <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === "cod"} onChange={handleChange} />
            <span>Cash on Delivery</span>
          </label>
          <label className="flex items-center gap-3 rounded-[10px] border border-violet-100 bg-violet-50/60 px-4 py-3">
            <input type="radio" name="paymentMethod" value="gcash" checked={formData.paymentMethod === "gcash"} onChange={handleChange} />
            <span>GCash (simulated manual payment)</span>
          </label>
        </div>

        {formData.paymentMethod === "gcash" ? (
          <label className="space-y-2 block">
            <span className="text-sm font-semibold text-slate-700">GCash reference</span>
            <input name="gcashReference" value={formData.gcashReference} onChange={handleChange} className="field" placeholder="Reference number or screenshot id" required />
          </label>
        ) : null}

        <label className="space-y-2 block">
          <span className="text-sm font-semibold text-slate-700">Order notes</span>
          <textarea name="notes" value={formData.notes} onChange={handleChange} rows="4" className="field" placeholder="Optional notes for delivery or payment" />
        </label>

        <button type="submit" disabled={isLoading || cart.items.length === 0} className="w-full rounded-[10px] bg-violet-600 px-5 py-3 font-semibold text-white">
          {isLoading ? "Placing order..." : "Place Order"}
        </button>
      </form>

      <aside className="space-y-6 rounded-[10px] border border-violet-100 bg-[linear-gradient(180deg,#ffffff_0%,#f4efff_100%)] p-6 shadow-soft">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-500">
            Summary
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-900">Order summary</h2>
        </div>
        <div className="mt-5 space-y-4">
          {cart.items.map((item) => (
            <div key={item._id} className="flex items-center justify-between gap-3 rounded-[10px] bg-white p-3 text-sm">
              <span className="text-slate-600">{item.name} x {item.quantity}</span>
              <span className="font-semibold text-slate-900">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-3 border-t border-violet-100 pt-6 text-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span>Items</span>
            <span>{formatCurrency(cart.itemsPrice)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>Shipping</span>
            <span>{cart.itemsPrice >= 3000 ? "Free" : formatCurrency(150)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>Estimated tax</span>
            <span>{formatCurrency((cart.itemsPrice || 0) * 0.02)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-violet-100 pt-4 text-base font-semibold text-slate-900">
            <span>Total</span>
            <span>{formatCurrency((cart.itemsPrice || 0) + ((cart.itemsPrice || 0) >= 3000 ? 0 : 150) + (cart.itemsPrice || 0) * 0.02)}</span>
          </div>
        </div>
      </aside>
    </section>
  );
}

export default CheckoutPage;
