import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { Fragment } from "react";
import { ShoppingBag, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import {
  closeCartDrawer,
  removeCartItem,
  updateCartItem,
} from "../../features/cart/cartSlice";
import { formatCurrency } from "../../utils/formatCurrency";

function CartDrawer() {
  const dispatch = useDispatch();
  const { cart, isDrawerOpen, isLoading } = useSelector((state) => state.cart);

  const handleQuantityChange = async (itemId, quantity) => {
    const result = await dispatch(updateCartItem({ itemId, quantity }));

    if (updateCartItem.fulfilled.match(result)) {
      toast.success("Cart updated.");
    } else {
      toast.error(result.payload || "Failed to update cart.");
    }
  };

  const handleRemove = async (itemId) => {
    const result = await dispatch(removeCartItem(itemId));

    if (removeCartItem.fulfilled.match(result)) {
      toast.success("Item removed from cart.");
    } else {
      toast.error(result.payload || "Failed to remove item.");
    }
  };

  return (
    <Transition show={isDrawerOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => dispatch(closeCartDrawer())}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/35" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <TransitionChild
                as={Fragment}
                enter="transform transition ease-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in duration-200"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <DialogPanel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-white shadow-2xl">
                    <div className="flex items-center justify-between border-b border-violet-100 px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-[10px] bg-violet-100 p-2 text-violet-700">
                          <ShoppingBag size={18} />
                        </div>
                        <div>
                          <h2 className="text-lg font-black text-slate-900">Your Cart</h2>
                          <p className="text-sm text-slate-500">
                            {cart.items.length} item(s)
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => dispatch(closeCartDrawer())}
                        className="rounded-[10px] border border-slate-200 p-2 text-slate-500"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-5 py-5">
                      {cart.items.length === 0 ? (
                        <div className="rounded-[10px] bg-slate-50 p-6 text-center">
                          <p className="text-sm text-slate-500">Your cart is empty.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {cart.items.map((item) => (
                            <article
                              key={item._id}
                              className="grid grid-cols-[72px_1fr] gap-4 rounded-[10px] border border-slate-200 bg-white p-3"
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-[72px] w-[72px] rounded-[10px] object-cover"
                              />
                              <div className="space-y-3">
                                <div>
                                  <h3 className="text-sm font-semibold text-slate-900">
                                    {item.name}
                                  </h3>
                                  <p className="text-sm text-slate-500">
                                    {formatCurrency(item.price)}
                                  </p>
                                </div>

                                <div className="flex items-center justify-between gap-3">
                                  <input
                                    type="number"
                                    min="1"
                                    max={item.stock}
                                    value={item.quantity}
                                    onChange={(event) =>
                                      handleQuantityChange(
                                        item._id,
                                        Number(event.target.value)
                                      )
                                    }
                                    className="w-20 rounded-[10px] border border-slate-200 px-3 py-2 text-sm"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemove(item._id)}
                                    className="text-sm font-semibold text-rose-600"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="border-t border-violet-100 bg-violet-50/70 px-5 py-5">
                      <div className="mb-4 flex items-center justify-between text-sm text-slate-600">
                        <span>Subtotal</span>
                        <span className="text-base font-semibold text-slate-900">
                          {formatCurrency(cart.itemsPrice)}
                        </span>
                      </div>

                      <div className="flex gap-3">
                        <Link
                          to="/shop/cart"
                          onClick={() => dispatch(closeCartDrawer())}
                          className="flex-1 rounded-[10px] border border-violet-200 bg-white px-4 py-3 text-center text-sm font-semibold text-violet-700"
                        >
                          View Cart
                        </Link>
                        <Link
                          to="/shop/checkout"
                          onClick={() => dispatch(closeCartDrawer())}
                          className="flex-1 rounded-[10px] bg-violet-600 px-4 py-3 text-center text-sm font-semibold text-white"
                        >
                          {isLoading ? "Working..." : "Checkout"}
                        </Link>
                      </div>
                    </div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default CartDrawer;
