import { createColumnHelper } from "@tanstack/react-table";
import { LoaderCircle, PencilLine, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import AdminDataTable from "../../components/admin/AdminDataTable";
import AppModal from "../../components/common/AppModal";
import ConfirmModal from "../../components/common/ConfirmModal";
import SearchableSelect from "../../components/common/SearchableSelect";
import StatusMessage from "../../components/common/StatusMessage";
import api from "../../services/api";
import getErrorMessage from "../../utils/getErrorMessage";

const columnHelper = createColumnHelper();

const initialFormState = {
  name: "",
  description: "",
  image: { url: "", publicId: "" },
  isActive: true,
  isFeatured: false,
  sortOrder: 0,
  productIds: [],
};

function AdminCollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollectionId, setEditingCollectionId] = useState(null);
  const [collectionToDelete, setCollectionToDelete] = useState(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError("");
      const [collectionResponse, productResponse] = await Promise.all([
        api.get("/collections/admin"),
        api.get("/products/admin", { params: { limit: 200 } }),
      ]);
      setCollections(collectionResponse.data.collections || []);
      setProducts(productResponse.data.products || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const productOptions = useMemo(
    () =>
      products.map((product) => ({
        value: product._id,
        label: product.name,
        description: `${product.category} - ${product.stock} in stock`,
      })),
    [products]
  );

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCollectionId(null);
    setFormData(initialFormState);
  };

  const handleImageUpload = async (file) => {
    if (!file) {
      return;
    }

    try {
      setIsUploading(true);
      const uploadData = new FormData();
      uploadData.append("image", file);
      uploadData.append("folder", "haker-ecommerce/collections");
      const { data } = await api.post("/uploads/image", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFormData((current) => ({
        ...current,
        image: data.image,
      }));
      toast.success("Collection image uploaded.");
    } catch (uploadError) {
      toast.error(getErrorMessage(uploadError));
    } finally {
      setIsUploading(false);
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Collection",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            {row.original.image?.url ? (
              <img
                src={row.original.image.url}
                alt={row.original.name}
                className="h-12 w-12 rounded-[10px] object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-white/5 text-white/35">
                #{row.index + 1}
              </div>
            )}
            <div>
              <p className="font-semibold text-white">{row.original.name}</p>
              <p className="text-xs text-white/45">{row.original.slug}</p>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("productIds", {
        header: "Products",
        cell: (info) => info.getValue()?.length || 0,
      }),
      columnHelper.accessor("isFeatured", {
        header: "Featured",
        cell: (info) => (info.getValue() ? "Yes" : "No"),
      }),
      columnHelper.accessor("isActive", {
        header: "Status",
        cell: (info) => (
          <span className="rounded-[8px] bg-white/5 px-3 py-1 text-xs font-semibold text-white/75">
            {info.getValue() ? "Active" : "Hidden"}
          </span>
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
              onClick={() => {
                setEditingCollectionId(row.original._id);
                setFormData({
                  name: row.original.name,
                  description: row.original.description || "",
                  image: row.original.image || { url: "", publicId: "" },
                  isActive: row.original.isActive,
                  isFeatured: row.original.isFeatured,
                  sortOrder: row.original.sortOrder || 0,
                  productIds: (row.original.productIds || []).map((product) => product._id || product),
                });
                setIsModalOpen(true);
              }}
            >
              <PencilLine size={16} />
            </button>
            <button
              type="button"
              className="rounded-[10px] border border-rose-500/20 px-4 py-2 text-rose-300 transition hover:bg-rose-500/10"
              onClick={() => setCollectionToDelete(row.original)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      }),
    ],
    []
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setIsSaving(true);
      setError("");

      const payload = {
        ...formData,
        sortOrder: Number(formData.sortOrder || 0),
      };

      if (editingCollectionId) {
        await api.put(`/collections/${editingCollectionId}`, payload);
        toast.success("Collection updated.");
      } else {
        await api.post("/collections", payload);
        toast.success("Collection created.");
      }

      closeModal();
      loadData();
    } catch (requestError) {
      const message = getErrorMessage(requestError);
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/collections/${collectionToDelete._id}`);
      toast.success("Collection deleted.");
      setCollectionToDelete(null);
      loadData();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    }
  };

  return (
    <section className="space-y-4">
      <div className="panel p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">
              Collections
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">Curated collection management</h2>
          </div>
          <button type="button" onClick={() => setIsModalOpen(true)} className="btn-primary gap-2">
            <Plus size={16} />
            Add Collection
          </button>
        </div>
        {isLoading ? <p className="mt-2 text-sm text-white/45">Refreshing...</p> : null}
      </div>

      <StatusMessage type="error" message={error} />

      <AdminDataTable columns={columns} data={collections} emptyMessage="No collections found." />

      <AppModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingCollectionId ? "Edit collection" : "Add collection"}
        description="Build curated product groupings for merchandising and browsing."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-white/80">Collection name</span>
            <input
              value={formData.name}
              onChange={(event) =>
                setFormData((current) => ({ ...current, name: event.target.value }))
              }
              className="field"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-white/80">Description</span>
            <textarea
              rows="4"
              value={formData.description}
              onChange={(event) =>
                setFormData((current) => ({ ...current, description: event.target.value }))
              }
              className="field"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-white/80">Sort order</span>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, sortOrder: event.target.value }))
                }
                className="field"
              />
            </label>
            <div className="space-y-3 pt-7">
              <label className="flex items-center gap-3 text-sm text-white/75">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(event) =>
                    setFormData((current) => ({ ...current, isActive: event.target.checked }))
                  }
                />
                Keep active
              </label>
              <label className="flex items-center gap-3 text-sm text-white/75">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(event) =>
                    setFormData((current) => ({ ...current, isFeatured: event.target.checked }))
                  }
                />
                Feature on storefront
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-semibold text-white/80">Collection image</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => handleImageUpload(event.target.files?.[0])}
              className="field file:mr-4 file:rounded-[8px] file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-900"
            />
            {isUploading ? <p className="text-sm text-white/45">Uploading image...</p> : null}
            {formData.image?.url ? (
              <img src={formData.image.url} alt="Collection preview" className="h-40 w-full rounded-[10px] object-cover" />
            ) : null}
          </div>

          <div className="space-y-3">
            <span className="text-sm font-semibold text-white/80">Products</span>
            <SearchableSelect
              label="Add product"
              placeholder="Search products"
              options={productOptions.filter((option) => !formData.productIds.includes(option.value))}
              value=""
              onChange={(value) =>
                value
                  ? setFormData((current) => ({
                      ...current,
                      productIds: [...current.productIds, value],
                    }))
                  : null
              }
            />
            <div className="flex flex-wrap gap-2">
              {formData.productIds.map((productId) => {
                const product = products.find((item) => item._id === productId);

                return (
                  <button
                    key={productId}
                    type="button"
                    onClick={() =>
                      setFormData((current) => ({
                        ...current,
                        productIds: current.productIds.filter((item) => item !== productId),
                      }))
                    }
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/85"
                  >
                    {product?.name || productId}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={closeModal} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSaving || isUploading} className="btn-primary gap-2">
              {isSaving ? <LoaderCircle size={16} className="animate-spin" /> : null}
              {isSaving ? "Saving..." : editingCollectionId ? "Save Changes" : "Create Collection"}
            </button>
          </div>
        </form>
      </AppModal>

      <ConfirmModal
        isOpen={Boolean(collectionToDelete)}
        onClose={() => setCollectionToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete collection?"
        description={`This will remove ${collectionToDelete?.name || "this collection"} from the storefront.`}
        confirmLabel="Delete collection"
      />
    </section>
  );
}

export default AdminCollectionsPage;
