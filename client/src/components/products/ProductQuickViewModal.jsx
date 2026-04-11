import { Eye, Minus, Plus, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import AppModal from "../common/AppModal";
import { addCartItem, openCartDrawer } from "../../features/cart/cartSlice";
import { formatCurrency } from "../../utils/formatCurrency";

function ProductQuickViewModal({ product, isOpen, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { isLoading } = useSelector((state) => state.cart);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
    }
  }, [isOpen, product._id]);

  const handleAddToCart = async () => {
    if (!user) {
      onClose();
      navigate("/login");
      return;
    }

    const result = await dispatch(addCartItem({ productId: product._id, quantity }));

    if (addCartItem.fulfilled.match(result)) {
      toast.success(
        `${quantity} ${product.name}${quantity > 1 ? " items" : ""} added to cart.`
      );
      onClose();
      dispatch(openCartDrawer());
    } else {
      toast.error(result.payload || "Failed to add item to cart.");
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={product.name}
      // description="Quick product preview for faster shopping decisions."
      width="max-w-4xl"
      variant="light"
    >
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex min-h-[320px] items-center justify-center rounded-[10px] border border-violet-100 bg-[linear-gradient(180deg,#faf7ff_0%,#f8fbff_100%)] p-6">
          <img
            src={product.images?.[0]?.url}
            alt={product.name}
            className="max-h-[360px] w-full object-contain"
          />
        </div>

        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-[8px] bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-700">
              {product.category}
            </span>
            <span className="rounded-[8px] bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {product.stock > 0 ? `${product.stock} in stock` : "Sold out"}
            </span>
          </div>

          <div>
            <div className="flex items-end gap-3">
              <p className="text-3xl font-black text-slate-900">
                {formatCurrency(product.price)}
              </p>
              {product.comparePrice > product.price ? (
                <p className="text-base font-medium text-slate-400 line-through">
                  {formatCurrency(product.comparePrice)}
                </p>
              ) : null}
            </div>

            {product.brand ? (
              <p className="mt-2 text-sm font-medium text-slate-500">
                Brand: {product.brand}
              </p>
            ) : null}
          </div>

          <p className="text-sm leading-7 text-slate-600">{product.description}</p>

          <div className="grid gap-3 rounded-[10px] border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Quick View
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                A larger preview helps users compare price and description before adding.
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Quantity
                </p>
                <div className="mt-2 inline-flex items-center overflow-hidden rounded-[10px] border border-slate-200 bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    disabled={quantity <= 1}
                    className="inline-flex h-11 w-11 items-center justify-center text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                  >
                    <Minus size={16} />
                  </button>
                  <div className="flex h-11 min-w-[56px] items-center justify-center border-x border-slate-200 px-4 text-sm font-semibold text-slate-900">
                    {quantity}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((current) => Math.min(product.stock || 1, current + 1))
                    }
                    disabled={product.stock === 0 || quantity >= product.stock}
                    className="inline-flex h-11 w-11 items-center justify-center text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock === 0 || isLoading}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-[10px] bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <ShoppingCart size={16} />
                {product.stock === 0 ? "Sold Out" : "Add to Cart"}
              </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppModal>
  );
}

export default ProductQuickViewModal;
