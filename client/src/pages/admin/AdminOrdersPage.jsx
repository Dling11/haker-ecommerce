import { createColumnHelper } from "@tanstack/react-table";
import { Eye, LoaderCircle, PencilLine, Plus, Search, SlidersHorizontal, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import AdminDataTable from "../../components/admin/AdminDataTable";
import AppModal from "../../components/common/AppModal";
import ConfirmModal from "../../components/common/ConfirmModal";
import PaginationControls from "../../components/common/PaginationControls";
import SearchableSelect from "../../components/common/SearchableSelect";
import StatusMessage from "../../components/common/StatusMessage";
import {
  createAdminOrder,
  deleteAdminOrder,
  fetchAdminOrders,
  fetchUsers,
  updateAdminOrder,
} from "../../features/admin/adminSlice";
import { fetchAdminProducts } from "../../features/products/productSlice";
import useDebouncedValue from "../../hooks/useDebouncedValue";
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
const paymentMethods = ["cod", "gcash"];

const createEmptyOrderItem = () => ({
  productId: "",
  quantity: 1,
});

const initialFormState = {
  userId: "",
  orderItems: [createEmptyOrderItem()],
  fullName: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "Philippines",
  paymentMethod: "cod",
  paymentStatus: "pending",
  orderStatus: "pending",
  gcashReference: "",
  notes: "",
};

function AdminOrdersPage() {
  const dispatch = useDispatch();
  const { orders, users, ordersPagination, isLoading, error } = useSelector(
    (state) => state.admin
  );
  const { adminItems } = useSelector((state) => state.products);
  const [formData, setFormData] = useState(initialFormState);
  const [editingOrder, setEditingOrder] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);
  const [pendingDeleteOrder, setPendingDeleteOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeletingOrder, setIsDeletingOrder] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [page, setPage] = useState(1);
  const [hasRequestedOrders, setHasRequestedOrders] = useState(false);
  const debouncedSearch = useDebouncedValue(searchTerm, 300);

  useEffect(() => {
    setHasRequestedOrders(true);
    dispatch(
      fetchAdminOrders({
        keyword: debouncedSearch,
        paymentMethod: paymentFilter,
        orderStatus: statusFilter,
        sort: sortOption,
        page,
      })
    );
  }, [debouncedSearch, dispatch, page, paymentFilter, sortOption, statusFilter]);

  useEffect(() => {
    dispatch(fetchUsers({ limit: 100 }));
    dispatch(fetchAdminProducts({ limit: 100 }));
  }, [dispatch]);

  const resetForm = () => {
    setEditingOrder(null);
    setFormData(initialFormState);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const startEditing = (order) => {
    setEditingOrder(order);
    setFormData({
      userId: order.user?._id || "",
      orderItems: order.orderItems.map((item) => ({
        productId: item.product,
        quantity: item.quantity,
      })),
      fullName: order.shippingAddress?.fullName || "",
      phone: order.shippingAddress?.phone || "",
      street: order.shippingAddress?.street || "",
      city: order.shippingAddress?.city || "",
      state: order.shippingAddress?.state || "",
      postalCode: order.shippingAddress?.postalCode || "",
      country: order.shippingAddress?.country || "Philippines",
      paymentMethod: order.paymentMethod || "cod",
      paymentStatus: order.paymentStatus || "pending",
      orderStatus: order.orderStatus || "pending",
      gcashReference: order.gcashReference || "",
      notes: order.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleOrderItemChange = (index, patch) => {
    setFormData((current) => ({
      ...current,
      orderItems: current.orderItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      ),
    }));
  };

  const addOrderItemRow = () => {
    setFormData((current) => ({
      ...current,
      orderItems: [...current.orderItems, createEmptyOrderItem()],
    }));
  };

  const removeOrderItemRow = (index) => {
    setFormData((current) => ({
      ...current,
      orderItems: current.orderItems.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSavingOrder(true);

    if (!editingOrder && !formData.userId) {
      toast.error("Please select a customer.");
      setIsSavingOrder(false);
      return;
    }

    if (
      !editingOrder &&
      formData.orderItems.some((item) => !item.productId || Number(item.quantity) < 1)
    ) {
      toast.error("Please complete each product line before creating the order.");
      setIsSavingOrder(false);
      return;
    }

    const payload = {
      userId: formData.userId,
      shippingAddress: {
        fullName: formData.fullName,
        phone: formData.phone,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
      },
      paymentMethod: formData.paymentMethod,
      paymentStatus: formData.paymentStatus,
      orderStatus: formData.orderStatus,
      gcashReference: formData.gcashReference,
      notes: formData.notes,
    };

    const result = editingOrder
      ? await dispatch(
          updateAdminOrder({
            orderId: editingOrder._id,
            ...payload,
          })
        )
      : await dispatch(
          createAdminOrder({
            ...payload,
            orderItems: formData.orderItems.map((item) => ({
              productId: item.productId,
              quantity: Number(item.quantity),
            })),
          })
        );

    if (createAdminOrder.fulfilled.match(result) || updateAdminOrder.fulfilled.match(result)) {
      toast.success(editingOrder ? "Order updated successfully." : "Order created successfully.");
      closeModal();
    } else {
      toast.error(result.payload || "Failed to save order.");
    }

    setIsSavingOrder(false);
  };

  const confirmDelete = async () => {
    setIsDeletingOrder(true);
    const result = await dispatch(deleteAdminOrder(pendingDeleteOrder._id));

    if (deleteAdminOrder.fulfilled.match(result)) {
      toast.success("Order deleted successfully.");
      setPendingDeleteOrder(null);
    } else {
      toast.error(result.payload || "Failed to delete order.");
    }

    setIsDeletingOrder(false);
  };

  const statusClassName = (status) => {
    const toneMap = {
      pending: "bg-slate-500/10 text-slate-200",
      need_payment: "bg-amber-500/10 text-amber-300",
      processing: "bg-sky-500/10 text-sky-300",
      out_for_delivery: "bg-violet-500/10 text-violet-300",
      delivered: "bg-emerald-500/10 text-emerald-300",
      cancelled: "bg-rose-500/10 text-rose-300",
      paid: "bg-emerald-500/10 text-emerald-300",
      failed: "bg-rose-500/10 text-rose-300",
    };

    return toneMap[status] || "bg-white/5 text-white/70";
  };

  const userOptions = useMemo(
    () =>
      users.map((user) => ({
        value: user._id,
        label: `${user.name} (${user.email})`,
        description: `${user.role} - ${user.status}${user.phone ? ` - ${user.phone}` : ""}`,
      })),
    [users]
  );

  const productOptions = useMemo(
    () =>
      adminItems.map((product) => ({
        value: product._id,
        label: product.name,
        description: `${product.category} - ${product.stock} in stock - ${formatCurrency(
          product.price
        )}`,
      })),
    [adminItems]
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("_id", {
        header: "Order",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold text-white">
              #{row.original._id.slice(-6).toUpperCase()}
            </p>
            <p className="text-xs text-white/45">{row.original.user?.email || "-"}</p>
          </div>
        ),
      }),
      columnHelper.accessor("user.name", {
        header: "Customer",
        cell: ({ row }) => row.original.user?.name || "-",
      }),
      columnHelper.display({
        id: "payment",
        header: "Payment",
        cell: ({ row }) => (
          <div className="space-y-2">
            <span className="rounded-[8px] bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-white/70">
              {row.original.paymentMethod}
            </span>
            <span
              className={`rounded-[8px] px-3 py-1 text-xs font-semibold ${statusClassName(
                row.original.paymentStatus
              )}`}
            >
              {row.original.paymentStatus}
            </span>
          </div>
        ),
      }),
      columnHelper.display({
        id: "orderStatus",
        header: "Order Status",
        cell: ({ row }) => (
          <span
            className={`rounded-[8px] px-3 py-1 text-xs font-semibold ${statusClassName(
              row.original.orderStatus
            )}`}
          >
            {row.original.orderStatus.replaceAll("_", " ")}
          </span>
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
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setViewOrder(row.original)}
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
              onClick={() => setPendingDeleteOrder(row.original)}
              className="rounded-[10px] border border-rose-500/20 px-4 py-2 text-rose-300 transition hover:bg-rose-500/10"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      }),
    ],
    []
  );

  const isOrdersInitialLoading = !hasRequestedOrders || (isLoading && orders.length === 0);
  const isOrdersRefreshing = hasRequestedOrders && isLoading && orders.length > 0;

  return (
    <section className="space-y-4">
      <div className="panel p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">
              Order Management
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              Track payments, delivery flow, and admin-created orders
            </h2>
          </div>

          <button type="button" onClick={openCreateModal} className="btn-primary gap-2">
            <Plus size={16} />
            Create Order
          </button>
        </div>
        {isOrdersRefreshing ? (
          <div className="mt-3 inline-flex items-center gap-2 text-sm text-white/50">
            <LoaderCircle size={16} className="animate-spin" />
            Refreshing orders...
          </div>
        ) : null}
      </div>

      <div className="panel p-4">
        <div className="grid gap-4 xl:grid-cols-4">
          <label className="space-y-2 xl:col-span-2">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-white/75">
              <Search size={16} />
              Search orders
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(1);
              }}
              placeholder="Search by order id, customer name, or email"
              className="field"
            />
          </label>

          <label className="space-y-2">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-white/75">
              <SlidersHorizontal size={16} />
              Filter payment
            </span>
            <select
              value={paymentFilter}
              onChange={(event) => {
                setPaymentFilter(event.target.value);
                setPage(1);
              }}
              className="field"
            >
              <option value="all">All payment methods</option>
              <option value="cod">COD</option>
              <option value="gcash">GCash</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-white/75">
              <SlidersHorizontal size={16} />
              Filter order status
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
              {orderStatuses.map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ")}
                </option>
              ))}
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
              <option value="oldest">Oldest first</option>
              <option value="total_high">Highest total</option>
              <option value="total_low">Lowest total</option>
            </select>
          </label>

          <div className="flex items-end">
            <p className="text-sm text-white/45">Showing {orders.length} orders on this page</p>
          </div>
        </div>
      </div>

      <StatusMessage type="error" message={error} />

      {isOrdersInitialLoading ? (
        <div className="flex min-h-[18rem] flex-col items-center justify-center gap-4 rounded-[1.75rem] border border-white/60 bg-surface-panel/90 px-6 text-center shadow-panel">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-500/10 text-accent-600">
            <LoaderCircle size={24} className="animate-spin" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-ink-700">Fetching orders</p>
            <p className="text-sm text-ink-500">
              We&apos;re loading the latest payment and fulfillment activity now.
            </p>
          </div>
        </div>
      ) : (
        <AdminDataTable columns={columns} data={orders} emptyMessage="No orders found." />
      )}
      <PaginationControls pagination={ordersPagination} onPageChange={setPage} />

      <AppModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingOrder ? "Edit order" : "Create order"}
        description="Manage shipping details, payment method, and fulfillment status from one place."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <StatusMessage type="error" message={error} />

          {!editingOrder ? (
            <>
              <SearchableSelect
                label="Customer"
                placeholder="Search customer by name or email"
                options={userOptions}
                value={formData.userId}
                onChange={(value) =>
                  setFormData((current) => ({
                    ...current,
                    userId: value,
                  }))
                }
                emptyMessage="No matching users found."
              />

              <div className="space-y-3 rounded-[10px] border border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white/80">Order items</p>
                  <button type="button" onClick={addOrderItemRow} className="btn-secondary px-4 py-2">
                    Add item
                  </button>
                </div>

                {formData.orderItems.map((item, index) => (
                  <div key={`order-item-${index}`} className="grid gap-3 rounded-[10px] border border-white/10 p-3 md:grid-cols-[1fr_140px_auto]">
                    <SearchableSelect
                      label={`Product ${index + 1}`}
                      placeholder="Search product by name or category"
                      options={productOptions}
                      value={item.productId}
                      onChange={(value) => handleOrderItemChange(index, { productId: value })}
                      emptyMessage="No matching products found."
                    />

                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-white/80">Quantity</span>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(event) =>
                          handleOrderItemChange(index, {
                            quantity: Number(event.target.value),
                          })
                        }
                        className="field"
                        required
                      />
                    </label>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeOrderItemRow(index)}
                        disabled={formData.orderItems.length === 1}
                        className="rounded-[10px] border border-rose-500/20 px-4 py-3 text-rose-300 disabled:cursor-not-allowed disabled:text-white/25"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="panel-muted p-4 text-sm text-white/70">
              Line items are kept stable during admin edits. For different products, create a new order.
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-white/80">Receiver name</span>
              <input name="fullName" value={formData.fullName} onChange={handleChange} className="field" required />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-white/80">Receiver phone</span>
              <input name="phone" value={formData.phone} onChange={handleChange} className="field" required />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-white/80">Street address</span>
            <input name="street" value={formData.street} onChange={handleChange} className="field" required />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-white/80">City</span>
              <input name="city" value={formData.city} onChange={handleChange} className="field" required />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-white/80">State / Province</span>
              <input name="state" value={formData.state} onChange={handleChange} className="field" />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-white/80">Postal code</span>
              <input name="postalCode" value={formData.postalCode} onChange={handleChange} className="field" />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-white/80">Country</span>
              <input name="country" value={formData.country} onChange={handleChange} className="field" />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-white/80">Payment method</span>
              <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="field">
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-white/80">Payment status</span>
              <select name="paymentStatus" value={formData.paymentStatus} onChange={handleChange} className="field">
                {paymentStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-white/80">Order status</span>
              <select name="orderStatus" value={formData.orderStatus} onChange={handleChange} className="field">
                {orderStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {formData.paymentMethod === "gcash" ? (
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-white/80">GCash reference</span>
              <input name="gcashReference" value={formData.gcashReference} onChange={handleChange} className="field" />
            </label>
          ) : null}

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-white/80">Notes</span>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows="4" className="field" />
          </label>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={closeModal} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingOrder}
              className="btn-primary gap-2 disabled:cursor-not-allowed"
            >
              {isSavingOrder ? <LoaderCircle size={16} className="animate-spin" /> : null}
              {isSavingOrder
                ? editingOrder
                  ? "Saving..."
                  : "Creating..."
                : editingOrder
                  ? "Save Changes"
                  : "Create Order"}
            </button>
          </div>
        </form>
      </AppModal>

      <AppModal
        isOpen={Boolean(viewOrder)}
        onClose={() => setViewOrder(null)}
        title={viewOrder ? `Order #${viewOrder._id.slice(-6).toUpperCase()}` : "Order details"}
        description="Review payment, shipping, and line-item details."
        width="max-w-3xl"
      >
        {viewOrder ? (
          <div className="space-y-4 text-sm text-white/80">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="panel-muted p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/40">Customer</p>
                <p className="mt-2 font-semibold text-white">{viewOrder.user?.name || "-"}</p>
                <p>{viewOrder.user?.email || "-"}</p>
              </div>
              <div className="panel-muted p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/40">Payment</p>
                <p className="mt-2">{viewOrder.paymentMethod?.toUpperCase()}</p>
                <p>Status: {viewOrder.paymentStatus}</p>
                {viewOrder.gcashReference ? <p>Ref: {viewOrder.gcashReference}</p> : null}
              </div>
              <div className="panel-muted p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/40">Fulfillment</p>
                <p className="mt-2">{viewOrder.orderStatus.replaceAll("_", " ")}</p>
                <p>Total: {formatCurrency(viewOrder.totalPrice)}</p>
              </div>
            </div>

            <div className="panel-muted p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Shipping</p>
              <p className="mt-2">{viewOrder.shippingAddress?.fullName}</p>
              <p>{viewOrder.shippingAddress?.phone}</p>
              <p>{viewOrder.shippingAddress?.street}</p>
              <p>
                {viewOrder.shippingAddress?.city}, {viewOrder.shippingAddress?.state}
              </p>
              <p>
                {viewOrder.shippingAddress?.postalCode}, {viewOrder.shippingAddress?.country}
              </p>
            </div>

            <div className="panel-muted p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Items</p>
              <div className="mt-3 space-y-3">
                {viewOrder.orderItems.map((item) => (
                  <div key={`${item.product}-${item.name}`} className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="h-14 w-14 rounded-[10px] object-cover" />
                    <div className="flex-1">
                      <p className="font-semibold text-white">{item.name}</p>
                      <p className="text-white/50">
                        {item.quantity} x {formatCurrency(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </AppModal>

      <ConfirmModal
        isOpen={Boolean(pendingDeleteOrder)}
        onClose={() => setPendingDeleteOrder(null)}
        onConfirm={confirmDelete}
        title="Delete order?"
        description={`This will permanently remove order #${pendingDeleteOrder?._id?.slice(-6)?.toUpperCase() || ""}. Stock will be restored for its items.`}
        confirmLabel="Delete order"
        loadingLabel="Deleting..."
        isLoading={isDeletingOrder}
      />
    </section>
  );
}

export default AdminOrdersPage;
