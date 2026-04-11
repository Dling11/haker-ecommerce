import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

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
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300/80">
          Cart
        </p>
        <h1 className="text-3xl font-black text-white">Your shopping cart</h1>
      </div>

      {cart.items.length === 0 ? (
        <div className="panel p-8">
          <p className="text-white/65">Your cart is empty.</p>
          <Link to="/shop" className="mt-4 inline-block font-semibold text-cyan-300">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-4">
            {cart.items.map((item) => (
              <article
                key={item._id}
                className="grid gap-4 rounded-[10px] border border-white/10 bg-[#1a1f29] p-5 shadow-soft sm:grid-cols-[120px_1fr]"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-28 w-full rounded-2xl object-cover"
                />

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white">{item.name}</h2>
                    <p className="text-sm text-white/55">
                      {formatCurrency(item.price)} each
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      max={item.stock}
                      value={item.quantity}
                      onChange={(event) =>
                        dispatch(
                          updateCartItem({
                            itemId: item._id,
                            quantity: Number(event.target.value),
                          })
                        )
                      }
                      className="w-24 rounded-[10px] border border-white/10 bg-[#10141b] px-3 py-2 text-white"
                    />
                    <button
                      type="button"
                      onClick={() => dispatch(removeCartItem(item._id))}
                      className="rounded-[10px] border border-rose-500/30 px-4 py-2 text-sm font-semibold text-rose-300"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="space-y-4 rounded-[10px] border border-white/10 bg-[#1a1f29] p-6 text-white shadow-soft">
            <h2 className="text-xl font-bold">Summary</h2>
            <div className="flex items-center justify-between text-sm">
              <span>Items subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Estimated shipping</span>
              <span>{subtotal >= 3000 ? "Free" : formatCurrency(150)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-white/10 pt-4 text-base font-semibold">
              <span>Total before checkout</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            <button
              type="button"
              onClick={() => navigate("/shop/checkout")}
              disabled={isLoading}
              className="w-full rounded-[10px] bg-white px-5 py-3 font-semibold text-[#0f141b]"
            >
              Proceed to Checkout
            </button>

            <button
              type="button"
              onClick={() => dispatch(clearCart())}
              className="w-full rounded-[10px] border border-white/10 px-5 py-3 font-semibold text-white"
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
