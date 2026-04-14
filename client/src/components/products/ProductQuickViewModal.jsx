import { Eye, Minus, Plus, ShoppingCart, Star } from "lucide-react";
import { useEffect, useState } from "react";
import InnerImageZoomModule from "react-inner-image-zoom";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "react-inner-image-zoom/lib/styles.min.css";

import AppModal from "../common/AppModal";
import { addCartItem, openCartDrawer } from "../../features/cart/cartSlice";
import {
  createProductReview,
  fetchProductDetails,
} from "../../features/products/productSlice";
import { formatCurrency } from "../../utils/formatCurrency";

const InnerImageZoom =
  InnerImageZoomModule?.default ||
  InnerImageZoomModule?.InnerImageZoom ||
  InnerImageZoomModule;

const ReviewStars = ({ rating, interactive = false, onChange = null, size = 16 }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((value) => {
      const isFilled = value <= rating;
      const sharedClassName = isFilled
        ? "text-amber-500 fill-amber-400"
        : "text-slate-300";

      if (!interactive) {
        return <Star key={value} size={size} className={sharedClassName} />;
      }

      return (
        <button
          key={value}
          type="button"
          onClick={() => onChange?.(value)}
          className="rounded-[8px] p-1 transition hover:bg-amber-50"
          aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
        >
          <Star size={size} className={sharedClassName} />
        </button>
      );
    })}
  </div>
);

const getReviewInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

