import { createColumnHelper } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import AdminDataTable from "../../components/admin/AdminDataTable";
import ConfirmModal from "../../components/common/ConfirmModal";
import StatusMessage from "../../components/common/StatusMessage";
import { fetchUsers, updateUserManagement } from "../../features/admin/adminSlice";

const columnHelper = createColumnHelper();

function AdminUsersPage() {
  const dispatch = useDispatch();
  const { users, isLoading, error } = useSelector((state) => state.admin);
  const [pendingRoleChange, setPendingRoleChange] = useState(null);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const applyRoleChange = async () => {
    const result = await dispatch(updateUserManagement(pendingRoleChange));

    if (updateUserManagement.fulfilled.match(result)) {
      toast.success("User access updated.");
      setPendingRoleChange(null);
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
                <img src={row.original.avatar.url} alt={row.original.name} className="h-full w-full object-cover" />
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
      columnHelper.accessor("role", {
        header: "Role",
        cell: ({ row }) => (
          <select
            value={row.original.role}
            onChange={(event) =>
              setPendingRoleChange({
                userId: row.original._id,
                role: event.target.value,
                status: row.original.status,
                name: row.original.name,
              })
            }
            className="field max-w-[140px] py-2"
          >
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ row }) => (
          <select
            value={row.original.status || "active"}
            onChange={async (event) => {
              const result = await dispatch(
                updateUserManagement({
                  userId: row.original._id,
                  role: row.original.role,
                  status: event.target.value,
                })
              );

              if (updateUserManagement.fulfilled.match(result)) {
                toast.success("User status updated.");
              }
            }}
            className="field max-w-[140px] py-2"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="banned">Banned</option>
          </select>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: "Joined",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      }),
    ],
    [dispatch]
  );

  return (
    <section className="space-y-4">
      <div className="panel p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">
          User Management
        </p>
        <h2 className="mt-2 text-2xl font-black text-white">Control roles and account status</h2>
        {isLoading ? <p className="mt-2 text-sm text-white/45">Refreshing users...</p> : null}
      </div>

      <StatusMessage type="error" message={error} />

      <AdminDataTable columns={columns} data={users} emptyMessage="No users found." />

      <ConfirmModal
        isOpen={Boolean(pendingRoleChange)}
        onClose={() => setPendingRoleChange(null)}
        onConfirm={applyRoleChange}
        tone="primary"
        title="Change user role?"
        description={`You are about to change ${pendingRoleChange?.name || "this user"} to ${pendingRoleChange?.role || "a different role"}. This is a sensitive action.`}
        confirmLabel="Update role"
      />
    </section>
  );
}

export default AdminUsersPage;
