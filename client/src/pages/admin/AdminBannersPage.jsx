import { createColumnHelper } from "@tanstack/react-table";
import { LoaderCircle, PencilLine, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import AdminDataTable from "../../components/admin/AdminDataTable";
import AppModal from "../../components/common/AppModal";
import ConfirmModal from "../../components/common/ConfirmModal";
import StatusMessage from "../../components/common/StatusMessage";
import api from "../../services/api";
import getErrorMessage from "../../utils/getErrorMessage";

const columnHelper = createColumnHelper();

const initialFormState = {
  title: "",
  subtitle: "",
  image: { url: "", publicId: "" },
  ctaLabel: "",
  ctaLink: "",
  tone: "violet",
  isActive: true,
  sortOrder: 0,
};

function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState(null);
  const [bannerToDelete, setBannerToDelete] = useState(null);

  const loadBanners = async () => {
    try {
      setIsLoading(true);
      setError("");
      const { data } = await api.get("/banners/admin");
      setBanners(data.banners || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBannerId(null);
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
      uploadData.append("folder", "haker-ecommerce/banners");
      const { data } = await api.post("/uploads/image", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData((current) => ({ ...current, image: data.image }));
      toast.success("Banner image uploaded.");
    } catch (uploadError) {
      toast.error(getErrorMessage(uploadError));
    } finally {
      setIsUploading(false);
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("title", {
        header: "Banner",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            {row.original.image?.url ? (
              <img src={row.original.image.url} alt={row.original.title} className="h-12 w-12 rounded-[10px] object-cover" />
            ) : null}
            <div>
              <p className="font-semibold text-white">{row.original.title}</p>
              <p className="text-xs text-white/45">{row.original.tone}</p>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("ctaLabel", {
        header: "CTA",
        cell: (info) => info.getValue() || "-",
      }),
      columnHelper.accessor("isActive", {
        header: "Status",
        cell: (info) => (info.getValue() ? "Active" : "Hidden"),
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
                setEditingBannerId(row.original._id);
                setFormData({
                  title: row.original.title,
                  subtitle: row.original.subtitle || "",
                  image: row.original.image || { url: "", publicId: "" },
                  ctaLabel: row.original.ctaLabel || "",
                  ctaLink: row.original.ctaLink || "",
                  tone: row.original.tone || "violet",
                  isActive: row.original.isActive,
                  sortOrder: row.original.sortOrder || 0,
                });
                setIsModalOpen(true);
              }}
            >
              <PencilLine size={16} />
            </button>
            <button
              type="button"
              className="rounded-[10px] border border-rose-500/20 px-4 py-2 text-rose-300 transition hover:bg-rose-500/10"
              onClick={() => setBannerToDelete(row.original)}
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

      if (editingBannerId) {
        await api.put(`/banners/${editingBannerId}`, formData);
        toast.success("Banner updated.");
      } else {
        await api.post("/banners", formData);
        toast.success("Banner created.");
      }

      closeModal();
      loadBanners();
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
      await api.delete(`/banners/${bannerToDelete._id}`);
      toast.success("Banner deleted.");
      setBannerToDelete(null);
      loadBanners();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    }
  };

  return (
    <section className="space-y-4">
      <div className="panel p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">Banners</p>
            <h2 className="mt-2 text-2xl font-black text-white">Homepage banner management</h2>
          </div>
          <button type="button" onClick={() => setIsModalOpen(true)} className="btn-primary gap-2">
            <Plus size={16} />
            Add Banner
          </button>
        </div>
        {isLoading ? <p className="mt-2 text-sm text-white/45">Refreshing...</p> : null}
      </div>

      <StatusMessage type="error" message={error} />
      <AdminDataTable columns={columns} data={banners} emptyMessage="No banners found." />

      <AppModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingBannerId ? "Edit banner" : "Add banner"}
        description="Drive the homepage with strong visuals and direct call-to-action links."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-white/80">Title</span>
            <input value={formData.title} onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))} className="field" required />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-white/80">Subtitle</span>
            <textarea rows="4" value={formData.subtitle} onChange={(event) => setFormData((current) => ({ ...current, subtitle: event.target.value }))} className="field" />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-white/80">CTA label</span>
              <input value={formData.ctaLabel} onChange={(event) => setFormData((current) => ({ ...current, ctaLabel: event.target.value }))} className="field" />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-white/80">CTA link</span>
              <input value={formData.ctaLink} onChange={(event) => setFormData((current) => ({ ...current, ctaLink: event.target.value }))} className="field" placeholder="/shop/collections/new-arrivals" />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-white/80">Tone</span>
              <input value={formData.tone} onChange={(event) => setFormData((current) => ({ ...current, tone: event.target.value }))} className="field" />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-white/80">Sort order</span>
              <input type="number" value={formData.sortOrder} onChange={(event) => setFormData((current) => ({ ...current, sortOrder: Number(event.target.value) }))} className="field" />
            </label>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-semibold text-white/80">Banner image</span>
            <input type="file" accept="image/*" onChange={(event) => handleImageUpload(event.target.files?.[0])} className="field file:mr-4 file:rounded-[8px] file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-900" />
            {isUploading ? <p className="text-sm text-white/45">Uploading image...</p> : null}
            {formData.image?.url ? <img src={formData.image.url} alt="Banner preview" className="h-40 w-full rounded-[10px] object-cover" /> : null}
          </div>

          <label className="flex items-center gap-3 text-sm text-white/75">
            <input type="checkbox" checked={formData.isActive} onChange={(event) => setFormData((current) => ({ ...current, isActive: event.target.checked }))} />
            Keep active
          </label>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSaving || isUploading} className="btn-primary gap-2">
              {isSaving ? <LoaderCircle size={16} className="animate-spin" /> : null}
              {isSaving ? "Saving..." : editingBannerId ? "Save Changes" : "Create Banner"}
            </button>
          </div>
        </form>
      </AppModal>

      <ConfirmModal
        isOpen={Boolean(bannerToDelete)}
        onClose={() => setBannerToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete banner?"
        description={`This will remove ${bannerToDelete?.title || "this banner"} from the homepage rotation.`}
        confirmLabel="Delete banner"
      />
    </section>
  );
}

export default AdminBannersPage;
