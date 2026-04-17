import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import PaginationControls from "../components/common/PaginationControls";
import StatusMessage from "../components/common/StatusMessage";
import ProductCard from "../components/products/ProductCard";
import api from "../services/api";
import getErrorMessage from "../utils/getErrorMessage";

function CollectionDetailsPage() {
  const { slug } = useParams();
  const [collection, setCollection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    let isMounted = true;

    const loadCollection = async () => {
      try {
        setIsLoading(true);
        setError("");
        const { data } = await api.get(`/collections/${slug}`);

        if (isMounted) {
          setCollection(data.collection);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(getErrorMessage(requestError));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadCollection();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const filteredProducts = useMemo(() => {
    const products = collection?.productIds || [];
    const normalizedKeyword = keyword.trim().toLowerCase();

    return products.filter((product) => {
      const matchesKeyword = normalizedKeyword
        ? `${product.name} ${product.description} ${product.brand}`
            .toLowerCase()
            .includes(normalizedKeyword)
        : true;
      const matchesCategory = category ? product.category === category : true;

      return matchesKeyword && matchesCategory;
    });
  }, [category, collection?.productIds, keyword]);

  const categories = useMemo(
    () => [...new Set((collection?.productIds || []).map((product) => product.category).filter(Boolean))],
    [collection?.productIds]
  );

  const paginatedProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);
  const pagination =
    filteredProducts.length > pageSize
      ? {
          page,
          totalPages: Math.ceil(filteredProducts.length / pageSize),
        }
      : null;

  useEffect(() => {
    setPage(1);
  }, [keyword, category]);

  return (
    <section className="space-y-6">
      <StatusMessage type="error" message={error} />

      {isLoading ? (
        <div className="rounded-[10px] border border-violet-100 bg-white p-8 text-slate-500 shadow-soft">
          Loading collection...
        </div>
      ) : collection ? (
        <>
          <div className="overflow-hidden rounded-[10px] border border-violet-100 bg-white shadow-soft">
            <div className="grid gap-0 lg:grid-cols-[1fr_1fr]">
              <div className="flex flex-col justify-center space-y-4 p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-500">
                  Collection
                </p>
                <h1 className="text-3xl font-black text-slate-900">{collection.name}</h1>
                <p className="text-sm leading-7 text-slate-600">
                  {collection.description || "A curated collection from the HAKER storefront."}
                </p>
              </div>
              <div className="min-h-[280px] bg-[linear-gradient(180deg,#faf7ff_0%,#f4f8ff_100%)]">
                {collection.image?.url ? (
                  <img
                    src={collection.image.url}
                    alt={collection.name}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-4 rounded-[10px] border border-violet-100 bg-white p-5 shadow-soft lg:grid-cols-[1.2fr_0.8fr]">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">Search inside collection</span>
              <input
                type="text"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                className="w-full rounded-[10px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                placeholder="Search by name or brand"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">Filter by category</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-[10px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
              >
                <option value="">All categories</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {paginatedProducts.length ? (
            <>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              <PaginationControls pagination={pagination} onPageChange={setPage} />
            </>
          ) : (
            <div className="rounded-[10px] border border-violet-100 bg-white p-8 text-slate-500 shadow-soft">
              No products matched this collection filter.
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}

export default CollectionDetailsPage;
