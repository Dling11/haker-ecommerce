import { Eye, EyeOff, LoaderCircle, Mail } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import StatusMessage from "../components/common/StatusMessage";
import { forgotPassword, resetPassword } from "../features/auth/authSlice";

function ResetPasswordPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoading, error, pendingPasswordResetEmail } = useSelector((state) => state.auth);
  const { settings } = useSelector((state) => state.site);

  const initialEmail = useMemo(
    () => searchParams.get("email") || pendingPasswordResetEmail || "",
    [pendingPasswordResetEmail, searchParams]
  );
  const isEmailSystemDisabled = settings?.emailSystemEnabled === false;

  const [requestEmail, setRequestEmail] = useState(initialEmail);
  const [formData, setFormData] = useState({
    email: initialEmail,
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [hasRequestedCode, setHasRequestedCode] = useState(Boolean(initialEmail));
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    setRequestEmail(initialEmail);
    setFormData((current) => ({
      ...current,
      email: initialEmail,
    }));
    setHasRequestedCode(Boolean(initialEmail));
  }, [initialEmail]);

  useEffect(() => {
    if (resendCountdown <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setResendCountdown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCountdown]);

  const handleRequestCode = async (event) => {
    event.preventDefault();
    const result = await dispatch(forgotPassword({ email: requestEmail }));

    if (forgotPassword.fulfilled.match(result)) {
      const email = result.payload.email || requestEmail;
      setFormData((current) => ({
        ...current,
        email,
      }));
      setHasRequestedCode(true);
      toast.success("If the account exists, a reset code has been sent.");
      setResendCountdown(result.payload.resendCooldownSeconds || 60);
    } else {
      toast.error(result.payload || "Failed to send reset code.");
    }
  };

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    const result = await dispatch(
      resetPassword({
        email: formData.email,
        otp: formData.otp.toUpperCase(),
        newPassword: formData.newPassword,
      })
    );

    if (resetPassword.fulfilled.match(result)) {
      toast.success("Password reset successfully. Please log in.");
      navigate("/login", { replace: true });
    } else {
      toast.error(result.payload || "Failed to reset password.");
    }
  };

  return (
    <section>
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/80">
          Password Recovery
        </p>
        <h1 className="text-3xl font-black text-white">Reset your password</h1>
        <p className="text-sm leading-6 text-white/65">
          Request a reset code by email, then use that code here to set a brand-new
          password.
        </p>
      </div>

      <div className="mt-8 space-y-6">
        <form onSubmit={handleRequestCode} className="space-y-4 rounded-[10px] border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-white/85">
            <Mail size={16} />
            Request reset code
          </div>

          <StatusMessage type="error" message={error} />
          {isEmailSystemDisabled ? (
            <StatusMessage
              type="info"
              message="Password recovery is temporarily unavailable while the email system is turned off."
            />
          ) : null}

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-white/80">Email</span>
            <input
              type="email"
              value={requestEmail}
              onChange={(event) => setRequestEmail(event.target.value)}
              className="w-full rounded-[10px] border border-white/10 bg-[#11151c] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
              placeholder="Enter your email address"
              required
            />
          </label>

          <button
            type="submit"
            disabled={isLoading || resendCountdown > 0 || isEmailSystemDisabled}
            className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:text-white/35"
          >
            {isLoading ? <LoaderCircle size={18} className="animate-spin" /> : null}
            {resendCountdown > 0 ? `Request again in ${resendCountdown}s` : "Send reset code"}
          </button>
        </form>

        {hasRequestedCode ? (
          <form onSubmit={handleSubmit} className="space-y-5 rounded-[10px] border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-white/65">
              Resetting password for{" "}
              <span className="font-semibold text-white">{formData.email}</span>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-white/80">Reset code</span>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    otp: event.target.value.toUpperCase(),
                  }))
                }
                className="w-full rounded-[10px] border border-white/10 bg-[#11151c] px-4 py-3 text-center text-lg font-semibold tracking-[0.28em] text-white outline-none transition focus:border-cyan-400"
                placeholder="AB12CD34"
                maxLength={8}
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-white/80">New password</span>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full rounded-[10px] border border-white/10 bg-[#11151c] px-4 py-3 pr-12 text-sm text-white outline-none transition focus:border-cyan-400"
                  placeholder="Enter a new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((value) => !value)}
                  className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-white/55"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-white/80">Confirm new password</span>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full rounded-[10px] border border-white/10 bg-[#11151c] px-4 py-3 pr-12 text-sm text-white outline-none transition focus:border-cyan-400"
                  placeholder="Confirm your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-white/55"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={isLoading || isEmailSystemDisabled}
              className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-white px-5 py-3 font-semibold text-[#11151c] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/40"
            >
              {isLoading ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Resetting password...
                </>
              ) : (
                "Save new password"
              )}
            </button>
          </form>
        ) : null}
      </div>

      <p className="mt-6 text-sm text-white/65">
        Back to{" "}
        <Link to="/login" className="font-semibold text-cyan-300">
          login
        </Link>
      </p>
    </section>
  );
}

export default ResetPasswordPage;
