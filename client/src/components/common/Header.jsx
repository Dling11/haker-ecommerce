import { ShoppingCart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { logoutUser } from "../../features/auth/authSlice";
import { toggleCartDrawer } from "../../features/cart/cartSlice";
import getPostLoginPath from "../../utils/getPostLoginPath";

function Header() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);

  return (
    <header className="border-b border-violet-200/70 bg-[linear-gradient(135deg,#5b43cc_0%,#7c5cff_40%,#9a7cff_100%)] shadow-[0_14px_34px_rgba(91,67,204,0.25)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link to={user ? getPostLoginPath(user) : "/login"} className="font-display text-xl font-bold tracking-[0.28em] text-white">
          haker-ecommerce
        </Link>

        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-white/85">
          <Link to="/shop">Home</Link>
          {user ? <Link to="/shop/orders">Orders</Link> : null}
          {user ? <Link to="/shop/profile">Profile</Link> : null}
          {user?.role === "admin" ? <Link to="/admin">Admin</Link> : null}
          {!user ? <Link to="/login">Login</Link> : null}
          {!user ? <Link to="/register">Register</Link> : null}
          <button
            type="button"
            onClick={() => dispatch(toggleCartDrawer())}
            className="inline-flex items-center gap-2 rounded-[10px] bg-white px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
          >
            <ShoppingCart size={16} />
            Cart ({cart.items?.length || 0})
          </button>
          {user ? (
            <button
              type="button"
              onClick={() => dispatch(logoutUser())}
              className="rounded-[10px] border border-white/20 px-4 py-2 text-white"
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
