const crypto = require("crypto");

const OTP_EXPIRY_MINUTES = Number(process.env.EMAIL_OTP_EXPIRES_MINUTES || 10);
const OTP_RESEND_COOLDOWN_SECONDS = Number(process.env.EMAIL_OTP_RESEND_COOLDOWN_SECONDS || 60);
const PASSWORD_RESET_EXPIRY_MINUTES = Number(
  process.env.PASSWORD_RESET_OTP_EXPIRES_MINUTES || 15
);
const PASSWORD_RESET_RESEND_COOLDOWN_SECONDS = Number(
  process.env.PASSWORD_RESET_OTP_RESEND_COOLDOWN_SECONDS || 60
);
const PASSWORD_RESET_CODE_CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const hashOtp = (otp) => crypto.createHash("sha256").update(String(otp)).digest("hex");

const generateEmailOtp = () => String(crypto.randomInt(100000, 1000000));
const generatePasswordResetOtp = (length = 8) =>
  Array.from({ length }, () => {
    const index = crypto.randomInt(0, PASSWORD_RESET_CODE_CHARSET.length);
    return PASSWORD_RESET_CODE_CHARSET[index];
  }).join("");

const assignEmailVerificationOtp = (user) => {
  const otp = generateEmailOtp();
  const now = new Date();

  user.emailVerificationOtpHash = hashOtp(otp);
  user.emailVerificationOtpExpiresAt = new Date(
    now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000
  );
  user.emailVerificationOtpLastSentAt = now;

  return otp;
};

const isOtpExpired = (user) =>
  !user.emailVerificationOtpExpiresAt || user.emailVerificationOtpExpiresAt.getTime() < Date.now();

const isOtpValid = (user, otp) =>
  Boolean(user.emailVerificationOtpHash) && user.emailVerificationOtpHash === hashOtp(otp);

const getOtpResendCooldownRemaining = (user) => {
  if (!user.emailVerificationOtpLastSentAt) {
    return 0;
  }

  const availableAt =
    user.emailVerificationOtpLastSentAt.getTime() + OTP_RESEND_COOLDOWN_SECONDS * 1000;

  return Math.max(0, Math.ceil((availableAt - Date.now()) / 1000));
};

const clearEmailVerificationOtp = (user) => {
  user.emailVerificationOtpHash = "";
  user.emailVerificationOtpExpiresAt = null;
  user.emailVerificationOtpLastSentAt = null;
};

const assignPasswordResetOtp = (user) => {
  const otp = generatePasswordResetOtp();
  const now = new Date();

  user.passwordResetOtpHash = hashOtp(otp);
  user.passwordResetOtpExpiresAt = new Date(
    now.getTime() + PASSWORD_RESET_EXPIRY_MINUTES * 60 * 1000
  );
  user.passwordResetOtpLastSentAt = now;

  return otp;
};

const isPasswordResetOtpExpired = (user) =>
  !user.passwordResetOtpExpiresAt || user.passwordResetOtpExpiresAt.getTime() < Date.now();

const isPasswordResetOtpValid = (user, otp) =>
  Boolean(user.passwordResetOtpHash) && user.passwordResetOtpHash === hashOtp(otp);

const getPasswordResetCooldownRemaining = (user) => {
  if (!user.passwordResetOtpLastSentAt) {
    return 0;
  }

  const availableAt =
    user.passwordResetOtpLastSentAt.getTime() +
    PASSWORD_RESET_RESEND_COOLDOWN_SECONDS * 1000;

  return Math.max(0, Math.ceil((availableAt - Date.now()) / 1000));
};

const clearPasswordResetOtp = (user) => {
  user.passwordResetOtpHash = "";
  user.passwordResetOtpExpiresAt = null;
  user.passwordResetOtpLastSentAt = null;
};

module.exports = {
  OTP_EXPIRY_MINUTES,
  OTP_RESEND_COOLDOWN_SECONDS,
  PASSWORD_RESET_EXPIRY_MINUTES,
  PASSWORD_RESET_RESEND_COOLDOWN_SECONDS,
  assignEmailVerificationOtp,
  assignPasswordResetOtp,
  clearEmailVerificationOtp,
  clearPasswordResetOtp,
  getOtpResendCooldownRemaining,
  getPasswordResetCooldownRemaining,
  isOtpExpired,
  isOtpValid,
  isPasswordResetOtpExpired,
  isPasswordResetOtpValid,
};
