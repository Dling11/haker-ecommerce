import { createColumnHelper } from "@tanstack/react-table";
import {
  EyeOff,
  Eye,
  ImagePlus,
  LoaderCircle,
  PencilLine,
  Plus,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import AdminDataTable from "../../components/admin/AdminDataTable";
import AppModal from "../../components/common/AppModal";
import ConfirmModal from "../../components/common/ConfirmModal";
import PaginationControls from "../../components/common/PaginationControls";
import StatusMessage from "../../components/common/StatusMessage";
import {
  clearUploadedImage,
  createAdminUser,
  deleteAdminUser,
  fetchUsers,
  updateUserManagement,
  uploadAdminImage,
} from "../../features/admin/adminSlice";
import useDebouncedValue from "../../hooks/useDebouncedValue";

const columnHelper = createColumnHelper();

const initialFormState = {
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "customer",
  status: "active",
  avatar: "",
  avatarPublicId: "",
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
  const { users, usersPagination, isLoading, error, uploadLoading, uploadedImage } = useSelector(
    (state) => state.admin
  );
  const [formData, setFormData] = useState(initialFormState);
  const [editingUserId, setEditingUserId] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [pendingDeleteUser, setPendingDeleteUser] = useState(null);
  const [pendingRoleChange, setPendingRoleChange] = useState(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [page, setPage] = useState(1);
  const currentEditingUser = users.find((user) => user._id === editingUserId);
  const debouncedSearch = useDebouncedValue(searchTerm, 300);

  useEffect(() => {
    dispatch(
      fetchUsers({
        keyword: debouncedSearch,
        role: roleFilter,
        status: statusFilter,
        sort: sortOption,
        page,
      })
    );
  }, [debouncedSearch, dispatch, page, roleFilter, sortOption, statusFilter]);

  useEffect(() => {
    if (uploadedImage?.url) {
      setFormData((current) => ({
        ...current,
        avatar: uploadedImage.url,
        avatarPublicId: uploadedImage.publicId,
      }));
      toast.success("Profile image uploaded.");
      dispatch(clearUploadedImage());
    }
  }, [dispatch, uploadedImage]);

  const resetForm = () => {
    setEditingUserId(null);
    setShowPassword(false);
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
      avatarPublicId: user.avatar?.publicId || "",
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
      publicId: formData.avatarPublicId || "",
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
    setIsDeletingUser(true);
    const result = await dispatch(deleteAdminUser(pendingDeleteUser._id));

    if (deleteAdminUser.fulfilled.match(result)) {
      toast.success("User deleted successfully.");
      setPendingDeleteUser(null);
    } else {
      toast.error(result.payload || "Failed to delete user.");
    }

    setIsDeletingUser(false);
  };

  const confirmRoleChange = async () => {
    setIsUpdatingRole(true);
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

    setIsUpdatingRole(false);
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

      <div className="panel p-4">
        <div className="grid gap-4 xl:grid-cols-4">
          <label className="space-y-2 xl:col-span-2">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-white/75">
              <Search size={16} />
              Search users
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email, or phone"
              className="field"
            />
          </label>

          <label className="space-y-2">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-white/75">
              <SlidersHorizontal size={16} />
              Filter role
            </span>
            <select
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value);
                setPage(1);
              }}
              className="field"
            >
              <option value="all">All roles</option>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
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
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="banned">Banned</option>
            </select>
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
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
              <option value="email_az">Email A-Z</option>
            </select>
          </label>

          <div className="flex items-end">
            <p className="text-sm text-white/45">
              Showing {users.length} users on this page
            </p>
          </div>
        </div>
      </div>

      <StatusMessage type="error" message={error} />

      <AdminDataTable columns={columns} data={users} emptyMessage="No users found." />
      <PaginationControls pagination={usersPagination} onPageChange={setPage} />

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
            <label className="space-y-2">
              <span className="text-sm font-semibold text-white/75">Full name</span>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                className="field"
                required
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-white/75">Email address</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className="field"
                required
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-white/75">Phone number</span>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="field"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-white/75">
                {editingUserId ? "Change password" : "Temporary password"}
              </span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={
                    editingUserId
                      ? "Leave blank to keep current password"
                      : "Enter temporary password"
                  }
                  className="field pr-12"
                  required={!editingUserId}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-white/55"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs leading-5 text-white/45">
                {editingUserId
                  ? "For security, current passwords cannot be viewed. Enter a new one only if you want to replace it."
                  : "Set the password the user will use on first login."}
              </p>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-white/75">Role</span>
              <select name="role" value={formData.role} onChange={handleChange} className="field">
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-white/75">Status</span>
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
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-white/75">Receiver name</span>
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter receiver name"
                className="field"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-white/75">Receiver phone</span>
              <input
                name="shippingPhone"
                value={formData.shippingPhone}
                onChange={handleChange}
                placeholder="Enter receiver phone"
                className="field"
              />
            </label>
          </div>

          <label className="space-y-2 block">
            <span className="text-sm font-semibold text-white/75">Street address</span>
            <input
              name="street"
              value={formData.street}
              onChange={handleChange}
              placeholder="Enter street address"
              className="field"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-white/75">City</span>
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city"
                className="field"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-white/75">State / Province</span>
              <input
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Enter state or province"
                className="field"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-white/75">Postal code</span>
              <input
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="Enter postal code"
                className="field"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-white/75">Country</span>
              <input
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Enter country"
                className="field"
              />
            </label>
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
        loadingLabel="Deleting..."
        isLoading={isDeletingUser}
      />

      <ConfirmModal
        isOpen={Boolean(pendingRoleChange)}
        onClose={() => setPendingRoleChange(null)}
        onConfirm={confirmRoleChange}
        tone="primary"
        title="Change user role?"
        description={`You are about to change ${pendingRoleChange?.name || "this user"} to ${pendingRoleChange?.role || "a different role"}. This is a sensitive action.`}
        confirmLabel="Update role"
        loadingLabel="Updating..."
        isLoading={isUpdatingRole}
      />
    </section>
  );
}

export default AdminUsersPage;
