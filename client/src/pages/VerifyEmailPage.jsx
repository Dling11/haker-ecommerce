import { LoaderCircle, RotateCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import StatusMessage from "../components/common/StatusMessage";
import {
  resendVerificationOtp,
  verifyEmail,
} from "../features/auth/authSlice";
import getPostLoginPath from "../utils/getPostLoginPath";

function VerifyEmailPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoading, error, pendingVerificationEmail } = useSelector((state) => state.auth);

  const initialEmail = useMemo(
    () => searchParams.get("email") || pendingVerificationEmail || "",
    [pendingVerificationEmail, searchParams]
  );

  const [formData, setFormData] = useState({
    email: initialEmail,
    otp: "",
  });
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    setFormData((current) => ({
      ...current,
      email: initialEmail,
    }));
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

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await dispatch(
      verifyEmail({
        email: formData.email,
        otp: formData.otp,
      })
    );

    if (verifyEmail.fulfilled.match(result)) {
      toast.success("Email verified successfully.");
      navigate(getPostLoginPath(result.payload.user), { replace: true });
    }
  };

  const handleResend = async () => {
    const result = await dispatch(resendVerificationOtp({ email: formData.email }));

    if (resendVerificationOtp.fulfilled.match(result)) {
      toast.success("A new verification code has been sent.");
      setResendCountdown(result.payload.resendCooldownSeconds || 60);
    }
  };

  return (
    <section>
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/80">
          Email Verification
        </p>
        <h1 className="text-3xl font-black text-white">Verify your email</h1>
        <p className="text-sm leading-6 text-white/65">
          Enter the 6-digit code sent during registration to activate your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <StatusMessage type="error" message={error} />

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-white/80">Email</span>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-[10px] border border-white/10 bg-[#11151c] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
            placeholder="Enter your email address"
            required
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-white/80">Verification code</span>
          <input
            type="text"
            name="otp"
            value={formData.otp}
            onChange={handleChange}
            className="w-full rounded-[10px] border border-white/10 bg-[#11151c] px-4 py-3 text-center text-lg font-semibold tracking-[0.35em] text-white outline-none transition focus:border-cyan-400"
            placeholder="123456"
            maxLength={6}
            required
          />
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-white px-5 py-3 font-semibold text-[#11151c] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/40"
        >
          {isLoading ? (
            <>
              <LoaderCircle size={18} className="animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Email"
          )}
        </button>
      </form>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={handleResend}
          disabled={isLoading || resendCountdown > 0 || !formData.email}
          className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-white/10 px-4 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:text-white/35"
        >
          <RotateCw size={16} />
          {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend code"}
        </button>

        <div className="text-right text-sm text-white/55">
          Already verified?{" "}
          <Link to="/login" className="font-semibold text-cyan-300">
            Go to login
          </Link>
        </div>
      </div>
    </section>
  );
}

export default VerifyEmailPage;
