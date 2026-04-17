import { Layers3 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import StatusMessage from "../components/common/StatusMessage";
import api from "../services/api";
import getErrorMessage from "../utils/getErrorMessage";

function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadCollections = async () => {
      try {
        setIsLoading(true);
        const { data } = await api.get("/collections");

        if (isMounted) {
          setCollections(data.collections || []);
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

    loadCollections();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="space-y-6">
      <div className="rounded-[10px] border border-violet-100 bg-[linear-gradient(135deg,#f7f2ff_0%,#ffffff_55%,#f4f8ff_100%)] p-8 shadow-soft">
        <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-violet-500">
          <Layers3 size={16} />
          Collections
        </p>
        <h1 className="mt-3 text-3xl font-black text-slate-900">Shop by curated story</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          Explore curated sets built around styles, drops, and featured moments instead of a
          flat product list.
        </p>
      </div>

      <StatusMessage type="error" message={error} />

      {isLoading ? (
        <div className="rounded-[10px] border border-violet-100 bg-white p-8 text-slate-500 shadow-soft">
          Loading collections...
        </div>
      ) : collections.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {collections.map((collection) => (
            <Link
              key={collection._id}
              to={`/shop/collections/${collection.slug}`}
              className="group overflow-hidden rounded-[10px] border border-violet-100 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(91,67,204,0.14)]"
            >
              <div className="aspect-[4/3] overflow-hidden bg-[linear-gradient(180deg,#faf7ff_0%,#f5f8ff_100%)]">
                {collection.image?.url ? (
                  <img
                    src={collection.image.url}
                    alt={collection.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-violet-300">
                    <Layers3 size={32} />
                  </div>
                )}
              </div>
              <div className="space-y-3 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-black text-slate-900">{collection.name}</h2>
                  <span className="rounded-[8px] bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                    {collection.productIds?.length || 0} items
                  </span>
                </div>
                <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                  {collection.description || "A curated selection of products ready to explore."}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-[10px] border border-violet-100 bg-white p-8 text-slate-500 shadow-soft">
          No collections are live yet.
        </div>
      )}
    </section>
  );
}

export default CollectionsPage;
