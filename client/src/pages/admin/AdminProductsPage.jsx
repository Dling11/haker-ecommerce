import { createColumnHelper } from "@tanstack/react-table";
import { LoaderCircle, MessageSquareMore, PencilLine, Plus, Search, SlidersHorizontal, Star, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import AdminDataTable from "../../components/admin/AdminDataTable";
import ProductFormModal from "../../components/admin/ProductFormModal";
import AppModal from "../../components/common/AppModal";
import ConfirmModal from "../../components/common/ConfirmModal";
import PaginationControls from "../../components/common/PaginationControls";
import StatusMessage from "../../components/common/StatusMessage";
import { fetchCategories } from "../../features/categories/categorySlice";
import {
  deleteAdminProductReview,
  deleteProduct,
  fetchAdminProducts,
  fetchProductDetails,
  updateAdminProductReview,
} from "../../features/products/productSlice";
import useAdminProductForm from "../../hooks/useAdminProductForm";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import { formatCurrency } from "../../utils/formatCurrency";
import {
  defaultColorOptions,
  defaultSizeOptions,
} from "./productForm.constants";

const columnHelper = createColumnHelper();

function AdminProductsPage() {
  const dispatch = useDispatch();
  const { adminItems, adminLoading, adminError, adminPagination } = useSelector((state) => state.products);
  const { selectedProduct, reviewLoading } = useSelector((state) => state.products);
  const { items: categories } = useSelector((state) => state.categories);
  const { uploadLoading, error } = useSelector((state) => state.admin);

  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewDraft, setReviewDraft] = useState({ rating: 5, comment: "" });
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(searchTerm, 300);
  const {
    customColorHex,
    customColorInput,
    isColorPickerOpen,
    customSizeInput,
    editingProductId,
    formData,
    isModalOpen,
    isRemovingImage,
    isSavingProduct,
    openCreateModal,
    productImageInputRef,
    removeVariantValue,
    setCustomColorHex,
    setCustomColorInput,
    setIsColorPickerOpen,
    setCustomSizeInput,
    startEditing,
    toggleVariantValue,
    addCustomVariantValue,
    closeModal,
    handleChange,
    handleImageUpload,
    handleRemoveImage,
    handleSubmit,
  } = useAdminProductForm({ dispatch });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchAdminProducts({
        keyword: debouncedSearch,
        status: statusFilter,
        sort: sortOption,
        page,
      })
    );
  }, [debouncedSearch, dispatch, page, sortOption, statusFilter]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Product",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <img
              src={row.original.images?.[0]?.url}
              alt={row.original.name}
              className="h-12 w-12 rounded-[10px] object-cover"
            />
            <div>
              <p className="font-semibold text-white">{row.original.name}</p>
              <p className="text-xs text-white/45">{row.original.brand || "Generic"}</p>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("category", { header: "Category" }),
      columnHelper.accessor("price", {
        header: "Price",
        cell: (info) => formatCurrency(info.getValue()),
      }),
      columnHelper.accessor("stock", { header: "Stock" }),
      columnHelper.display({
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <span className="rounded-[8px] bg-white/5 px-3 py-1 text-xs font-semibold text-white/75">
              {row.original.isPublished ? "Active" : "Inactive"}
            </span>
            {row.original.isFeatured ? (
              <span className="rounded-[8px] bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                Featured
              </span>
            ) : null}
          </div>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-secondary px-4 py-2"
              onClick={async () => {
                setReviewProduct(row.original);
                setEditingReview(null);
                setReviewDraft({ rating: 5, comment: "" });
                await dispatch(fetchProductDetails(row.original._id));
              }}
            >
              <MessageSquareMore size={16} />
            </button>
            <button
              type="button"
              className="btn-secondary px-4 py-2"
              onClick={() => startEditing(row.original)}
            >
              <PencilLine size={16} />
            </button>
            <button
              type="button"
              className="rounded-[10px] border border-rose-500/20 px-4 py-2 text-rose-300 transition hover:bg-rose-500/10"
              onClick={() => setProductToDelete(row.original)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      }),
    ],
    [dispatch]
  );

  const confirmDelete = async () => {
    setIsDeletingProduct(true);
    const result = await dispatch(deleteProduct(productToDelete._id));

    if (deleteProduct.fulfilled.match(result)) {
      toast.success("Product deleted.");
      setProductToDelete(null);
    } else {
      toast.error(result.payload || "Failed to delete product.");
    }

    setIsDeletingProduct(false);
  };

  const activeReviewProduct =
    selectedProduct?._id === reviewProduct?._id ? selectedProduct : reviewProduct;

  const startEditingReview = (review) => {
    setEditingReview(review._id);
    setReviewDraft({
      rating: review.rating,
      comment: review.comment,
    });
  };

  const handleReviewSave = async (reviewId) => {
    const result = await dispatch(
      updateAdminProductReview({
        productId: activeReviewProduct._id,
        reviewId,
        rating: Number(reviewDraft.rating),
        comment: reviewDraft.comment,
      })
    );

    if (updateAdminProductReview.fulfilled.match(result)) {
      toast.success("Review updated.");
      setEditingReview(null);
    } else {
      toast.error(result.payload || "Failed to update review.");
    }
  };

  const handleReviewDelete = async () => {
    const result = await dispatch(
      deleteAdminProductReview({
        productId: activeReviewProduct._id,
        reviewId: reviewToDelete._id,
      })
    );

    if (deleteAdminProductReview.fulfilled.match(result)) {
      toast.success("Review deleted.");
      setReviewToDelete(null);
    } else {
      toast.error(result.payload || "Failed to delete review.");
    }
  };

  return (
    <section className="space-y-4">
      <div className="panel p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">
              Product Inventory
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">Manage catalog entries</h2>
          </div>

          <button type="button" onClick={openCreateModal} className="btn-primary gap-2">
            <Plus size={16} />
            Add Product
          </button>
        </div>
        {adminLoading ? <p className="mt-2 text-sm text-white/45">Refreshing...</p> : null}
      </div>

      <div className="panel p-4">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <label className="space-y-2">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-white/75">
              <Search size={16} />
              Search products
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(1);
              }}
              placeholder="Search by name, brand, or category"
              className="field"
            />
          </label>

          <label className="space-y-2">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-white/75">
              <SlidersHorizontal size={16} />
              Filter status
            </span>
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              className="field"
            >
              <option value="all">All products</option>
              <option value="published">Active</option>
              <option value="draft">Inactive</option>
              <option value="featured">Featured</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-white/75">
              <SlidersHorizontal size={16} />
              Sort results
            </span>
            <select
              value={sortOption}
              onChange={(event) => {
                setSortOption(event.target.value);
                setPage(1);
              }}
              className="field"
            >
              <option value="newest">Newest first</option>
              <option value="name_az">Name A-Z</option>
              <option value="price_high">Price high to low</option>
              <option value="price_low">Price low to high</option>
              <option value="stock_high">Highest stock</option>
            </select>
          </label>
        </div>

        <p className="mt-3 text-sm text-white/45">
          Showing {adminItems.length} products on this page
        </p>
      </div>

      <StatusMessage type="error" message={adminError || error} />

      <AdminDataTable columns={columns} data={adminItems} emptyMessage="No products found yet." />
      <PaginationControls pagination={adminPagination} onPageChange={setPage} />

      <ProductFormModal
        adminError={adminError}
        categories={categories}
        closeModal={closeModal}
        customColorInput={customColorInput}
        customColorHex={customColorHex}
        customSizeInput={customSizeInput}
        defaultColorOptions={defaultColorOptions}
        defaultSizeOptions={defaultSizeOptions}
        editingProductId={editingProductId}
        error={error}
        formData={formData}
        handleChange={handleChange}
        handleImageUpload={handleImageUpload}
        handleRemoveImage={handleRemoveImage}
        handleSubmit={handleSubmit}
        isModalOpen={isModalOpen}
        isColorPickerOpen={isColorPickerOpen}
        isRemovingImage={isRemovingImage}
        isSavingProduct={isSavingProduct}
        productImageInputRef={productImageInputRef}
        removeVariantValue={removeVariantValue}
        setCustomColorInput={setCustomColorInput}
        setCustomColorHex={setCustomColorHex}
        setIsColorPickerOpen={setIsColorPickerOpen}
        setCustomSizeInput={setCustomSizeInput}
        toggleVariantValue={toggleVariantValue}
        addCustomVariantValue={addCustomVariantValue}
        uploadLoading={uploadLoading}
      />

      <ConfirmModal
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete product?"
        description={`This will permanently remove ${productToDelete?.name || "this product"} from the catalog.`}
        confirmLabel="Delete product"
        loadingLabel="Deleting..."
        isLoading={isDeletingProduct}
      />

      <AppModal
        isOpen={Boolean(reviewProduct)}
        onClose={() => {
          setReviewProduct(null);
          setEditingReview(null);
          setReviewToDelete(null);
        }}
        title={activeReviewProduct ? `${activeReviewProduct.name} reviews` : "Product reviews"}
        description="Moderate product feedback, adjust ratings when needed, and remove inappropriate comments."
        width="max-w-4xl"
      >
        {activeReviewProduct ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="panel-muted p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/40">Average rating</p>
                <div className="mt-2 flex items-center gap-2">
                  <Star size={16} className="fill-current text-amber-300" />
                  <p className="text-lg font-bold text-white">
                    {(activeReviewProduct.rating || 0).toFixed(1)}
                  </p>
                </div>
              </div>
              <div className="panel-muted p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/40">Total reviews</p>
                <p className="mt-2 text-lg font-bold text-white">
                  {activeReviewProduct.numReviews || 0}
                </p>
              </div>
              <div className="panel-muted p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/40">Category</p>
                <p className="mt-2 text-lg font-bold text-white">
                  {activeReviewProduct.category}
                </p>
              </div>
            </div>

            {activeReviewProduct.reviews?.length ? (
              <div className="space-y-3">
                {activeReviewProduct.reviews.map((review) => (
                  <article key={review._id} className="panel-muted space-y-4 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-white">{review.name}</p>
                        <div className="mt-2 flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <Star
                              key={`${review._id}-${value}`}
                              size={14}
                              className={
                                value <= review.rating
                                  ? "fill-amber-300 text-amber-300"
                                  : "text-white/20"
                              }
                            />
                          ))}
                          <span className="text-sm text-white/55">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEditingReview(review)}
                          className="btn-secondary px-4 py-2"
                        >
                          <PencilLine size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setReviewToDelete(review)}
                          className="rounded-[10px] border border-rose-500/20 px-4 py-2 text-rose-300 transition hover:bg-rose-500/10"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {editingReview === review._id ? (
                      <div className="space-y-3">
                        <label className="block space-y-2">
                          <span className="text-sm font-semibold text-white/75">Rating</span>
                          <select
                            value={reviewDraft.rating}
                            onChange={(event) =>
                              setReviewDraft((current) => ({
                                ...current,
                                rating: Number(event.target.value),
                              }))
                            }
                            className="field"
                          >
                            {[5, 4, 3, 2, 1].map((rating) => (
                              <option key={rating} value={rating}>
                                {rating} star{rating > 1 ? "s" : ""}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="block space-y-2">
                          <span className="text-sm font-semibold text-white/75">Comment</span>
                          <textarea
                            rows="3"
                            value={reviewDraft.comment}
                            onChange={(event) =>
                              setReviewDraft((current) => ({
                                ...current,
                                comment: event.target.value,
                              }))
                            }
                            className="field"
                          />
                        </label>
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => setEditingReview(null)}
                            className="btn-secondary"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReviewSave(review._id)}
                            disabled={reviewLoading}
                            className="btn-primary gap-2 disabled:cursor-not-allowed"
                          >
                            {reviewLoading ? (
                              <LoaderCircle size={16} className="animate-spin" />
                            ) : null}
                            {reviewLoading ? "Saving..." : "Save review"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm leading-6 text-white/70">{review.comment}</p>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/50">This product does not have reviews yet.</p>
            )}
          </div>
        ) : null}
      </AppModal>

      <ConfirmModal
        isOpen={Boolean(reviewToDelete)}
        onClose={() => setReviewToDelete(null)}
        onConfirm={handleReviewDelete}
        title="Delete review?"
        description="This will permanently remove the selected review from the product."
        confirmLabel="Delete review"
        loadingLabel="Deleting..."
        isLoading={reviewLoading}
      />
    </section>
  );
}

export default AdminProductsPage;
