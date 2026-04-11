import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { clearCart, removeCartItem, updateCartItem } from "../features/cart/cartSlice";
import { formatCurrency } from "../utils/formatCurrency";

function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, isLoading } = useSelector((state) => state.cart);

  const subtotal = cart.itemsPrice || 0;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-500">
          Cart
        </p>
        <h1 className="text-3xl font-black text-slate-900">Your shopping cart</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-500">
          Review your selected items, update quantities, and move to checkout with a
          cleaner purchase flow.
        </p>
      </div>

      {cart.items.length === 0 ? (
        <div className="rounded-[10px] border border-violet-100 bg-white p-8 shadow-soft">
          <p className="text-slate-500">Your cart is empty.</p>
          <Link to="/shop" className="mt-4 inline-block font-semibold text-violet-700">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-4">
            {cart.items.map((item) => (
              <article
                key={item._id}
                className="grid gap-4 rounded-[10px] border border-violet-100 bg-white p-5 shadow-soft sm:grid-cols-[120px_1fr]"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-28 w-full rounded-2xl object-cover"
                />

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{item.name}</h2>
                    <p className="text-sm text-slate-500">
                      {formatCurrency(item.price)} each
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      max={item.stock}
                      value={item.quantity}
                      onChange={async (event) => {
                        const result = await dispatch(
                          updateCartItem({
                            itemId: item._id,
                            quantity: Number(event.target.value),
                          })
                        );

                        if (updateCartItem.fulfilled.match(result)) {
                          toast.success("Cart updated.");
                        } else {
                          toast.error(result.payload || "Failed to update cart.");
                        }
                      }}
                      className="w-24 rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        const result = await dispatch(removeCartItem(item._id));

                        if (removeCartItem.fulfilled.match(result)) {
                          toast.success("Item removed from cart.");
                        } else {
                          toast.error(result.payload || "Failed to remove item.");
                        }
                      }}
                      className="rounded-[10px] border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="space-y-4 rounded-[10px] border border-violet-100 bg-[linear-gradient(180deg,#ffffff_0%,#f6f1ff_100%)] p-6 text-slate-900 shadow-soft">
            <h2 className="text-xl font-bold">Summary</h2>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Items subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Estimated shipping</span>
              <span>{subtotal >= 3000 ? "Free" : formatCurrency(150)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-violet-100 pt-4 text-base font-semibold">
              <span>Total before checkout</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            <button
              type="button"
              onClick={() => navigate("/shop/checkout")}
              disabled={isLoading}
              className="w-full rounded-[10px] bg-violet-600 px-5 py-3 font-semibold text-white"
            >
              Proceed to Checkout
            </button>

            <button
              type="button"
              onClick={async () => {
                const result = await dispatch(clearCart());

                if (clearCart.fulfilled.match(result)) {
                  toast.success("Cart cleared.");
                } else {
                  toast.error(result.payload || "Failed to clear cart.");
                }
              }}
              className="w-full rounded-[10px] border border-violet-200 px-5 py-3 font-semibold text-violet-700"
            >
              Clear Cart
            </button>
          </aside>
        </div>
      )}
    </section>
  );
}

export default CartPage;
