import { Eye, Heart, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { addCartItem, openCartDrawer } from "../../features/cart/cartSlice";
import { addWishlistItem, removeWishlistItem } from "../../features/wishlist/wishlistSlice";
import { formatCurrency } from "../../utils/formatCurrency";
import ProductQuickViewModal from "./ProductQuickViewModal";

function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { isLoading } = useSelector((state) => state.cart);
  const { items: wishlistItems, isLoading: isWishlistLoading } = useSelector(
    (state) => state.wishlist
  );
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const requiresVariantSelection =
    (product.colors?.length || 0) > 0 || (product.sizes?.length || 0) > 0;
  const isWishlisted = wishlistItems.some((item) => item._id === product._id);

  const handleAddToCart = async (event) => {
    if (event) {
      event.stopPropagation();
    }

    if (!user) {
      navigate("/login");
      return;
    }

    if (requiresVariantSelection) {
      setIsQuickViewOpen(true);
      return;
    }

    const result = await dispatch(addCartItem({ productId: product._id, quantity: 1 }));

    if (addCartItem.fulfilled.match(result)) {
      toast.success(`${product.name} added to cart.`);
      dispatch(openCartDrawer());
    } else if (addCartItem.rejected.match(result)) {
      toast.error(result.payload || "Failed to add item to cart.");
    }
  };

  const handleWishlistToggle = async (event) => {
    event.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    const result = isWishlisted
      ? await dispatch(removeWishlistItem(product._id))
      : await dispatch(addWishlistItem(product._id));

    if (addWishlistItem.fulfilled.match(result) || removeWishlistItem.fulfilled.match(result)) {
      toast.success(isWishlisted ? "Removed from wishlist." : "Saved to wishlist.");
    } else {
      toast.error(result.payload || "Failed to update wishlist.");
    }
  };

  return (
    <>
      <article
        className="group cursor-pointer overflow-hidden rounded-[10px] border border-violet-100 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(91,67,204,0.16)]"
        onClick={() => setIsQuickViewOpen(true)}
      >
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#faf7ff_0%,#f7fbff_100%)] p-4">
        <img
          src={product.images?.[0]?.url}
          alt={product.name}
          className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.03]"
        />
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setIsQuickViewOpen(true);
          }}
          className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-[10px] border border-white/70 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 opacity-0 shadow-sm backdrop-blur transition group-hover:opacity-100"
        >
          <Eye size={14} />
          Quick View
        </button>
        <button
          type="button"
          onClick={handleWishlistToggle}
          disabled={isWishlistLoading && !isWishlisted}
          className={`absolute left-4 top-4 inline-flex items-center justify-center rounded-full border px-3 py-3 shadow-sm backdrop-blur transition ${
            isWishlisted
              ? "border-rose-200 bg-rose-50 text-rose-500"
              : "border-white/70 bg-white/90 text-slate-600 hover:bg-white"
          }`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={16} className={isWishlisted ? "fill-current" : ""} />
        </button>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-500">
              {product.category}
            </p>
            <h3 className="mt-2 text-lg font-bold text-slate-900">{product.name}</h3>
          </div>
          <span className="rounded-[8px] bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
            {product.stock} in stock
          </span>
        </div>

        <p className="line-clamp-3 text-sm leading-6 text-slate-600">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-black text-slate-900">
              {formatCurrency(product.price)}
            </p>
            {product.comparePrice > product.price ? (
              <p className="text-sm text-slate-400 line-through">
                {formatCurrency(product.comparePrice)}
              </p>
            ) : null}
            {requiresVariantSelection ? (
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-500">
                Choose options
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isLoading}
            className="inline-flex items-center gap-2 rounded-[10px] bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-white/60"
          >
            <ShoppingCart size={16} />
            {product.stock === 0 ? "Sold Out" : "Add to Cart"}
          </button>
        </div>

        <Link
          to="/shop/cart"
          onClick={(event) => event.stopPropagation()}
          className="text-sm font-semibold text-violet-700"
        >
          View cart
        </Link>
      </div>
    </article>

      <ProductQuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
}

export default ProductCard;
