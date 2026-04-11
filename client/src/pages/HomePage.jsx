import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import StatusMessage from "../components/common/StatusMessage";
import ProductCard from "../components/products/ProductCard";
import { fetchProducts } from "../features/products/productSlice";

function HomePage() {
  const dispatch = useDispatch();
  const { items, categories, isLoading, error } = useSelector((state) => state.products);
  const [filters, setFilters] = useState({
    keyword: "",
    category: "",
  });

  useEffect(() => {
    dispatch(fetchProducts(filters));
  }, [dispatch, filters]);

  const handleChange = (event) => {
    setFilters((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  return (
    <section className="space-y-10">
      <div className="grid gap-8 rounded-[10px] border border-violet-100 bg-[linear-gradient(135deg,#f7f3ff_0%,#ffffff_48%,#f4f7ff_100%)] p-8 shadow-soft lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <span className="inline-flex rounded-[8px] bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700">
            Haker Storefront
          </span>

          <div className="space-y-4">
            <h1 className="max-w-2xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              Clean product browsing with a lighter storefront and faster path to checkout.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Browse the catalog, filter by category, and move through your purchase
              flow with a cleaner, more modern shopping experience.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[10px] border border-violet-100 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-500">
                Curated
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Product cards are structured for quick scanning and clearer actions.
              </p>
            </div>
            <div className="rounded-[10px] border border-violet-100 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-500">
                Fast
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Add to cart opens the side drawer immediately so users stay in flow.
              </p>
            </div>
            <div className="rounded-[10px] border border-violet-100 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-500">
                Guided
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Checkout and order states are easier to read with stronger hierarchy.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[10px] border border-violet-100 bg-white p-6 text-slate-900 shadow-soft">
          <p className="text-sm uppercase tracking-[0.3em] text-violet-500">
            Store Tools
          </p>
          <div className="mt-5 space-y-4">
            <input
              type="text"
              name="keyword"
              value={filters.keyword}
              onChange={handleChange}
              placeholder="Search products"
              className="w-full rounded-[10px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400"
            />
            <select
              name="category"
              value={filters.category}
              onChange={handleChange}
              className="w-full rounded-[10px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
            >
              <option value="">
                All categories
              </option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <StatusMessage type="error" message={error} />

      {isLoading ? (
        <p className="text-slate-500">Loading products...</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {!isLoading && items.length === 0 ? (
        <div className="rounded-[10px] border border-violet-100 bg-white p-8 text-slate-500 shadow-soft">
          No products found yet. If you are an admin, you can add products from the
          admin page after logging in.
        </div>
      ) : null}
    </section>
  );
}

export default HomePage;
