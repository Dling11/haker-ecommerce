import { Eye, Minus, Plus, ShoppingCart, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import AppModal from "../common/AppModal";
import { addCartItem, openCartDrawer } from "../../features/cart/cartSlice";
import {
  createProductReview,
  fetchProductDetails,
} from "../../features/products/productSlice";
import { formatCurrency } from "../../utils/formatCurrency";

function ProductQuickViewModal({ product, isOpen, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { isLoading } = useSelector((state) => state.cart);
  const { selectedProduct, detailLoading, reviewLoading } = useSelector((state) => state.products);
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
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
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex min-h-[320px] items-center justify-center rounded-[10px] border border-violet-100 bg-[linear-gradient(180deg,#faf7ff_0%,#f8fbff_100%)] p-6">
          <img
            src={activeProduct.images?.[0]?.url}
            alt={activeProduct.name}
            className="max-h-[360px] w-full object-contain"
          />
        </div>

        <div className="space-y-5 overflow-y-auto pr-1">
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

          <p className="text-sm leading-7 text-slate-600">{activeProduct.description}</p>

          <div className="grid gap-3 rounded-[10px] border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Quick View
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                A larger preview helps users compare price and description before adding.
              </p>
            </div>
            <div className="space-y-3">
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

          <div className="space-y-4 rounded-[10px] border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Reviews</h3>
              <span className="text-sm text-slate-500">{activeProduct.numReviews || 0} total</span>
            </div>

            {activeProduct.reviews?.length ? (
              <div className="space-y-3">
                {activeProduct.reviews.slice(0, 3).map((review) => (
                  <article key={review._id} className="rounded-[10px] border border-slate-200 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-900">{review.name}</p>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600">
                        <Star size={14} className="fill-current" />
                        {review.rating}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{review.comment}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No reviews yet for this product.</p>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-3 rounded-[10px] bg-slate-50 p-4">
              <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Rating</span>
                  <select
                    value={reviewForm.rating}
                    onChange={(event) =>
                      setReviewForm((current) => ({
                        ...current,
                        rating: Number(event.target.value),
                      }))
                    }
                    className="w-full rounded-[10px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
                  >
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating} star{rating > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </label>

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
                disabled={reviewLoading}
                className="inline-flex items-center justify-center rounded-[10px] border border-violet-200 px-4 py-3 text-sm font-semibold text-violet-700 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                {reviewLoading ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        </div>
      </div>
      )}
    </AppModal>
  );
}

export default ProductQuickViewModal;
