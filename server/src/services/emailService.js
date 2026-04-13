const { Resend } = require("resend");

const { formatCurrency } = require("../utils/formatCurrency");

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const getFromEmail = () => process.env.RESEND_FROM_EMAIL || "";

const ensureEmailConfigured = () => {
  if (!resend || !getFromEmail()) {
    throw new Error("Email service is not configured.");
  }
};

const buildVerificationEmailHtml = ({ name, otp, expiryMinutes }) => `
  <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #0f172a;">
    <h1 style="font-size: 24px; margin-bottom: 16px;">Verify your email</h1>
    <p style="font-size: 15px; line-height: 1.7; color: #334155;">
      Hi ${name || "there"}, use the verification code below to activate your haker-ecommerce account.
    </p>
    <div style="margin: 24px 0; border-radius: 12px; background: #f5f3ff; padding: 20px; text-align: center;">
      <p style="margin: 0 0 8px; font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; color: #7c3aed;">
        Verification Code
      </p>
      <p style="margin: 0; font-size: 34px; font-weight: 700; letter-spacing: 0.2em; color: #4c1d95;">
        ${otp}
      </p>
    </div>
    <p style="font-size: 14px; line-height: 1.7; color: #475569;">
      This code expires in ${expiryMinutes} minutes. If you did not create an account, you can ignore this email.
    </p>
  </div>
`;

const buildOrderConfirmationEmailHtml = ({ user, order }) => {
  const itemsHtml = order.orderItems
    .map(
      (item) => `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">${item.name}</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">${formatCurrency(
            item.price * item.quantity
          )}</td>
        </tr>
      `
    )
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #0f172a;">
      <h1 style="font-size: 24px; margin-bottom: 16px;">Order confirmed</h1>
      <p style="font-size: 15px; line-height: 1.7; color: #334155;">
        Hi ${user.name}, thanks for shopping with haker-ecommerce. Your order has been received and is now in our system.
      </p>
      <div style="margin: 24px 0; border-radius: 12px; background: #f8fafc; padding: 20px;">
        <p style="margin: 0 0 8px; font-size: 14px; color: #475569;"><strong>Order ID:</strong> ${order._id}</p>
        <p style="margin: 0 0 8px; font-size: 14px; color: #475569;"><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
        <p style="margin: 0; font-size: 14px; color: #475569;"><strong>Total:</strong> ${formatCurrency(
          order.totalPrice
        )}</p>
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr>
            <th style="text-align: left; padding-bottom: 12px; font-size: 13px; text-transform: uppercase; color: #64748b;">Product</th>
            <th style="text-align: center; padding-bottom: 12px; font-size: 13px; text-transform: uppercase; color: #64748b;">Qty</th>
            <th style="text-align: right; padding-bottom: 12px; font-size: 13px; text-transform: uppercase; color: #64748b;">Subtotal</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <div style="border-radius: 12px; background: #f8fafc; padding: 20px;">
        <p style="margin: 0 0 8px; font-size: 14px; color: #475569;"><strong>Ship to:</strong> ${order.shippingAddress.fullName}</p>
        <p style="margin: 0 0 8px; font-size: 14px; color: #475569;">${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state || ""} ${order.shippingAddress.postalCode || ""}</p>
        <p style="margin: 0; font-size: 14px; color: #475569;">${order.shippingAddress.country} | ${order.shippingAddress.phone}</p>
      </div>
    </div>
  `;
};

const sendVerificationOtpEmail = async ({ to, name, otp, expiryMinutes }) => {
  ensureEmailConfigured();

  await resend.emails.send({
    from: getFromEmail(),
    to,
    subject: "Verify your haker-ecommerce account",
    html: buildVerificationEmailHtml({ name, otp, expiryMinutes }),
  });
};

const sendOrderConfirmationEmail = async ({ to, user, order }) => {
  ensureEmailConfigured();

  await resend.emails.send({
    from: getFromEmail(),
    to,
    subject: `Order confirmation - ${order._id.toString().slice(-6).toUpperCase()}`,
    html: buildOrderConfirmationEmailHtml({ user, order }),
  });
};

module.exports = {
  sendOrderConfirmationEmail,
  sendVerificationOtpEmail,
};
