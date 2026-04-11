import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import StatusMessage from "../components/common/StatusMessage";
import { loginUser } from "../features/auth/authSlice";
import getPostLoginPath from "../utils/getPostLoginPath";

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const redirectPath = location.state?.from?.pathname;

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await dispatch(loginUser(formData));

    if (loginUser.fulfilled.match(result)) {
      toast.success("Welcome back.");
      navigate(redirectPath || getPostLoginPath(result.payload.user), { replace: true });
    }
  };

  return (
    <section>
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/80">
          Welcome Back
        </p>
        <h1 className="text-3xl font-black text-white">Login to your account</h1>
        <p className="text-sm leading-6 text-white/65">
          Use your email and password to access your cart, orders, and profile.
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
          <span className="text-sm font-semibold text-white/80">Password</span>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-[10px] border border-white/10 bg-[#11151c] px-4 py-3 pr-12 text-sm text-white outline-none transition focus:border-cyan-400"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-white/55"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-white px-5 py-3 font-semibold text-[#11151c] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/40"
        >
          {isLoading ? (
            <>
              <LoaderCircle size={18} className="animate-spin" />
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </button>
      </form>

      <p className="mt-6 text-sm text-white/65">
        New here?{" "}
        <Link to="/register" className="font-semibold text-cyan-300">
          Create an account
        </Link>
      </p>
    </section>
  );
}

export default LoginPage;
