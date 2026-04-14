const PAYMONGO_BASE_URL = "https://api.paymongo.com/v1";

const getPaymongoSecretKey = () => (process.env.PAYMONGO_SECRET_KEY || "").trim();
const getFrontendBaseUrl = () =>
  (process.env.FRONTEND_URL ||
    process.env.CLIENT_URL?.split(",")[0] ||
    "http://localhost:5173").trim();

const getPaymongoAuthHeader = () => {
  const secretKey = getPaymongoSecretKey();

  if (!secretKey) {
    throw new Error("PayMongo is not configured.");
  }

  return `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;
};

const paymongoRequest = async ({ path, method = "GET", body }) => {
  const response = await fetch(`${PAYMONGO_BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: getPaymongoAuthHeader(),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const firstError = data?.errors?.[0];
    throw new Error(
      firstError?.detail || firstError?.code || data?.message || "PayMongo request failed."
    );
  }

  return data;
};

const buildCheckoutUrls = ({ orderId }) => {
  const baseUrl = getFrontendBaseUrl().replace(/\/$/, "");

  return {
    successUrl: `${baseUrl}/shop/checkout?payment=success&orderId=${encodeURIComponent(orderId)}`,
    cancelUrl: `${baseUrl}/shop/checkout?payment=cancelled&orderId=${encodeURIComponent(orderId)}`,
  };
};

const createGcashCheckoutSession = async ({ order, user }) => {
  const { successUrl, cancelUrl } = buildCheckoutUrls({ orderId: order._id.toString() });

  const body = {
    data: {
      attributes: {
        billing: {
          name: order.shippingAddress.fullName,
          email: user.email,
          phone: order.shippingAddress.phone,
          address: {
            line1: order.shippingAddress.street,
            city: order.shippingAddress.city,
            state: order.shippingAddress.state || order.shippingAddress.city,
            postal_code: order.shippingAddress.postalCode || "0000",
            country: "PH",
          },
        },
        send_email_receipt: false,
        show_description: true,
        show_line_items: true,
        description: `haker-ecommerce order ${order._id.toString().slice(-6).toUpperCase()}`,
        line_items: order.orderItems.map((item) => ({
          currency: "PHP",
          amount: Math.round(Number(item.price) * 100),
          name: item.name,
          quantity: item.quantity,
          description: `${item.quantity} x ${item.name}`,
          images: item.image ? [item.image] : [],
        })),
        payment_method_types: ["gcash"],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          order_id: order._id.toString(),
          user_id: user._id.toString(),
        },
      },
    },
  };

  const data = await paymongoRequest({
    path: "/checkout_sessions",
    method: "POST",
    body,
  });

  return {
    checkoutSessionId: data?.data?.id,
    checkoutUrl: data?.data?.attributes?.checkout_url,
  };
};

const retrieveCheckoutSession = async (checkoutSessionId) =>
  paymongoRequest({
    path: `/checkout_sessions/${checkoutSessionId}`,
  });

module.exports = {
  createGcashCheckoutSession,
  retrieveCheckoutSession,
};
