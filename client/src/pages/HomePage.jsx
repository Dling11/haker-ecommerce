import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import PaginationControls from "../components/common/PaginationControls";
import StatusMessage from "../components/common/StatusMessage";
import ProductCard from "../components/products/ProductCard";
import { fetchProducts } from "../features/products/productSlice";
import useDebouncedValue from "../hooks/useDebouncedValue";
import api from "../services/api";

function HomePage() {
  const dispatch = useDispatch();
  const { items, categories, pagination, isLoading, error } = useSelector((state) => state.products);
  const { settings } = useSelector((state) => state.site);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [homepageBanners, setHomepageBanners] = useState([]);
  const [featuredCollections, setFeaturedCollections] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const prevButtonRef = useRef(null);
  const nextButtonRef = useRef(null);
  const [filters, setFilters] = useState({
    keyword: "",
    category: "",
    page: 1,
  });
  const debouncedKeyword = useDebouncedValue(filters.keyword, 300);

  useEffect(() => {
    let isMounted = true;

    const loadFeaturedProducts = async () => {
      try {
        setFeaturedLoading(true);
        const [productsResponse, bannersResponse, collectionsResponse] = await Promise.all([
          api.get("/products", {
            params: {
              featured: true,
              limit: 6,
            },
          }),
          settings?.allowHomepageBanners === false ? Promise.resolve({ data: { banners: [] } }) : api.get("/banners"),
          settings?.allowCollections === false
            ? Promise.resolve({ data: { collections: [] } })
            : api.get("/collections/featured"),
        ]);

        if (isMounted) {
          setFeaturedProducts(productsResponse.data.products || []);
          setHomepageBanners(bannersResponse.data.banners || []);
          setFeaturedCollections(collectionsResponse.data.collections || []);
        }
      } catch {
        if (isMounted) {
          setFeaturedProducts([]);
          setHomepageBanners([]);
          setFeaturedCollections([]);
        }
      } finally {
        if (isMounted) {
          setFeaturedLoading(false);
        }
      }
    };

    loadFeaturedProducts();

    return () => {
      isMounted = false;
    };
  }, [settings?.allowCollections, settings?.allowHomepageBanners]);

  useEffect(() => {
    dispatch(
      fetchProducts({
        ...filters,
        keyword: debouncedKeyword,
      })
    );
  }, [debouncedKeyword, dispatch, filters.category, filters.page]);

  const handleChange = (event) => {
    setFilters((current) => ({
      ...current,
      [event.target.name]: event.target.value,
      page: 1,
    }));
  };

  return (
    <section className="space-y-10">
      <div className="rounded-[10px] border border-violet-100 bg-[linear-gradient(135deg,#f7f3ff_0%,#ffffff_48%,#f4f7ff_100%)] p-8 shadow-soft">
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
      </div>

      <StatusMessage type="error" message={error} />

      {settings?.allowHomepageBanners !== false && homepageBanners.length ? (
        <section className="grid gap-4 lg:grid-cols-2">
          {homepageBanners.slice(0, 2).map((banner) => (
            <article
              key={banner._id}
              className="overflow-hidden rounded-[10px] border border-violet-100 bg-white shadow-soft"
            >
              <div className="grid gap-0 md:grid-cols-[1fr_0.9fr]">
                <div className="space-y-4 p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-500">
                    Featured banner
                  </p>
                  <h2 className="text-2xl font-black text-slate-900">{banner.title}</h2>
                  <p className="text-sm leading-6 text-slate-600">{banner.subtitle}</p>
                  {banner.ctaLink ? (
                    <Link
                      to={banner.ctaLink}
                      className="inline-flex rounded-[10px] bg-violet-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                      {banner.ctaLabel || "Shop now"}
                    </Link>
                  ) : null}
                </div>
                <div className="min-h-[220px] bg-[linear-gradient(180deg,#faf7ff_0%,#f4f8ff_100%)]">
                  {banner.image?.url ? (
                    <img
                      src={banner.image.url}
                      alt={banner.title}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {settings?.allowCollections !== false && featuredCollections.length ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-500">
                Featured collections
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">Browse by curated drop</h2>
            </div>
            <Link to="/shop/collections" className="text-sm font-semibold text-violet-700">
              View all collections
            </Link>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {featuredCollections.map((collection) => (
              <Link
                key={collection._id}
                to={`/shop/collections/${collection.slug}`}
                className="overflow-hidden rounded-[10px] border border-violet-100 bg-white shadow-soft transition hover:-translate-y-1"
              >
                <div className="aspect-[4/3] bg-[linear-gradient(180deg,#faf7ff_0%,#f4f8ff_100%)]">
                  {collection.image?.url ? (
                    <img
                      src={collection.image.url}
                      alt={collection.name}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="space-y-2 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-black text-slate-900">{collection.name}</h3>
                    <span className="rounded-[8px] bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                      {collection.productIds?.length || 0}
                    </span>
                  </div>
                  <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                    {collection.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {featuredLoading ? (
        <div className="rounded-[10px] border border-violet-100 bg-white p-8 text-slate-500 shadow-soft">
          Loading featured products...
        </div>
      ) : featuredProducts.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-violet-500">
                <Sparkles size={16} />
                Featured picks
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">
                Curated products worth highlighting
              </h2>
            </div>
            <p className="hidden max-w-sm text-sm leading-6 text-slate-500 md:block">
              Rowell jay Rodriguez, HAKER WEB
            </p>
          </div>

          <div className="rounded-[10px] border border-violet-100 bg-[linear-gradient(135deg,#f8f4ff_0%,#ffffff_48%,#f5f8ff_100%)] p-4 shadow-soft sm:p-5">
            <div className="mb-4 hidden items-center justify-end gap-3 md:flex">
              <button
                ref={prevButtonRef}
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-violet-200 bg-white text-violet-700 transition hover:bg-violet-50"
                aria-label="Previous featured products"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                ref={nextButtonRef}
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-violet-200 bg-white text-violet-700 transition hover:bg-violet-50"
                aria-label="Next featured products"
              >
                <ArrowRight size={18} />
              </button>
            </div>

            <Swiper
              modules={[Autoplay, Navigation, Pagination]}
              spaceBetween={20}
              slidesPerView={1}
              pagination={{ clickable: true }}
              navigation={{
                prevEl: prevButtonRef.current,
                nextEl: nextButtonRef.current,
              }}
              autoplay={{
                delay: 3500,
                disableOnInteraction: false,
              }}
              loop={featuredProducts.length > 3}
              onBeforeInit={(swiper) => {
                swiper.params.navigation.prevEl = prevButtonRef.current;
                swiper.params.navigation.nextEl = nextButtonRef.current;
              }}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                },
                1024: {
                  slidesPerView: 3,
                },
              }}
              className="homepage-featured-swiper"
            >
              {featuredProducts.map((product) => (
                <SwiperSlide key={product._id} className="pb-10">
                  <ProductCard product={product} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
      ) : null}

      <section className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-500">
              Shop all products
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
              Browse the full catalog
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Search by keyword, narrow by category, and explore the rest of the store
              in a layout that keeps browsing simple.
            </p>
          </div>
        </div>

        <div className="grid gap-4 rounded-[10px] border border-violet-100 bg-white p-5 shadow-soft lg:grid-cols-[1.2fr_0.8fr]">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Search products</span>
            <input
              type="text"
              name="keyword"
              value={filters.keyword}
              onChange={handleChange}
              placeholder="Search by name, brand, or keyword"
              className="w-full rounded-[10px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Filter by category</span>
            <select
              name="category"
              value={filters.category}
              onChange={handleChange}
              className="w-full rounded-[10px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {isLoading ? (
        <p className="text-slate-500">Loading products...</p>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          <PaginationControls
            pagination={pagination}
            onPageChange={(nextPage) =>
              setFilters((current) => ({
                ...current,
                page: nextPage,
              }))
            }
          />
        </>
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
