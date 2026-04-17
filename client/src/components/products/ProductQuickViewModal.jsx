import { Heart, Minus, Plus, ShoppingCart, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

import AppModal from "../common/AppModal";
import { addCartItem, openCartDrawer } from "../../features/cart/cartSlice";
import { addWishlistItem, removeWishlistItem } from "../../features/wishlist/wishlistSlice";
import {
  createProductReview,
  fetchProductDetails,
} from "../../features/products/productSlice";
import { getColorOptionLabel, parseColorOption } from "../../utils/colorOptions";
import { formatCurrency } from "../../utils/formatCurrency";

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
  const { items: wishlistItems, isLoading: isWishlistLoading } = useSelector(
    (state) => state.wishlist
  );
  const { selectedProduct, detailLoading, reviewLoading } = useSelector((state) => state.products);
  const [quantity, setQuantity] = useState(1);
  const [activePanel, setActivePanel] = useState("details");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setActivePanel("details");
      setCurrentImageIndex(0);
      setSelectedColor(product.colors?.[0] || "");
      setSelectedSize(product.sizes?.[0] || "");
      setReviewForm({
        rating: 5,
        comment: "",
      });
      dispatch(fetchProductDetails(product._id));
    }
  }, [dispatch, isOpen, product._id]);

  const activeProduct = selectedProduct?._id === product._id ? selectedProduct : product;
  const productImages = activeProduct.images?.length
    ? activeProduct.images
    : [{ url: "", publicId: "" }];
  const activeImage = productImages[currentImageIndex]?.url || productImages[0]?.url || "";
  const requiresColor = (activeProduct.colors?.length || 0) > 0;
  const requiresSize = (activeProduct.sizes?.length || 0) > 0;
  const isWishlisted = wishlistItems.some((item) => item._id === product._id);

  const handleAddToCart = async () => {
    if (!user) {
      onClose();
      navigate("/login");
      return;
    }

    if (requiresColor && !selectedColor) {
      toast.error("Please choose a color.");
      return;
    }

    if (requiresSize && !selectedSize) {
      toast.error("Please choose a size.");
      return;
    }

    const result = await dispatch(
      addCartItem({
        productId: product._id,
        quantity,
        color: selectedColor,
        size: selectedSize,
      })
    );

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

  const handleWishlistToggle = async () => {
    if (!user) {
      onClose();
      navigate("/login");
      return;
    }

    const result = isWishlisted
      ? await dispatch(removeWishlistItem(product._id))
      : await dispatch(addWishlistItem(product._id));

    if (addWishlistItem.fulfilled.match(result) || removeWishlistItem.fulfilled.match(result)) {
      toast.success(isWishlisted ? "Removed from wishlist." : "Saved to wishlist.");
    } else {
      toast.error(result.payload || "Failed to update wishlist.");
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
              <TransformWrapper
                initialScale={1}
                minScale={1}
                maxScale={2.5}
                centerOnInit
                wheel={{ step: 0.12 }}
                pinch={{ step: 5 }}
                doubleClick={{ disabled: true }}
              >
                {({ zoomIn, zoomOut }) => (
                  <div className="space-y-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => zoomOut()}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                        aria-label="Zoom out"
                      >
                        <Minus size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => zoomIn()}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                        aria-label="Zoom in"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="flex min-h-[320px] w-full items-center justify-center">
                      <TransformComponent
                        wrapperClass="!h-full !w-full"
                        contentClass="!h-full !w-full flex items-center justify-center"
                      >
                        <img
                          src={activeImage}
                          alt={activeProduct.name}
                          className="mx-auto max-h-[360px] w-full object-contain"
                        />
                      </TransformComponent>
                    </div>
                  </div>
                )}
              </TransformWrapper>
            </div>
            {productImages.length > 1 ? (
              <div className="mt-3 grid grid-cols-4 gap-3">
                {productImages.map((image, index) => (
                  <button
                    key={`${image.publicId || image.url}-${index}`}
                    type="button"
                    onClick={() => setCurrentImageIndex(index)}
                    className={`overflow-hidden rounded-[10px] border p-1 transition ${
                      index === currentImageIndex
                        ? "border-violet-300 bg-violet-50"
                        : "border-slate-200 bg-white hover:border-violet-200"
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${activeProduct.name} ${index + 1}`}
                      className="h-16 w-full rounded-[8px] object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : null}
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
              {requiresColor ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Color
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {activeProduct.colors.map((color) => (
                      (() => {
                        const parsedColor = parseColorOption(color);

                        return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`rounded-[10px] border px-3 py-2 text-sm font-semibold transition ${
                          selectedColor === color
                            ? "border-violet-300 bg-violet-100 text-violet-800"
                            : "border-slate-200 bg-white text-slate-700 hover:border-violet-200"
                        }`}
                      >
                        <span className="inline-flex items-center gap-2">
                          {parsedColor.hex ? (
                            <span
                              className="h-3.5 w-3.5 rounded-full border border-black/10"
                              style={{ backgroundColor: parsedColor.hex }}
                            />
                          ) : null}
                          {parsedColor.label}
                        </span>
                      </button>
                        );
                      })()
                    ))}
                  </div>
                </div>
              ) : null}

              {requiresSize ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Size
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {activeProduct.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`rounded-[10px] border px-3 py-2 text-sm font-semibold transition ${
                          selectedSize === size
                            ? "border-violet-300 bg-violet-100 text-violet-800"
                            : "border-slate-200 bg-white text-slate-700 hover:border-violet-200"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

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
                {settings?.allowWishlist !== false ? (
                  <button
                    type="button"
                    onClick={handleWishlistToggle}
                    disabled={isWishlistLoading && !isWishlisted}
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-[10px] border transition ${
                      isWishlisted
                        ? "border-rose-200 bg-rose-50 text-rose-500"
                        : "border-slate-200 bg-white text-slate-600 hover:border-rose-200 hover:text-rose-500"
                    }`}
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart size={18} className={isWishlisted ? "fill-current" : ""} />
                  </button>
                ) : null}
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
                {(requiresColor || requiresSize) ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {requiresColor ? (
                      <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Colors
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">
                          {activeProduct.colors.map(getColorOptionLabel).join(", ")}
                        </p>
                      </div>
                    ) : null}
                    {requiresSize ? (
                      <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Sizes
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">
                          {activeProduct.sizes.join(", ")}
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : null}
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
