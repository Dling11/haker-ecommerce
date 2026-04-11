import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { logoutUser } from "../../features/auth/authSlice";
import getPostLoginPath from "../../utils/getPostLoginPath";

function Header() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);

  return (
    <header className="border-b border-white/10 bg-[#0f141bcc] backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link to={user ? getPostLoginPath(user) : "/login"} className="font-display text-xl font-bold tracking-[0.28em] text-white">
          haker-ecommerce
        </Link>

        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-white/70">
          <Link to="/shop">Home</Link>
          {user ? <Link to="/shop/orders">Orders</Link> : null}
          {user ? <Link to="/shop/profile">Profile</Link> : null}
          {user?.role === "admin" ? <Link to="/admin">Admin</Link> : null}
          {!user ? <Link to="/login">Login</Link> : null}
          {!user ? <Link to="/register">Register</Link> : null}
          <Link to="/shop/cart" className="rounded-[10px] bg-white px-4 py-2 text-sm font-semibold text-[#0f141b] transition hover:bg-white/90">
            Cart ({cart.items?.length || 0})
          </Link>
          {user ? (
            <button
              type="button"
              onClick={() => dispatch(logoutUser())}
              className="rounded-[10px] border border-white/10 px-4 py-2 text-white/75"
            >
              Logout
            </button>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

export default Header;
