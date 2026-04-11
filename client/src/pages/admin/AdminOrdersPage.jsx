import { createColumnHelper } from "@tanstack/react-table";
import { Eye, PencilLine, Plus, Search, SlidersHorizontal, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import AdminDataTable from "../../components/admin/AdminDataTable";
import AppModal from "../../components/common/AppModal";
import ConfirmModal from "../../components/common/ConfirmModal";
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

const initialFormState = {
  userId: "",
  productId: "",
  quantity: 1,
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
  const { orders, users, isLoading, error } = useSelector((state) => state.admin);
  const { adminItems } = useSelector((state) => state.products);
  const [formData, setFormData] = useState(initialFormState);
  const [editingOrder, setEditingOrder] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);
  const [pendingDeleteOrder, setPendingDeleteOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeletingOrder, setIsDeletingOrder] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const debouncedSearch = useDebouncedValue(searchTerm, 300);

  useEffect(() => {
    dispatch(fetchAdminOrders());
    dispatch(fetchUsers());
    dispatch(fetchAdminProducts());
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
      productId: order.orderItems?.[0]?.product || "",
      quantity: order.orderItems?.[0]?.quantity || 1,
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!editingOrder && (!formData.userId || !formData.productId)) {
      toast.error("Please select both a customer and a product.");
      return;
    }

    const payload = {
      userId: formData.userId,
      productId: formData.productId,
      quantity: Number(formData.quantity),
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
            shippingAddress: payload.shippingAddress,
            paymentMethod: payload.paymentMethod,
            paymentStatus: payload.paymentStatus,
            orderStatus: payload.orderStatus,
            gcashReference: payload.gcashReference,
            notes: payload.notes,
          })
        )
      : await dispatch(createAdminOrder(payload));

    if (createAdminOrder.fulfilled.match(result) || updateAdminOrder.fulfilled.match(result)) {
      toast.success(editingOrder ? "Order updated successfully." : "Order created successfully.");
      closeModal();
    } else if (createAdminOrder.rejected.match(result) || updateAdminOrder.rejected.match(result)) {
      toast.error(result.payload || "Failed to save order.");
    }
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

  const filteredOrders = useMemo(() => {
    const normalizedSearch = debouncedSearch.trim().toLowerCase();

    let nextItems = orders.filter((order) => {
      const matchesSearch =
        !normalizedSearch ||
        `${order._id} ${order.user?.name || ""} ${order.user?.email || ""}`
          .toLowerCase()
          .includes(normalizedSearch);
      const matchesPayment =
        paymentFilter === "all" || order.paymentMethod === paymentFilter;
      const matchesStatus =
        statusFilter === "all" || order.orderStatus === statusFilter;

      return matchesSearch && matchesPayment && matchesStatus;
    });

    nextItems = [...nextItems].sort((left, right) => {
      switch (sortOption) {
        case "oldest":
          return new Date(left.createdAt) - new Date(right.createdAt);
        case "total_high":
          return right.totalPrice - left.totalPrice;
        case "total_low":
          return left.totalPrice - right.totalPrice;
        default:
          return new Date(right.createdAt) - new Date(left.createdAt);
      }
    });

    return nextItems;
  }, [debouncedSearch, orders, paymentFilter, sortOption, statusFilter]);

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
            <div>
              <span
                className={`rounded-[8px] px-3 py-1 text-xs font-semibold ${statusClassName(
                  row.original.paymentStatus
                )}`}
              >
                {row.original.paymentStatus}
              </span>
            </div>
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
        {isLoading ? <p className="mt-2 text-sm text-white/45">Refreshing orders...</p> : null}
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
              onChange={(event) => setSearchTerm(event.target.value)}
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
              onChange={(event) => setPaymentFilter(event.target.value)}
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
              onChange={(event) => setStatusFilter(event.target.value)}
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
              onChange={(event) => setSortOption(event.target.value)}
              className="field"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="total_high">Highest total</option>
              <option value="total_low">Lowest total</option>
            </select>
          </label>

          <div className="flex items-end">
            <p className="text-sm text-white/45">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
          </div>
        </div>
      </div>

      <StatusMessage type="error" message={error} />

      <AdminDataTable columns={columns} data={filteredOrders} emptyMessage="No orders found." />

      <AppModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingOrder ? "Edit order" : "Create order"}
        description="Manage shipping details, payment method, and fulfillment status from one place."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <StatusMessage type="error" message={error} />

          {!editingOrder ? (
            <div className="grid gap-4 sm:grid-cols-2">
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

              <SearchableSelect
                label="Product"
                placeholder="Search product by name or category"
                options={productOptions}
                value={formData.productId}
                onChange={(value) =>
                  setFormData((current) => ({
                    ...current,
                    productId: value,
                  }))
                }
                emptyMessage="No matching products found."
              />
            </div>
          ) : (
            <div className="panel-muted p-4 text-sm text-white/70">
              Line items are kept stable during admin edits. For a different customer or
              product selection, create a new order instead.
            </div>
          )}

          {!editingOrder ? (
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-white/80">Quantity</span>
              <input
                type="number"
                min="1"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Enter order quantity"
                className="field"
                required
              />
            </label>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-white/80">Receiver name</span>
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter receiver full name"
                className="field"
                required
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-white/80">Receiver phone</span>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter receiver phone number"
                className="field"
                required
              />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-white/80">Street address</span>
            <input
              name="street"
              value={formData.street}
              onChange={handleChange}
              placeholder="Enter street address"
              className="field"
              required
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-white/80">City</span>
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city"
                className="field"
                required
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-white/80">State / Province</span>
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
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-white/80">Postal code</span>
              <input
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="Enter postal code"
                className="field"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-white/80">Country</span>
              <input
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Enter country"
                className="field"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-white/80">Payment method</span>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="field"
              >
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-white/80">Payment status</span>
              <select
                name="paymentStatus"
                value={formData.paymentStatus}
                onChange={handleChange}
                className="field"
              >
                {paymentStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-white/80">Order status</span>
              <select
                name="orderStatus"
                value={formData.orderStatus}
                onChange={handleChange}
                className="field"
              >
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
              <input
                name="gcashReference"
                value={formData.gcashReference}
                onChange={handleChange}
                placeholder="Enter GCash reference"
                className="field"
              />
            </label>
          ) : null}

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-white/80">Notes</span>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              placeholder="Add any internal note or delivery instruction"
              className="field"
            />
          </label>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={closeModal} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingOrder ? "Save Changes" : "Create Order"}
            </button>
          </div>
        </form>
      </AppModal>

      <AppModal
        isOpen={Boolean(viewOrder)}
        onClose={() => setViewOrder(null)}
        title={
          viewOrder ? `Order #${viewOrder._id.slice(-6).toUpperCase()}` : "Order details"
        }
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
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-14 w-14 rounded-[10px] object-cover"
                    />
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