function ProductQuickViewModal({ product, isOpen, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { settings } = useSelector((state) => state.site);
  const { isLoading } = useSelector((state) => state.cart);
  const { selectedProduct, detailLoading, reviewLoading } = useSelector((state) => state.products);
  const [quantity, setQuantity] = useState(1);
  const [activePanel, setActivePanel] = useState("details");
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setActivePanel("details");
      setReviewForm({
        rating: 5,
        comment: "",
      });
      dispatch(fetchProductDetails(product._id));
    }
  }, [dispatch, isOpen, product._id]);

  const activeProduct = selectedProduct?._id === product._id ? selectedProduct : product;

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

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    const result = await dispatch(
      createProductReview({
        productId: product._id,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      })
    );

    if (createProductReview.fulfilled.match(result)) {
      toast.success("Review added successfully.");
      setReviewForm({ rating: 5, comment: "" });
    } else {
      toast.error(result.payload || "Failed to submit review.");
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
      {detailLoading ? (
        <div className="py-10 text-center text-sm text-slate-500">Loading product details...</div>
      ) : (
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="lg:self-center">
            <div className="overflow-hidden rounded-[10px] border border-violet-100 bg-[linear-gradient(180deg,#faf7ff_0%,#f8fbff_100%)] p-6">
              <div className="flex min-h-[320px] w-full items-center justify-center">
                <InnerImageZoom
                  src={activeProduct.images?.[0]?.url}
                  zoomSrc={activeProduct.images?.[0]?.url}
                  alt={activeProduct.name}
                  zoomType="hover"
                  hideHint
                  hasSpacer={false}
                  imgAttributes={{
                    className: "mx-auto max-h-[360px] w-full object-contain",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-[8px] bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-700">
                {activeProduct.category}
              </span>
              <span className="rounded-[8px] bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {activeProduct.stock > 0 ? `${activeProduct.stock} in stock` : "Sold out"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-[8px] bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                <Star size={14} className="fill-current" />
                {(activeProduct.rating || 0).toFixed(1)} ({activeProduct.numReviews || 0})
              </span>
            </div>

            <div>
              <div className="flex items-end gap-3">
                <p className="text-3xl font-black text-slate-900">
                  {formatCurrency(activeProduct.price)}
                </p>
                {activeProduct.comparePrice > activeProduct.price ? (
                  <p className="text-base font-medium text-slate-400 line-through">
                    {formatCurrency(activeProduct.comparePrice)}
                  </p>
                ) : null}
              </div>

              {activeProduct.brand ? (
                <p className="mt-2 text-sm font-medium text-slate-500">
                  Brand: {activeProduct.brand}
                </p>
              ) : null}
            </div>

            <p className="line-clamp-4 text-sm leading-7 text-slate-600">
              {activeProduct.description}
            </p>

            <div className="space-y-4 rounded-[10px] border border-slate-200 bg-slate-50 p-4">
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
                      setQuantity((current) => Math.min(activeProduct.stock || 1, current + 1))
                    }
                    disabled={activeProduct.stock === 0 || quantity >= activeProduct.stock}
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
                  disabled={activeProduct.stock === 0 || isLoading}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-[10px] bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <ShoppingCart size={16} />
                  {activeProduct.stock === 0 ? "Sold Out" : "Add to Cart"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-[10px] border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center rounded-[10px] bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setActivePanel("details")}
                className={`rounded-[8px] px-4 py-2 text-sm font-semibold transition ${
                  activePanel === "details"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Details
              </button>
              <button
                type="button"
                onClick={() => setActivePanel("reviews")}
                className={`rounded-[8px] px-4 py-2 text-sm font-semibold transition ${
                  activePanel === "reviews"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Reviews
              </button>
            </div>
            {activePanel === "reviews" ? (
              <span className="text-sm text-slate-500">
                {activeProduct.numReviews || 0} total
              </span>
            ) : null}
          </div>

          {activePanel === "details" ? (
            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Description
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {activeProduct.description}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Category
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {activeProduct.category}
                    </p>
                  </div>
                  <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Brand
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {activeProduct.brand || "Generic"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Review snapshot
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <ReviewStars rating={Math.round(activeProduct.rating || 0)} size={18} />
                    <span className="text-sm font-semibold text-slate-700">
                      {(activeProduct.rating || 0).toFixed(1)} average rating
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    Based on {activeProduct.numReviews || 0} verified review
                    {activeProduct.numReviews === 1 ? "" : "s"}.
                  </p>
                </div>
                <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Availability
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {activeProduct.stock > 0
                      ? `${activeProduct.stock} units currently available`
                      : "Currently sold out"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {activeProduct.reviews?.length ? (
                <div className="space-y-3">
                  {activeProduct.reviews.slice(0, 3).map((review) => (
                    <article key={review._id} className="rounded-[10px] border border-slate-200 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                            {getReviewInitials(review.name)}
                          </span>
                          <div>
                            <p className="font-semibold text-slate-900">{review.name}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <ReviewStars rating={review.rating} size={14} />
                              <span className="text-xs font-semibold text-amber-700">
                                {review.rating.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                        {review.createdAt ? (
                          <span className="text-xs text-slate-400">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{review.comment}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No reviews yet for this product.</p>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-3 rounded-[10px] bg-slate-50 p-4">
                {settings?.allowReviews === false ? (
                  <p className="text-sm text-slate-500">
                    Reviews are temporarily disabled by the store.
                  </p>
                ) : null}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Rating</span>
                    <div className="flex flex-wrap items-center gap-3 rounded-[10px] border border-slate-200 bg-white px-4 py-3">
                      <ReviewStars
                        rating={reviewForm.rating}
                        interactive
                        onChange={(rating) =>
                          setReviewForm((current) => ({
                            ...current,
                            rating,
                          }))
                        }
                        size={18}
                      />
                      <span className="text-sm font-semibold text-amber-700">
                        {reviewForm.rating} star{reviewForm.rating > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Comment</span>
                    <textarea
                      rows="3"
                      value={reviewForm.comment}
                      onChange={(event) =>
                        setReviewForm((current) => ({
                          ...current,
                          comment: event.target.value,
                        }))
                      }
                      className="w-full rounded-[10px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                      placeholder="Share your experience with this product"
                      required
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={reviewLoading || settings?.allowReviews === false}
                  className="inline-flex items-center justify-center rounded-[10px] border border-violet-200 px-4 py-3 text-sm font-semibold text-violet-700 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:text-slate-400"
                >
                  {reviewLoading ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
      )}
    </AppModal>
  );
}

export default ProductQuickViewModal;
