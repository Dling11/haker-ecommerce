import { createColumnHelper } from "@tanstack/react-table";
import { PencilLine, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import AdminDataTable from "../../components/admin/AdminDataTable";
import AppModal from "../../components/common/AppModal";
import ConfirmModal from "../../components/common/ConfirmModal";
import StatusMessage from "../../components/common/StatusMessage";
import {
  createCategory,
  deleteCategory,
  fetchAdminCategories,
  updateCategory,
} from "../../features/categories/categorySlice";

const columnHelper = createColumnHelper();

const initialFormState = {
  name: "",
  description: "",
  isActive: true,
};

function AdminCategoriesPage() {
  const dispatch = useDispatch();
  const { adminItems, adminLoading, error } = useSelector((state) => state.categories);
  const [formData, setFormData] = useState(initialFormState);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminCategories());
  }, [dispatch]);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategoryId(null);
    setFormData(initialFormState);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", { header: "Category" }),
      columnHelper.accessor("description", {
        header: "Description",
        cell: (info) => info.getValue() || "-",
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
                setEditingCategoryId(row.original._id);
                setFormData({
                  name: row.original.name,
                  description: row.original.description || "",
                  isActive: row.original.isActive,
                });
                setIsModalOpen(true);
              }}
            >
              <PencilLine size={16} />
            </button>
            <button
              type="button"
              className="rounded-[10px] border border-rose-500/20 px-4 py-2 text-rose-300 transition hover:bg-rose-500/10"
              onClick={() => setCategoryToDelete(row.original)}
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
    const result = editingCategoryId
      ? await dispatch(updateCategory({ categoryId: editingCategoryId, ...formData }))
      : await dispatch(createCategory(formData));

    if (createCategory.fulfilled.match(result) || updateCategory.fulfilled.match(result)) {
      toast.success(editingCategoryId ? "Category updated." : "Category created.");
      closeModal();
    } else {
      toast.error(result.payload || "Failed to save category.");
    }
  };

  const confirmDelete = async () => {
    const result = await dispatch(deleteCategory(categoryToDelete._id));

    if (deleteCategory.fulfilled.match(result)) {
      toast.success("Category deleted.");
      setCategoryToDelete(null);
    } else {
      toast.error(result.payload || "Failed to delete category.");
    }
  };

  return (
    <section className="space-y-4">
      <div className="panel p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">
              Categories
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">Manage product categories</h2>
          </div>
          <button type="button" onClick={() => setIsModalOpen(true)} className="btn-primary gap-2">
            <Plus size={16} />
            Add Category
          </button>
        </div>
        {adminLoading ? <p className="mt-2 text-sm text-white/45">Refreshing...</p> : null}
      </div>

      <StatusMessage type="error" message={error} />

      <AdminDataTable columns={columns} data={adminItems} emptyMessage="No categories found." />

      <AppModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingCategoryId ? "Edit category" : "Add category"}
        description="Keep categories clean so products stay easier to manage and browse."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-white/80">Category name</span>
            <input
              name="name"
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
              name="description"
              value={formData.description}
              onChange={(event) =>
                setFormData((current) => ({ ...current, description: event.target.value }))
              }
              rows="4"
              className="field"
            />
          </label>

          <label className="flex items-center gap-3 text-sm text-white/75">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(event) =>
                setFormData((current) => ({ ...current, isActive: event.target.checked }))
              }
            />
            Keep this category active
          </label>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={closeModal} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingCategoryId ? "Save Changes" : "Create Category"}
            </button>
          </div>
        </form>
      </AppModal>

      <ConfirmModal
        isOpen={Boolean(categoryToDelete)}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete category?"
        description={`This will remove ${categoryToDelete?.name || "this category"} if no products still use it.`}
        confirmLabel="Delete category"
      />
    </section>
  );
}

export default AdminCategoriesPage;
