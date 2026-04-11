import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

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

    await dispatch(
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
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-[2rem] bg-white/90 p-8 shadow-soft"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-700">
            Checkout
          </p>
          <h1 className="mt-2 text-3xl font-black text-brand-900">Place your order</h1>
        </div>

        <StatusMessage type="error" message={error} />

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Full name</span>
            <input name="fullName" value={formData.fullName} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3" required />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Phone</span>
            <input name="phone" value={formData.phone} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3" required />
          </label>
        </div>

        <label className="space-y-2 block">
          <span className="text-sm font-semibold text-slate-700">Street</span>
          <input name="street" value={formData.street} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3" required />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">City</span>
            <input name="city" value={formData.city} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3" required />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Province / State</span>
            <input name="state" value={formData.state} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
          </label>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Postal code</span>
            <input name="postalCode" value={formData.postalCode} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Country</span>
            <input name="country" value={formData.country} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
          </label>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">Payment method</p>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
            <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === "cod"} onChange={handleChange} />
            <span>Cash on Delivery</span>
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
            <input type="radio" name="paymentMethod" value="gcash" checked={formData.paymentMethod === "gcash"} onChange={handleChange} />
            <span>GCash (simulated manual payment)</span>
          </label>
        </div>

        {formData.paymentMethod === "gcash" ? (
          <label className="space-y-2 block">
            <span className="text-sm font-semibold text-slate-700">GCash reference</span>
            <input name="gcashReference" value={formData.gcashReference} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Reference number or screenshot id" required />
          </label>
        ) : null}

        <label className="space-y-2 block">
          <span className="text-sm font-semibold text-slate-700">Order notes</span>
          <textarea name="notes" value={formData.notes} onChange={handleChange} rows="4" className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Optional notes for delivery or payment" />
        </label>

        <button type="submit" disabled={isLoading || cart.items.length === 0} className="w-full rounded-2xl bg-brand-900 px-5 py-3 font-semibold text-white">
          {isLoading ? "Placing order..." : "Place Order"}
        </button>
      </form>

      <aside className="rounded-[2rem] bg-brand-900 p-6 text-white shadow-soft">
        <h2 className="text-xl font-bold">Order summary</h2>
        <div className="mt-5 space-y-4">
          {cart.items.map((item) => (
            <div key={item._id} className="flex items-center justify-between gap-3 text-sm">
              <span>{item.name} x {item.quantity}</span>
              <span>{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-3 border-t border-white/10 pt-6 text-sm">
          <div className="flex items-center justify-between">
            <span>Items</span>
            <span>{formatCurrency(cart.itemsPrice)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Shipping</span>
            <span>{cart.itemsPrice >= 3000 ? "Free" : formatCurrency(150)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Estimated tax</span>
            <span>{formatCurrency((cart.itemsPrice || 0) * 0.02)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-white/10 pt-4 text-base font-semibold">
            <span>Total</span>
            <span>{formatCurrency((cart.itemsPrice || 0) + ((cart.itemsPrice || 0) >= 3000 ? 0 : 150) + (cart.itemsPrice || 0) * 0.02)}</span>
          </div>
        </div>
      </aside>
    </section>
  );
}

export default CheckoutPage;
