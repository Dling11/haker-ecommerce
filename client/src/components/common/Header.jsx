import { Fragment, useEffect, useMemo, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
  ChevronDown,
  Heart,
  Layers3,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Package,
  ShoppingCart,
  UserCircle2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { logoutUser } from "../../features/auth/authSlice";
import { toggleCartDrawer } from "../../features/cart/cartSlice";
import getPostLoginPath from "../../utils/getPostLoginPath";

function Header() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { settings } = useSelector((state) => state.site);
  const [hasAvatarError, setHasAvatarError] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const cartCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const wishlistCount = wishlistItems.length || 0;
  const firstName = useMemo(() => user?.name?.trim().split(" ")[0] || "", [user?.name]);
  const avatarUrl = useMemo(() => {
    if (!user?.avatar) {
      return "";
    }

    if (typeof user.avatar === "string") {
      return user.avatar;
    }

    return user.avatar.url || "";
  }, [user?.avatar]);
  const userInitials = useMemo(() => {
    if (!user?.name) {
      return "H";
    }

    return user.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [user?.name]);

  useEffect(() => {
    setHasAvatarError(false);
  }, [avatarUrl]);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    const result = await dispatch(logoutUser());

    if (logoutUser.fulfilled.match(result)) {
      toast.success("Signed out successfully.");
    } else {
      toast.error(result.payload || "Failed to sign out.");
    }

    setIsLoggingOut(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-violet-200/60 bg-[linear-gradient(135deg,#5b43cc_0%,#6f53ef_40%,#8d74ff_100%)] shadow-[0_16px_36px_rgba(91,67,204,0.22)] backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link to={user ? getPostLoginPath(user) : "/shop"} className="flex items-center gap-3">
            <div>
              <p className="font-display text-lg font-bold tracking-[0.22em] text-white">
                HAKER
              </p>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-white/70">
                Ecommerce
              </p>
            </div>
          </Link>
          {settings?.allowCollections !== false ? (
            <Link
              to="/shop/collections"
              className="hidden items-center gap-2 rounded-[10px] px-3 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10 hover:text-white md:inline-flex"
            >
              <Layers3 size={16} />
              Collections
            </Link>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          {user && settings?.allowWishlist !== false ? (
            <Link
              to="/shop/wishlist"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-white/18 bg-white text-violet-700 shadow-sm transition hover:bg-violet-50"
              aria-label="Wishlist"
            >
              <Heart size={17} />
              <span className="absolute -right-2 -top-2 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {wishlistCount}
              </span>
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => dispatch(toggleCartDrawer())}
            className="relative inline-flex items-center gap-2 rounded-[10px] border border-white/18 bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 shadow-sm transition hover:bg-violet-50"
          >
            <ShoppingCart size={17} />
            <span className="hidden sm:inline">Cart</span>
            <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-violet-600 px-2 py-0.5 text-xs font-bold text-white">
              {cartCount}
            </span>
          </button>

          {user ? (
            <Menu as="div" className="relative">
              <Menu.Button className="inline-flex items-center gap-3 rounded-[10px] border border-white/16 bg-white/10 px-3 py-2 text-left text-white transition hover:bg-white/14">
                {avatarUrl && !hasAvatarError ? (
                  <img
                    src={avatarUrl}
                    alt={user.name}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-white/15"
                    onError={() => setHasAvatarError(true)}
                  />
                ) : (
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/16 text-sm font-bold text-white ring-2 ring-white/15">
                    {userInitials}
                  </span>
                )}

                <span className="hidden min-w-0 sm:block">
                  <span className="block truncate text-sm font-semibold text-white">
                    {firstName || "Account"}
                  </span>
                  <span className="block truncate text-xs text-white/65">
                    {user.role === "admin" ? "Administrator" : "My account"}
                  </span>
                </span>

                <ChevronDown size={16} className="text-white/70" />
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition duration-150 ease-out"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition duration-100 ease-in"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-3 w-64 origin-top-right rounded-[10px] border border-violet-100 bg-white p-2 text-slate-900 shadow-[0_24px_60px_rgba(46,26,110,0.18)] focus:outline-none">
                  <div className="border-b border-slate-100 px-3 py-3">
                    <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>

                  <div className="py-2">
                    {user.role === "admin" ? (
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/admin"
                            className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium ${
                              active ? "bg-violet-50 text-violet-700" : "text-slate-700"
                            }`}
                          >
                            <LayoutDashboard size={17} />
                            Admin Dashboard
                          </Link>
                        )}
                      </Menu.Item>
                    ) : null}

                    {settings?.allowWishlist !== false ? (
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/shop/wishlist"
                            className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium ${
                              active ? "bg-violet-50 text-violet-700" : "text-slate-700"
                            }`}
                          >
                            <Heart size={17} />
                            Wishlist
                          </Link>
                        )}
                      </Menu.Item>
                    ) : null}

                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/shop/profile"
                          className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium ${
                            active ? "bg-violet-50 text-violet-700" : "text-slate-700"
                          }`}
                        >
                          <UserCircle2 size={17} />
                          Profile
                        </Link>
                      )}
                    </Menu.Item>

                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/shop/orders"
                          className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium ${
                            active ? "bg-violet-50 text-violet-700" : "text-slate-700"
                          }`}
                        >
                          <Package size={17} />
                          Orders
                        </Link>
                      )}
                    </Menu.Item>
                  </div>

                  <div className="border-t border-slate-100 pt-2">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          type="button"
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className={`flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium disabled:cursor-not-allowed ${
                            active ? "bg-rose-50 text-rose-600" : "text-rose-500"
                          }`}
                        >
                          {isLoggingOut ? (
                            <LoaderCircle size={17} className="animate-spin" />
                          ) : (
                            <LogOut size={17} />
                          )}
                          {isLoggingOut ? "Signing out..." : "Logout"}
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-[10px] px-4 py-2.5 text-sm font-semibold text-white/85 transition hover:bg-white/10 hover:text-white"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-[10px] bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 shadow-sm transition hover:bg-violet-50"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
