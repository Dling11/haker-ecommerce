import { createColumnHelper } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import AdminDataTable from "../../components/admin/AdminDataTable";
import ConfirmModal from "../../components/common/ConfirmModal";
import StatusMessage from "../../components/common/StatusMessage";
import {
  fetchAdminOrders,
  updateAdminOrderStatus,
} from "../../features/admin/adminSlice";
import { formatCurrency } from "../../utils/formatCurrency";

const columnHelper = createColumnHelper();
const orderStatuses = [
  "pending",
  "need_payment",
  "processing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];
const paymentStatuses = ["pending", "paid", "failed"];

function AdminOrdersPage() {
  const dispatch = useDispatch();
  const { orders, isLoading, error } = useSelector((state) => state.admin);
  const [pendingUpdate, setPendingUpdate] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminOrders());
  }, [dispatch]);

  const confirmOrderUpdate = async () => {
    const result = await dispatch(
      updateAdminOrderStatus({
        orderId: pendingUpdate.orderId,
        orderStatus: pendingUpdate.orderStatus,
        paymentStatus: pendingUpdate.paymentStatus,
      })
    );

    if (updateAdminOrderStatus.fulfilled.match(result)) {
      toast.success(
        pendingUpdate.kind === "payment"
          ? "Payment status updated."
          : "Order status updated."
      );
      setPendingUpdate(null);
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("_id", {
        header: "Order",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold text-white">#{row.original._id.slice(-6).toUpperCase()}</p>
            <p className="text-xs text-white/45">{row.original.user?.email || "-"}</p>
          </div>
        ),
      }),
      columnHelper.accessor("user.name", {
        header: "Customer",
        cell: ({ row }) => row.original.user?.name || "-",
      }),
      columnHelper.accessor("paymentMethod", {
        header: "Payment",
        cell: ({ row }) => (
          <div className="space-y-2">
            <p className="font-semibold uppercase text-white/70">{row.original.paymentMethod}</p>
            <select
              value={row.original.paymentStatus}
              onChange={(event) =>
                setPendingUpdate({
                  kind: "payment",
                  orderId: row.original._id,
                  orderStatus: row.original.orderStatus,
                  paymentStatus: event.target.value,
                })
              }
              className="field max-w-[140px] py-2"
            >
              {paymentStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        ),
      }),
      columnHelper.accessor("orderStatus", {
        header: "Order Status",
        cell: ({ row }) => (
          <select
            value={row.original.orderStatus}
            onChange={(event) =>
              setPendingUpdate({
                kind: "order",
                orderId: row.original._id,
                orderStatus: event.target.value,
                paymentStatus: row.original.paymentStatus,
              })
            }
            className="field max-w-[180px] py-2"
          >
            {orderStatuses.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        ),
      }),
      columnHelper.accessor("totalPrice", {
        header: "Total",
        cell: (info) => formatCurrency(info.getValue()),
      }),
      columnHelper.accessor("createdAt", {
        header: "Placed",
        cell: (info) => new Date(info.getValue()).toLocaleString(),
      }),
    ],
    [dispatch]
  );

  return (
    <section className="space-y-4">
      <div className="panel p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">
          Order Management
        </p>
        <h2 className="mt-2 text-2xl font-black text-white">Control the full order lifecycle</h2>
        {isLoading ? <p className="mt-2 text-sm text-white/45">Refreshing orders...</p> : null}
      </div>

      <StatusMessage type="error" message={error} />

      <AdminDataTable columns={columns} data={orders} emptyMessage="No orders found." />

      <ConfirmModal
        isOpen={Boolean(pendingUpdate)}
        onClose={() => setPendingUpdate(null)}
        onConfirm={confirmOrderUpdate}
        tone="primary"
        title="Confirm order update?"
        description={`You are about to change the ${pendingUpdate?.kind === "payment" ? "payment" : "order"} status for order #${pendingUpdate?.orderId?.slice(-6)?.toUpperCase() || ""}.`}
        confirmLabel="Apply update"
      />
    </section>
  );
}

export default AdminOrdersPage;
