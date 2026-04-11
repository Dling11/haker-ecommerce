import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import { addCartItem } from "../../features/cart/cartSlice";
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

    await dispatch(addCartItem({ productId: product._id, quantity: 1 }));
  };

  return (
    <article className="overflow-hidden rounded-[10px] border border-white/10 bg-[#1a1f29] shadow-soft">
      <div className="aspect-[4/3] overflow-hidden bg-[#10141b]">
        <img
          src={product.images?.[0]?.url}
          alt={product.name}
          className="h-full w-full object-cover transition duration-300 hover:scale-105"
        />
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300/75">
              {product.category}
            </p>
            <h3 className="mt-2 text-lg font-bold text-white">{product.name}</h3>
          </div>
          <span className="rounded-[8px] bg-white/5 px-3 py-1 text-xs font-semibold text-white/70">
            {product.stock} in stock
          </span>
        </div>

        <p className="line-clamp-3 text-sm leading-6 text-white/60">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-black text-white">
              {formatCurrency(product.price)}
            </p>
            {product.comparePrice > product.price ? (
              <p className="text-sm text-white/35 line-through">
                {formatCurrency(product.comparePrice)}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isLoading}
            className="rounded-[10px] bg-white px-4 py-2 text-sm font-semibold text-[#0f141b] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/25 disabled:text-white/50"
          >
            {product.stock === 0 ? "Sold Out" : "Add to Cart"}
          </button>
        </div>

        <Link to="/shop/cart" className="text-sm font-semibold text-cyan-300">
          View cart
        </Link>
      </div>
    </article>
  );
}

export default ProductCard;
