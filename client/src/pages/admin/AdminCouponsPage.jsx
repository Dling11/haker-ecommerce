import { createColumnHelper } from "@tanstack/react-table";
import { PencilLine, Plus, Trash2 } from "lucide-react";
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
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: 10,
  minimumOrderAmount: 0,
  usageLimit: 0,
  expiresAt: "",
  isActive: true,
};

function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState(null);
  const [couponToDelete, setCouponToDelete] = useState(null);

  const loadCoupons = async () => {
    try {
      setIsLoading(true);
      setError("");
      const { data } = await api.get("/coupons/admin");
      setCoupons(data.coupons || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCouponId(null);
    setFormData(initialFormState);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("code", { header: "Code" }),
      columnHelper.accessor("discountType", { header: "Type" }),
      columnHelper.accessor("discountValue", { header: "Value" }),
      columnHelper.accessor("usedCount", {
        header: "Usage",
        cell: ({ row }) => `${row.original.usedCount}/${row.original.usageLimit || "∞"}`,
      }),
      columnHelper.accessor("isActive", {
        header: "Status",
        cell: (info) => (info.getValue() ? "Active" : "Inactive"),
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
                setEditingCouponId(row.original._id);
                setFormData({
                  code: row.original.code,
                  description: row.original.description || "",
                  discountType: row.original.discountType,
                  discountValue: row.original.discountValue,
                  minimumOrderAmount: row.original.minimumOrderAmount || 0,
                  usageLimit: row.original.usageLimit || 0,
                  expiresAt: row.original.expiresAt
                    ? new Date(row.original.expiresAt).toISOString().slice(0, 16)
                    : "",
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
              onClick={() => setCouponToDelete(row.original)}
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
      const payload = {
        ...formData,
        code: formData.code.toUpperCase(),
      };

      if (editingCouponId) {
        await api.put(`/coupons/${editingCouponId}`, payload);
        toast.success("Coupon updated.");
      } else {
        await api.post("/coupons", payload);
        toast.success("Coupon created.");
      }

      closeModal();
      loadCoupons();
    } catch (requestError) {
      const message = getErrorMessage(requestError);
      setError(message);
      toast.error(message);
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/coupons/${couponToDelete._id}`);
      toast.success("Coupon deleted.");
      setCouponToDelete(null);
      loadCoupons();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    }
  };

  return (
    <section className="space-y-4">
      <div className="panel p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">Coupons</p>
            <h2 className="mt-2 text-2xl font-black text-white">Promotions and discount codes</h2>
          </div>
          <button type="button" onClick={() => setIsModalOpen(true)} className="btn-primary gap-2">
            <Plus size={16} />
            Add Coupon
          </button>
        </div>
        {isLoading ? <p className="mt-2 text-sm text-white/45">Refreshing...</p> : null}
      </div>

      <StatusMessage type="error" message={error} />
      <AdminDataTable columns={columns} data={coupons} emptyMessage="No coupons found." />

      <AppModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingCouponId ? "Edit coupon" : "Add coupon"}
        description="Manage promotional discounts for checkout."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-white/80">Code</span>
              <input value={formData.code} onChange={(event) => setFormData((current) => ({ ...current, code: event.target.value.toUpperCase() }))} className="field uppercase" required />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-white/80">Discount type</span>
              <select value={formData.discountType} onChange={(event) => setFormData((current) => ({ ...current, discountType: event.target.value }))} className="field">
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed</option>
              </select>
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-white/80">Description</span>
            <textarea rows="3" value={formData.description} onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))} className="field" />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-white/80">Discount value</span>
              <input type="number" min="0" value={formData.discountValue} onChange={(event) => setFormData((current) => ({ ...current, discountValue: Number(event.target.value) }))} className="field" />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-white/80">Minimum order</span>
              <input type="number" min="0" value={formData.minimumOrderAmount} onChange={(event) => setFormData((current) => ({ ...current, minimumOrderAmount: Number(event.target.value) }))} className="field" />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-white/80">Usage limit</span>
              <input type="number" min="0" value={formData.usageLimit} onChange={(event) => setFormData((current) => ({ ...current, usageLimit: Number(event.target.value) }))} className="field" />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-white/80">Expiry</span>
              <input type="datetime-local" value={formData.expiresAt} onChange={(event) => setFormData((current) => ({ ...current, expiresAt: event.target.value }))} className="field" />
            </label>
          </div>

          <label className="flex items-center gap-3 text-sm text-white/75">
            <input type="checkbox" checked={formData.isActive} onChange={(event) => setFormData((current) => ({ ...current, isActive: event.target.checked }))} />
            Keep active
          </label>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editingCouponId ? "Save Changes" : "Create Coupon"}</button>
          </div>
        </form>
      </AppModal>

      <ConfirmModal
        isOpen={Boolean(couponToDelete)}
        onClose={() => setCouponToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete coupon?"
        description={`This will remove ${couponToDelete?.code || "this coupon"} from checkout.`}
        confirmLabel="Delete coupon"
      />
    </section>
  );
}

export default AdminCouponsPage;
