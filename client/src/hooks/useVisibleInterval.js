import { useEffect, useRef } from "react";

function useVisibleInterval(callback, delay) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (typeof callbackRef.current !== "function" || !delay) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        callbackRef.current();
      }
    }, delay);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [delay]);
}

export default useVisibleInterval;
