import { ShoppingCart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { addCartItem, openCartDrawer } from "../../features/cart/cartSlice";
import { formatCurrency } from "../../utils/formatCurrency";

function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { isLoading } = useSelector((state) => state.cart);

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
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

  return (
    <article className="overflow-hidden rounded-[10px] border border-violet-100 bg-white shadow-soft">
      <div className="aspect-[4/3] overflow-hidden bg-violet-50">
        <img
          src={product.images?.[0]?.url}
          alt={product.name}
          className="h-full w-full object-cover transition duration-300 hover:scale-105"
        />
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

        <Link to="/shop/cart" className="text-sm font-semibold text-violet-700">
          View cart
        </Link>
      </div>
    </article>
  );
}

export default ProductCard;
