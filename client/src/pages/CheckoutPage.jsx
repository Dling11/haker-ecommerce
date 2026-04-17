import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import StatusMessage from "../components/common/StatusMessage";
import {
  clearLatestOrder,
  confirmPaymongoOrder,
  createOrder,
} from "../features/orders/orderSlice";
import { fetchCurrentUser } from "../features/auth/authSlice";
import api from "../services/api";
import { getColorOptionLabel } from "../utils/colorOptions";
import { formatCurrency } from "../utils/formatCurrency";

const checkoutFieldClassName =
  "w-full rounded-[10px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100";

function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { cart } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { isLoading, error } = useSelector((state) => state.orders);
  const { settings } = useSelector((state) => state.site);

  const [formData, setFormData] = useState({
    fullName: user?.shippingAddress?.fullName || user?.name || "",
    phone: user?.shippingAddress?.phone || user?.phone || "",
    street: user?.shippingAddress?.street || "",
    city: user?.shippingAddress?.city || "",
    state: user?.shippingAddress?.state || "",
    postalCode: user?.shippingAddress?.postalCode || "",
    country: user?.shippingAddress?.country || "Philippines",
    paymentMethod: "cod",
    notes: "",
    couponCode: "",
    pointsToRedeem: 0,
  });
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const isCheckoutDisabled = settings?.allowCheckout === false;
  const isMaintenanceMode = settings?.maintenanceMode === true;
  const isCodDisabled = settings?.allowCashOnDelivery === false;
  const isGCashDisabled = settings?.allowGCash === false;

  const paymentState = searchParams.get("payment");
  const orderId = searchParams.get("orderId");
  const checkoutSessionId = searchParams.get("checkout_session_id");

  useEffect(() => {
    if (!paymentState || !orderId || paymentState !== "success") {
      return;
    }

    const verifyPayment = async () => {
      const result = await dispatch(
        confirmPaymongoOrder({
          orderId,
          checkoutSessionId,
        })
      );

      if (confirmPaymongoOrder.fulfilled.match(result)) {
        toast.success("GCash payment confirmed.");
        dispatch(clearLatestOrder());
        dispatch(fetchCurrentUser());
        setSearchParams({});
        navigate("/shop/orders", { replace: true });
      } else {
        toast.error(result.payload || "We could not confirm your GCash payment yet.");
      }
    };

    verifyPayment();
  }, [checkoutSessionId, dispatch, navigate, orderId, paymentState, setSearchParams]);

  useEffect(() => {
    if (paymentState === "cancelled") {
      toast("GCash checkout was cancelled. You can try again from your pending order.");
      setSearchParams({});
      navigate("/shop/orders", { replace: true });
    }
  }, [navigate, paymentState, setSearchParams]);

  useEffect(() => {
    if (formData.paymentMethod === "cod" && isCodDisabled && !isGCashDisabled) {
      setFormData((current) => ({
        ...current,
        paymentMethod: "gcash",
      }));
    }

    if (formData.paymentMethod === "gcash" && isGCashDisabled && !isCodDisabled) {
      setFormData((current) => ({
        ...current,
        paymentMethod: "cod",
      }));
    }
  }, [formData.paymentMethod, isCodDisabled, isGCashDisabled]);

  const shippingPrice =
    Math.max((cart.itemsPrice || 0) - couponDiscount - (formData.pointsToRedeem || 0), 0) >= 3000
      ? 0
      : 150;
  const pointsDiscount =
    settings?.allowPoints === false
      ? 0
      : Math.min(
          Number(formData.pointsToRedeem || 0) * Number(settings?.pointRedemptionValue || 1),
          Math.max((cart.itemsPrice || 0) - couponDiscount, 0)
        );
  const discountedItemsPrice = Math.max((cart.itemsPrice || 0) - couponDiscount - pointsDiscount, 0);
  const taxPrice = discountedItemsPrice * 0.02;
  const orderTotal = discountedItemsPrice + shippingPrice + taxPrice;
  const estimatedPoints =
    settings?.allowPoints === false
      ? 0
      : Math.floor(discountedItemsPrice / 100) * Number(settings?.pointsEarnRate || 0);

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleApplyCoupon = async () => {
    if (!formData.couponCode.trim()) {
      toast.error("Enter a coupon code first.");
      return;
    }

    try {
      setIsApplyingCoupon(true);
      const { data } = await api.get("/coupons/validate", {
        params: {
          code: formData.couponCode,
          subtotal: cart.itemsPrice || 0,
        },
      });

      setCouponDiscount(data.discount || 0);
      setCouponMessage(`${data.coupon.code} applied successfully.`);
      toast.success("Coupon applied.");
    } catch (requestError) {
      setCouponDiscount(0);
      setCouponMessage("");
      toast.error(requestError.response?.data?.message || "Failed to apply coupon.");
    } finally {
      setIsApplyingCoupon(false);
    }
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
        notes: formData.notes,
        couponCode: formData.couponCode,
        pointsToRedeem: Number(formData.pointsToRedeem || 0),
      })
    );

    if (createOrder.fulfilled.match(result)) {
      if (result.payload.requiresPaymentRedirect && result.payload.checkoutUrl) {
        window.location.href = result.payload.checkoutUrl;
        return;
      }

      toast.success("Order placed successfully.");
      dispatch(clearLatestOrder());
      dispatch(fetchCurrentUser());
      navigate("/shop/orders", { replace: true });
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
        {isCheckoutDisabled ? (
          <StatusMessage type="info" message="Checkout is currently unavailable." />
        ) : null}
        {isMaintenanceMode ? (
          <StatusMessage type="info" message={settings.maintenanceMessage} />
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Full name</span>
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={checkoutFieldClassName}
              required
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Phone</span>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={checkoutFieldClassName}
              required
            />
          </label>
        </div>

        <label className="space-y-2 block">
          <span className="text-sm font-semibold text-slate-700">Street</span>
          <input
            name="street"
            value={formData.street}
            onChange={handleChange}
            className={checkoutFieldClassName}
            required
            placeholder="Enter street address"
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">City</span>
            <input
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={checkoutFieldClassName}
              required
              placeholder="Enter city"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Province / State</span>
            <input
              name="state"
              value={formData.state}
              onChange={handleChange}
              className={checkoutFieldClassName}
              placeholder="Enter province or state"
            />
          </label>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Postal code</span>
            <input
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              className={checkoutFieldClassName}
              placeholder="Enter postal code"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Country</span>
            <input
              name="country"
              value={formData.country}
              onChange={handleChange}
              className={checkoutFieldClassName}
              placeholder="Enter country"
            />
          </label>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">Payment method</p>
          <label className="flex items-center gap-3 rounded-[10px] border border-violet-100 bg-violet-50/60 px-4 py-3">
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              checked={formData.paymentMethod === "cod"}
              onChange={handleChange}
              disabled={isCodDisabled}
            />
            <span>Cash on Delivery</span>
          </label>
          <label className="flex items-center gap-3 rounded-[10px] border border-violet-100 bg-violet-50/60 px-4 py-3">
            <input
              type="radio"
              name="paymentMethod"
              value="gcash"
              checked={formData.paymentMethod === "gcash"}
              onChange={handleChange}
              disabled={isGCashDisabled}
            />
            <span>GCash via PayMongo</span>
          </label>
        </div>

        {formData.paymentMethod === "gcash" ? (
          <div className="rounded-[10px] border border-violet-100 bg-violet-50/60 px-4 py-4 text-sm text-slate-600">
            You will be redirected to PayMongo to complete your GCash payment securely.
            After successful payment, we will confirm the transaction and move your order
            into processing automatically.
          </div>
        ) : null}

        <label className="space-y-2 block">
          <span className="text-sm font-semibold text-slate-700">Order notes</span>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            className={checkoutFieldClassName}
            placeholder="Optional notes for delivery or payment"
          />
        </label>

        {settings?.allowCoupons !== false ? (
          <div className="space-y-3 rounded-[10px] border border-violet-100 bg-violet-50/60 p-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={formData.couponCode}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, couponCode: event.target.value.toUpperCase() }))
                }
                className={checkoutFieldClassName}
                placeholder="Coupon code"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={isApplyingCoupon || !formData.couponCode.trim()}
                className="rounded-[10px] bg-white px-4 py-3 text-sm font-semibold text-violet-700 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                {isApplyingCoupon ? "Applying..." : "Apply"}
              </button>
            </div>
            {couponMessage ? <p className="text-sm text-emerald-700">{couponMessage}</p> : null}
          </div>
        ) : null}

        {settings?.allowPoints !== false ? (
          <div className="space-y-3 rounded-[10px] border border-violet-100 bg-violet-50/60 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-700">Redeem points</p>
                <p className="text-sm text-slate-500">
                  Available: {user?.loyaltyPoints || 0} points
                </p>
              </div>
              <p className="text-sm font-semibold text-violet-700">
                1 point = {formatCurrency(Number(settings?.pointRedemptionValue || 1))}
              </p>
            </div>
            <input
              type="number"
              min="0"
              max={user?.loyaltyPoints || 0}
              value={formData.pointsToRedeem}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  pointsToRedeem: Math.max(
                    0,
                    Math.min(
                      Number(event.target.value || 0),
                      Number(user?.loyaltyPoints || 0),
                      maxRedeemablePoints
                    )
                  ),
                }))
              }
              className={checkoutFieldClassName}
            />
            <p className="text-sm text-slate-500">
              Max usable now: {Math.min(Number(user?.loyaltyPoints || 0), maxRedeemablePoints)} points
            </p>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={
            isLoading ||
            (paymentState === "success" && Boolean(orderId)) ||
            cart.items.length === 0 ||
            isCheckoutDisabled ||
            isMaintenanceMode ||
            (formData.paymentMethod === "cod" && isCodDisabled) ||
            (formData.paymentMethod === "gcash" && isGCashDisabled)
          }
          className="w-full rounded-[10px] bg-violet-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isLoading
            ? paymentState === "success"
              ? "Confirming payment..."
              : "Placing order..."
            : formData.paymentMethod === "gcash"
              ? "Continue to GCash"
              : "Place Order"}
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
              <div className="text-slate-600">
                <p>
                  {item.name} x {item.quantity}
                </p>
                {item.color || item.size ? (
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-500">
                    {[item.color ? getColorOptionLabel(item.color) : "", item.size]
                      .filter(Boolean)
                      .join(" / ")}
                  </p>
                ) : null}
              </div>
              <span className="font-semibold text-slate-900">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-3 border-t border-violet-100 pt-6 text-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span>Items</span>
            <span>{formatCurrency(cart.itemsPrice)}</span>
          </div>
          {couponDiscount > 0 ? (
            <div className="flex items-center justify-between text-emerald-600">
              <span>Coupon discount</span>
              <span>-{formatCurrency(couponDiscount)}</span>
            </div>
          ) : null}
          {pointsDiscount > 0 ? (
            <div className="flex items-center justify-between text-emerald-600">
              <span>Points discount</span>
              <span>-{formatCurrency(pointsDiscount)}</span>
            </div>
          ) : null}
          <div className="flex items-center justify-between text-slate-600">
            <span>Shipping</span>
            <span>{shippingPrice === 0 ? "Free" : formatCurrency(shippingPrice)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>Estimated tax</span>
            <span>{formatCurrency(taxPrice)}</span>
          </div>
          {settings?.allowPoints !== false ? (
            <div className="flex items-center justify-between text-slate-600">
              <span>Points after this order</span>
              <span>+{estimatedPoints}</span>
            </div>
          ) : null}
          <div className="flex items-center justify-between border-t border-violet-100 pt-4 text-base font-semibold text-slate-900">
            <span>Total</span>
            <span>{formatCurrency(orderTotal)}</span>
          </div>
        </div>
      </aside>
    </section>
  );
}

export default CheckoutPage;
  const maxRedeemablePoints =
    settings?.allowPoints === false
      ? 0
      : Math.floor(
          Math.max((cart.itemsPrice || 0) - couponDiscount, 0) /
            Math.max(Number(settings?.pointRedemptionValue || 1), 1)
        );
