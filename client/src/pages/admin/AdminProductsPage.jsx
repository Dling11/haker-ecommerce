import { createColumnHelper } from "@tanstack/react-table";
import { LoaderCircle, MessageSquareMore, PencilLine, Plus, Search, SlidersHorizontal, Star, Trash2, Upload, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import AdminDataTable from "../../components/admin/AdminDataTable";
import AppModal from "../../components/common/AppModal";
import ConfirmModal from "../../components/common/ConfirmModal";
import PaginationControls from "../../components/common/PaginationControls";
import StatusMessage from "../../components/common/StatusMessage";
import {
  clearUploadedImage,
  deleteAdminImage,
  uploadAdminImage,
} from "../../features/admin/adminSlice";
import { fetchCategories } from "../../features/categories/categorySlice";
import {
  createProduct,
  deleteAdminProductReview,
  deleteProduct,
  fetchAdminProducts,
  fetchProductDetails,
  updateAdminProductReview,
  updateProduct,
} from "../../features/products/productSlice";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import { formatCurrency } from "../../utils/formatCurrency";

const initialFormState = {
  name: "",
  description: "",
  brand: "",
  category: "",
  price: "",
  comparePrice: "",
  stock: "",
  imageUrl: "",
  imagePublicId: "",
  isFeatured: false,
  isPublished: true,
};

const columnHelper = createColumnHelper();

function AdminProductsPage() {
  const dispatch = useDispatch();
  const { adminItems, adminLoading, adminError, adminPagination } = useSelector((state) => state.products);
  const { selectedProduct, reviewLoading } = useSelector((state) => state.products);
  const { items: categories } = useSelector((state) => state.categories);
  const { uploadLoading, uploadedImage, error } = useSelector((state) => state.admin);

  const [formData, setFormData] = useState(initialFormState);
  const [editingProductId, setEditingProductId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isRemovingImage, setIsRemovingImage] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewDraft, setReviewDraft] = useState({ rating: 5, comment: "" });
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [originalImage, setOriginalImage] = useState({ url: "", publicId: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(searchTerm, 300);
  const productImageInputRef = useRef(null);

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

  useEffect(() => {
    if (uploadedImage?.url) {
      setFormData((current) => ({
        ...current,
        imageUrl: uploadedImage.url,
        imagePublicId: uploadedImage.publicId,
      }));
      toast.success("Image uploaded successfully.");
      dispatch(clearUploadedImage());
    }
  }, [dispatch, uploadedImage]);

  const resetForm = () => {
    setEditingProductId(null);
    setOriginalImage({ url: "", publicId: "" });
    setFormData(initialFormState);
    if (productImageInputRef.current) {
      productImageInputRef.current.value = "";
    }
  };

  const removeTemporaryImage = async (publicId) => {
    if (!publicId) {
      return true;
    }

    const result = await dispatch(deleteAdminImage(publicId));

    if (deleteAdminImage.rejected.match(result)) {
      toast.error(result.payload || "Failed to remove image.");
      return false;
    }

    return true;
  };

  const closeModal = async ({ cleanupTemporaryImage = true } = {}) => {
    if (
      cleanupTemporaryImage &&
      formData.imagePublicId &&
      formData.imagePublicId !== originalImage.publicId
    ) {
      await removeTemporaryImage(formData.imagePublicId);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const startEditing = (product) => {
    setEditingProductId(product._id);
    setOriginalImage({
      url: product.images?.[0]?.url || "",
      publicId: product.images?.[0]?.publicId || "",
    });
    setFormData({
      name: product.name,
      description: product.description,
      brand: product.brand,
      category: product.category,
      price: product.price,
      comparePrice: product.comparePrice,
      stock: product.stock,
      imageUrl: product.images?.[0]?.url || "",
      imagePublicId: product.images?.[0]?.publicId || "",
      isFeatured: product.isFeatured,
      isPublished: product.isPublished,
    });
    setIsModalOpen(true);
  };

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
              {row.original.isPublished ? "Published" : "Draft"}
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

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const previousTemporaryPublicId =
      formData.imagePublicId && formData.imagePublicId !== originalImage.publicId
        ? formData.imagePublicId
        : "";

    const result = await dispatch(
      uploadAdminImage({ file, folder: "haker-ecommerce/products" })
    );

    if (uploadAdminImage.rejected.match(result)) {
      toast.error(result.payload || "Failed to upload image.");
      return;
    }

    if (previousTemporaryPublicId) {
      await removeTemporaryImage(previousTemporaryPublicId);
    }

    if (productImageInputRef.current) {
      productImageInputRef.current.value = "";
    }
  };

  const handleRemoveImage = async () => {
    if (!formData.imagePublicId) {
      return;
    }

    setIsRemovingImage(true);

    if (formData.imagePublicId !== originalImage.publicId) {
      const removed = await removeTemporaryImage(formData.imagePublicId);

      if (!removed) {
        setIsRemovingImage(false);
        return;
      }
    }

    if (originalImage.publicId && formData.imagePublicId !== originalImage.publicId) {
      setFormData((current) => ({
        ...current,
        imageUrl: originalImage.url,
        imagePublicId: originalImage.publicId,
      }));
      if (productImageInputRef.current) {
        productImageInputRef.current.value = "";
      }
      toast.success("Reverted to the original product image.");
      setIsRemovingImage(false);
      return;
    }

    setFormData((current) => ({
      ...current,
      imageUrl: "",
      imagePublicId: "",
    }));
    if (productImageInputRef.current) {
      productImageInputRef.current.value = "";
    }
    toast.success("Image removed.");
    setIsRemovingImage(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSavingProduct(true);

    const payload = {
      name: formData.name,
      description: formData.description,
      brand: formData.brand,
      category: formData.category,
      price: Number(formData.price),
      comparePrice: Number(formData.comparePrice || 0),
      stock: Number(formData.stock),
      isFeatured: formData.isFeatured,
      isPublished: formData.isPublished,
      images: [{ url: formData.imageUrl, publicId: formData.imagePublicId || "" }],
    };

    const result = editingProductId
      ? await dispatch(updateProduct({ productId: editingProductId, productData: payload }))
      : await dispatch(createProduct(payload));

    if (updateProduct.fulfilled.match(result) || createProduct.fulfilled.match(result)) {
      toast.success(editingProductId ? "Product updated." : "Product created.");
      await closeModal({ cleanupTemporaryImage: false });
    } else {
      toast.error(result.payload || "Failed to save product.");
    }

    setIsSavingProduct(false);
  };

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
              <option value="published">Published</option>
              <option value="draft">Draft</option>
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

      <AppModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProductId ? "Edit product" : "Add product"}
        description="Use a focused modal to manage products without cluttering the table."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <StatusMessage type="error" message={adminError || error} />
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Product name" className="field" required />
          <textarea name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Description" className="field" required />
          <div className="grid gap-4 sm:grid-cols-2">
            <input name="brand" value={formData.brand} onChange={handleChange} placeholder="Brand" className="field" />
            <select name="category" value={formData.category} onChange={handleChange} className="field" required>
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category._id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Price" className="field" required />
            <input type="number" name="comparePrice" value={formData.comparePrice} onChange={handleChange} placeholder="Compare price" className="field" />
            <input type="number" name="stock" value={formData.stock} onChange={handleChange} placeholder="Stock" className="field" required />
          </div>

          <div className="panel-muted space-y-3 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
              <Upload size={16} />
              Upload product image
            </div>
            <input
              ref={productImageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="field"
            />
            {uploadLoading ? <p className="text-sm text-white/50">Uploading image...</p> : null}
            {isRemovingImage ? <p className="text-sm text-white/50">Removing image...</p> : null}
          </div>

          <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="Cloudinary image URL" className="field" required />

          {formData.imageUrl ? (
            <div className="space-y-3">
              <img src={formData.imageUrl} alt="Preview" className="h-44 w-full rounded-[10px] object-cover" />
              <button
                type="button"
                onClick={handleRemoveImage}
                disabled={isRemovingImage}
                className="inline-flex items-center gap-2 rounded-[10px] border border-rose-500/20 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/10"
              >
                <X size={16} />
                {isRemovingImage
                  ? "Removing..."
                  : formData.imagePublicId && formData.imagePublicId !== originalImage.publicId
                  ? "Remove uploaded image"
                  : "Clear image selection"}
              </button>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-3 text-sm text-white/75">
              <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} />
              Feature this product
            </label>
            <label className="flex items-center gap-3 text-sm text-white/75">
              <input type="checkbox" name="isPublished" checked={formData.isPublished} onChange={handleChange} />
              Publish product
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
            <button
              type="submit"
              disabled={isSavingProduct}
              className="btn-primary gap-2 disabled:cursor-not-allowed"
            >
              {isSavingProduct ? <LoaderCircle size={16} className="animate-spin" /> : null}
              {isSavingProduct
                ? editingProductId
                  ? "Saving..."
                  : "Creating..."
                : editingProductId
                  ? "Save Changes"
                  : "Create Product"}
            </button>
          </div>
        </form>
      </AppModal>

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
