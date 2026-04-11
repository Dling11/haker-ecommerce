import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchCurrentUser } from "../../features/auth/authSlice";
import { fetchCart, resetCartState } from "../../features/cart/cartSlice";

function AppBootstrap() {
  const dispatch = useDispatch();
  const { token, user, isInitialized } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && !isInitialized) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, token, isInitialized]);

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    } else {
      dispatch(resetCartState());
    }
  }, [dispatch, user]);

  return null;
}

export default AppBootstrap;
