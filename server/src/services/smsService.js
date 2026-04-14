const CLICKSEND_BASE_URL = "https://rest.clicksend.com/v3";

const getClickSendUsername = () => (process.env.CLICKSEND_USERNAME || "").trim();
const getClickSendApiKey = () => (process.env.CLICKSEND_API_KEY || "").trim();
const getClickSendSenderId = () => (process.env.CLICKSEND_SENDER_ID || "").trim();

const ensureSmsConfigured = () => {
  if (!getClickSendUsername() || !getClickSendApiKey()) {
    throw new Error("SMS service is not configured.");
  }
};

const normalizePhilippinePhone = (value = "") => {
  const trimmed = String(value).trim();

  if (!trimmed) {
    return "";
  }

  const digits = trimmed.replace(/[^\d+]/g, "");

  if (digits.startsWith("+63")) {
    return `+63${digits.slice(3).replace(/\D/g, "")}`;
  }

  if (digits.startsWith("63")) {
    return `+${digits.replace(/\D/g, "")}`;
  }

  if (digits.startsWith("09")) {
    return `+63${digits.slice(1).replace(/\D/g, "")}`;
  }

  return digits.startsWith("+") ? digits : `+${digits.replace(/\D/g, "")}`;
};

const sendClickSendSms = async ({ number, message }) => {
  ensureSmsConfigured();

  const basicAuth = Buffer.from(
    `${getClickSendUsername()}:${getClickSendApiKey()}`
  ).toString("base64");
  const senderId = getClickSendSenderId();

  const response = await fetch(`${CLICKSEND_BASE_URL}/sms/send`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [
        {
          source: "nodejs",
          to: number,
          body: message,
          from: senderId || undefined,
        },
      ],
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const messageText =
      data?.message ||
      data?.error ||
      data?.response_msg ||
      "SMS request failed.";
    throw new Error(messageText);
  }

  const messageStatus = String(data?.data?.messages?.[0]?.status || "").toUpperCase();
  const acceptedStatuses = new Set([
    "SUCCESS",
    "QUEUED",
    "MESSAGE QUEUED",
    "MESSAGES QUEUED FOR DELIVERY.",
    "QUEUED FOR DELIVERY",
  ]);
  const rejectedStatuses = new Set([
    "INVALID_SENDER_ID",
    "INVALID_RECIPIENT",
    "INVALID_NUMBER",
    "FAILED",
    "ERROR",
  ]);
  const responseMessage = String(data?.response_msg || "").toUpperCase();
  const isQueuedResponse = responseMessage.includes("QUEUED");

  if (messageStatus && rejectedStatuses.has(messageStatus)) {
    throw new Error(
      data?.data?.messages?.[0]?.custom_string ||
        data?.data?.messages?.[0]?.status ||
        data?.response_msg ||
        "ClickSend rejected the SMS message."
    );
  }

  if ((messageStatus && !acceptedStatuses.has(messageStatus)) && !isQueuedResponse) {
    throw new Error(
      data?.data?.messages?.[0]?.custom_string ||
        data?.response_msg ||
        "ClickSend rejected the SMS message."
    );
  }

  return data;
};

const buildOrderStatusSmsText = ({ order, userName }) => {
  const orderCode = order._id.toString().slice(-6).toUpperCase();
  const name = userName || "there";

  const messages = {
    out_for_delivery: `HAKER: Hi ${name}, order ${orderCode} is out for delivery.`,
    delivered: `HAKER: Hi ${name}, order ${orderCode} was delivered. Thank you for shopping with us.`,
    cancelled: `HAKER: Hi ${name}, order ${orderCode} was cancelled. Contact support if needed.`,
  };

  return messages[order.orderStatus] || "";
};

const sendOrderStatusSms = async ({ order, user, phone }) => {
  const message = buildOrderStatusSmsText({
    order,
    userName: user?.name,
  });

  if (!message) {
    return null;
  }

  const normalizedPhone = normalizePhilippinePhone(phone || user?.phone || "");

  if (!normalizedPhone) {
    throw new Error("No customer phone number is available for SMS.");
  }

  return sendClickSendSms({
    number: normalizedPhone,
    message,
  });
};

module.exports = {
  normalizePhilippinePhone,
  sendOrderStatusSms,
};
