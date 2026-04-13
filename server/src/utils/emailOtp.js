const crypto = require("crypto");

const OTP_EXPIRY_MINUTES = Number(process.env.EMAIL_OTP_EXPIRES_MINUTES || 10);
const OTP_RESEND_COOLDOWN_SECONDS = Number(process.env.EMAIL_OTP_RESEND_COOLDOWN_SECONDS || 60);

const hashOtp = (otp) => crypto.createHash("sha256").update(String(otp)).digest("hex");

const generateEmailOtp = () => String(crypto.randomInt(100000, 1000000));

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

module.exports = {
  OTP_EXPIRY_MINUTES,
  OTP_RESEND_COOLDOWN_SECONDS,
  assignEmailVerificationOtp,
  clearEmailVerificationOtp,
  getOtpResendCooldownRemaining,
  isOtpExpired,
  isOtpValid,
};
