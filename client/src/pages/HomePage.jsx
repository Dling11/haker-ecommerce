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
      <div className="grid gap-8 rounded-[10px] border border-white/10 bg-[#171c24] p-8 shadow-soft lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <span className="inline-flex rounded-[8px] bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300">
            Haker Storefront
          </span>

          <div className="space-y-4">
            <h1 className="max-w-2xl text-4xl font-black tracking-tight text-white sm:text-5xl">
              Discover products in a cleaner, darker, more focused storefront.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-white/60 sm:text-lg">
              Browse the catalog, search by category, and jump into checkout with a
              calmer interface designed to feel closer to a production storefront.
            </p>
          </div>
        </div>

        <div className="rounded-[10px] bg-[#10141b] p-6 text-white">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">
            Store Tools
          </p>
          <div className="mt-5 space-y-4">
            <input
              type="text"
              name="keyword"
              value={filters.keyword}
              onChange={handleChange}
              placeholder="Search products"
              className="w-full rounded-[10px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30"
            />
            <select
              name="category"
              value={filters.category}
              onChange={handleChange}
              className="w-full rounded-[10px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
            >
              <option value="" className="text-slate-900">
                All categories
              </option>
              {categories.map((category) => (
                <option key={category} value={category} className="text-slate-900">
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <StatusMessage type="error" message={error} />

      {isLoading ? (
        <p className="text-white/60">Loading products...</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {!isLoading && items.length === 0 ? (
        <div className="rounded-[10px] border border-white/10 bg-[#171c24] p-8 text-white/60 shadow-soft">
          No products found yet. If you are an admin, you can add products from the
          admin page after logging in.
        </div>
      ) : null}
    </section>
  );
}

export default HomePage;
