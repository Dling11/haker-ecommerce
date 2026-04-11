import { createColumnHelper } from "@tanstack/react-table";
import {
  Eye,
  ImagePlus,
  LoaderCircle,
  PencilLine,
  Plus,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import AdminDataTable from "../../components/admin/AdminDataTable";
import AppModal from "../../components/common/AppModal";
import ConfirmModal from "../../components/common/ConfirmModal";
import StatusMessage from "../../components/common/StatusMessage";
import {
  clearUploadedImage,
  createAdminUser,
  deleteAdminUser,
  fetchUsers,
  updateUserManagement,
  uploadAdminImage,
} from "../../features/admin/adminSlice";

const columnHelper = createColumnHelper();

const initialFormState = {
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "customer",
  status: "active",
  avatar: "",
  fullName: "",
  shippingPhone: "",
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "Philippines",
};

function AdminUsersPage() {
  const dispatch = useDispatch();
  const { users, isLoading, error, uploadLoading, uploadedImage } = useSelector(
    (state) => state.admin
  );
  const [formData, setFormData] = useState(initialFormState);
  const [editingUserId, setEditingUserId] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [pendingDeleteUser, setPendingDeleteUser] = useState(null);
  const [pendingRoleChange, setPendingRoleChange] = useState(null);
  const currentEditingUser = users.find((user) => user._id === editingUserId);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    if (uploadedImage?.url) {
      setFormData((current) => ({
        ...current,
        avatar: uploadedImage.url,
      }));
      toast.success("Profile image uploaded.");
      dispatch(clearUploadedImage());
    }
  }, [dispatch, uploadedImage]);

  const resetForm = () => {
    setEditingUserId(null);
    setFormData(initialFormState);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    resetForm();
  };

  const openCreateModal = () => {
    resetForm();
    setIsFormModalOpen(true);
  };

  const startEditing = (user) => {
    setEditingUserId(user._id);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",
      role: user.role || "customer",
      status: user.status || "active",
      avatar: user.avatar?.url || "",
      fullName: user.shippingAddress?.fullName || "",
      shippingPhone: user.shippingAddress?.phone || "",
      street: user.shippingAddress?.street || "",
      city: user.shippingAddress?.city || "",
      state: user.shippingAddress?.state || "",
      postalCode: user.shippingAddress?.postalCode || "",
      country: user.shippingAddress?.country || "Philippines",
    });
    setIsFormModalOpen(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const result = await dispatch(
      uploadAdminImage({ file, folder: "haker-ecommerce/users" })
    );

    if (uploadAdminImage.rejected.match(result)) {
      toast.error(result.payload || "Failed to upload image.");
    }
  };

  const buildPayload = () => ({
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    ...(formData.password ? { password: formData.password } : {}),
    role: formData.role,
    status: formData.status,
    avatar: {
      url: formData.avatar,
      publicId: "",
    },
    shippingAddress: {
      fullName: formData.fullName,
      phone: formData.shippingPhone,
      street: formData.street,
      city: formData.city,
      state: formData.state,
      postalCode: formData.postalCode,
      country: formData.country,
    },
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = buildPayload();

    if (editingUserId && currentEditingUser?.role && currentEditingUser.role !== payload.role) {
      setPendingRoleChange({
        userId: editingUserId,
        ...payload,
        name: payload.name,
      });
      return;
    }

    const result = editingUserId
      ? await dispatch(updateUserManagement({ userId: editingUserId, ...payload }))
      : await dispatch(createAdminUser(payload));

    if (createAdminUser.fulfilled.match(result) || updateUserManagement.fulfilled.match(result)) {
      toast.success(editingUserId ? "User updated successfully." : "User created successfully.");
      closeFormModal();
    } else if (createAdminUser.rejected.match(result) || updateUserManagement.rejected.match(result)) {
      toast.error(result.payload || "Failed to save user.");
    }
  };

  const confirmDelete = async () => {
    const result = await dispatch(deleteAdminUser(pendingDeleteUser._id));

    if (deleteAdminUser.fulfilled.match(result)) {
      toast.success("User deleted successfully.");
      setPendingDeleteUser(null);
    } else {
      toast.error(result.payload || "Failed to delete user.");
    }
  };

  const confirmRoleChange = async () => {
    const result = await dispatch(updateUserManagement(pendingRoleChange));

    if (updateUserManagement.fulfilled.match(result)) {
      toast.success("User access updated.");
      setPendingRoleChange(null);
      if (isFormModalOpen) {
        closeFormModal();
      }
    } else {
      toast.error(result.payload || "Failed to update role.");
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "User",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full bg-white/10">
              {row.original.avatar?.url ? (
                <img
                  src={row.original.avatar.url}
                  alt={row.original.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white/70">
                  {row.original.name?.slice(0, 1)?.toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-white">{row.original.name}</p>
              <p className="text-xs text-white/45">{row.original.email}</p>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("phone", {
        header: "Phone",
        cell: (info) => info.getValue() || "-",
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ row }) => {
          const toneMap = {
            active: "bg-emerald-500/10 text-emerald-300",
            inactive: "bg-amber-500/10 text-amber-300",
            banned: "bg-rose-500/10 text-rose-300",
          };

          return (
            <span className={`rounded-[8px] px-3 py-1 text-xs font-semibold ${toneMap[row.original.status]}`}>
              {row.original.status}
            </span>
          );
        },
      }),
      columnHelper.accessor("role", {
        header: "Role",
        cell: ({ row }) => (
          <span className="rounded-[8px] bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-white/75">
            {row.original.role}
          </span>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: "Joined",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setViewUser(row.original)}
              className="btn-secondary px-4 py-2"
            >
              <Eye size={16} />
            </button>
            <button
              type="button"
              onClick={() => startEditing(row.original)}
              className="btn-secondary px-4 py-2"
            >
              <PencilLine size={16} />
            </button>
            <button
              type="button"
              onClick={() =>
                setPendingRoleChange({
                  userId: row.original._id,
                  role: row.original.role === "admin" ? "customer" : "admin",
                  status: row.original.status,
                  name: row.original.name,
                  email: row.original.email,
                  phone: row.original.phone,
                  avatar: row.original.avatar,
                  shippingAddress: row.original.shippingAddress,
                })
              }
              className="rounded-[10px] border border-amber-500/20 px-4 py-2 text-amber-300 transition hover:bg-amber-500/10"
            >
              <ShieldAlert size={16} />
            </button>
            <button
              type="button"
              onClick={() => setPendingDeleteUser(row.original)}
              disabled={row.original.role === "admin"}
              className="rounded-[10px] border border-rose-500/20 px-4 py-2 text-rose-300 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/25"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      }),
    ],
    []
  );

  return (
    <section className="space-y-4">
      <div className="panel p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">
              User Management
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              Control users, roles, and account status
            </h2>
          </div>

          <button type="button" onClick={openCreateModal} className="btn-primary gap-2">
            <Plus size={16} />
            Add User
          </button>
        </div>
        {isLoading ? <p className="mt-2 text-sm text-white/45">Refreshing users...</p> : null}
      </div>

      <StatusMessage type="error" message={error} />

      <AdminDataTable columns={columns} data={users} emptyMessage="No users found." />

      <AppModal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        title={editingUserId ? "Edit user" : "Add user"}
        description="Create or update user information with profile, address, role, and status details."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <StatusMessage type="error" message={error} />

          <div className="panel-muted space-y-3 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
              <ImagePlus size={16} />
              Profile image
            </div>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-full bg-white/10">
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt={formData.name || "Profile preview"}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <label className="btn-secondary cursor-pointer gap-2">
                {uploadLoading ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <ImagePlus size={16} />
                )}
                {uploadLoading ? "Uploading..." : "Upload image"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadLoading}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full name"
              className="field"
              required
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
              className="field"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone number"
              className="field"
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={editingUserId ? "Leave blank to keep password" : "Temporary password"}
              className="field"
              required={!editingUserId}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <select name="role" value={formData.role} onChange={handleChange} className="field">
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="field"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="banned">Banned</option>
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Receiver name"
              className="field"
            />
            <input
              name="shippingPhone"
              value={formData.shippingPhone}
              onChange={handleChange}
              placeholder="Receiver phone"
              className="field"
            />
          </div>

          <input
            name="street"
            value={formData.street}
            onChange={handleChange}
            placeholder="Street address"
            className="field"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <input
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              className="field"
            />
            <input
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="State / Province"
              className="field"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <input
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="Postal code"
              className="field"
            />
            <input
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Country"
              className="field"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={closeFormModal} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingUserId ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </AppModal>

      <AppModal
        isOpen={Boolean(viewUser)}
        onClose={() => setViewUser(null)}
        title={viewUser?.name || "User details"}
        description="Review core profile, access, and shipping information."
        width="max-w-xl"
      >
        {viewUser ? (
          <div className="space-y-4 text-sm text-white/80">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-full bg-white/10">
                {viewUser.avatar?.url ? (
                  <img
                    src={viewUser.avatar.url}
                    alt={viewUser.name}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div>
                <p className="text-lg font-bold text-white">{viewUser.name}</p>
                <p className="text-white/60">{viewUser.email}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="panel-muted p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/40">Access</p>
                <p className="mt-2">Role: {viewUser.role}</p>
                <p>Status: {viewUser.status}</p>
                <p>Phone: {viewUser.phone || "-"}</p>
              </div>
              <div className="panel-muted p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/40">Shipping</p>
                <p className="mt-2">{viewUser.shippingAddress?.fullName || "-"}</p>
                <p>{viewUser.shippingAddress?.phone || "-"}</p>
                <p>{viewUser.shippingAddress?.street || "-"}</p>
                <p>
                  {viewUser.shippingAddress?.city || "-"},{" "}
                  {viewUser.shippingAddress?.state || "-"}
                </p>
                <p>
                  {viewUser.shippingAddress?.postalCode || "-"},{" "}
                  {viewUser.shippingAddress?.country || "-"}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </AppModal>

      <ConfirmModal
        isOpen={Boolean(pendingDeleteUser)}
        onClose={() => setPendingDeleteUser(null)}
        onConfirm={confirmDelete}
        title="Delete user?"
        description={
          pendingDeleteUser?.role === "admin"
            ? "Admin users cannot be deleted."
            : `This will permanently remove ${pendingDeleteUser?.name || "this user"} from the system.`
        }
        confirmLabel="Delete user"
      />

      <ConfirmModal
        isOpen={Boolean(pendingRoleChange)}
        onClose={() => setPendingRoleChange(null)}
        onConfirm={confirmRoleChange}
        tone="primary"
        title="Change user role?"
        description={`You are about to change ${pendingRoleChange?.name || "this user"} to ${pendingRoleChange?.role || "a different role"}. This is a sensitive action.`}
        confirmLabel="Update role"
      />
    </section>
  );
}

export default AdminUsersPage;
