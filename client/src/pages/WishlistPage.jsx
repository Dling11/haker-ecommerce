import { Heart } from "lucide-react";
import { useSelector } from "react-redux";

import StatusMessage from "../components/common/StatusMessage";
import ProductCard from "../components/products/ProductCard";

function WishlistPage() {
  const { items, isLoading, error } = useSelector((state) => state.wishlist);
  const { settings } = useSelector((state) => state.site);

  return (
    <section className="space-y-6">
      <div className="rounded-[10px] border border-rose-100 bg-[linear-gradient(135deg,#fff4f7_0%,#ffffff_52%,#fff8fb_100%)] p-8 shadow-soft">
        <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-rose-500">
          <Heart size={16} />
          Wishlist
        </p>
        <h1 className="mt-3 text-3xl font-black text-slate-900">Saved products</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          Keep track of the products you want to revisit before adding them to cart.
        </p>
      </div>

      <StatusMessage type="error" message={error} />
      {settings?.allowWishlist === false ? (
        <StatusMessage type="info" message="Wishlist is currently disabled by the store." />
      ) : null}

      {settings?.allowWishlist === false ? (
        <div className="rounded-[10px] border border-violet-100 bg-white p-8 text-slate-500 shadow-soft">
          Wishlist access is paused right now.
        </div>
      ) : isLoading ? (
        <div className="rounded-[10px] border border-violet-100 bg-white p-8 text-slate-500 shadow-soft">
          Loading wishlist...
        </div>
      ) : items.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-[10px] border border-violet-100 bg-white p-8 text-slate-500 shadow-soft">
          Your wishlist is empty for now. Save products from the storefront to see them here.
        </div>
      )}
    </section>
  );
}

export default WishlistPage;
