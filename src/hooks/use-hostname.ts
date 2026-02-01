import { useState, useEffect } from "react";

/**
 * Custom hook to get the current hostname
 * Sets hostname on client side only to avoid hydration mismatch
 * @param defaultHostname - Default hostname to use before client-side hydration
 * @returns The current hostname
 */
export const useHostname = (defaultHostname: string = "bharatlinks.in"): string => {
  const [hostname, setHostname] = useState(defaultHostname);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Set hostname on client side only to avoid hydration mismatch
      // This is a valid use case for setState in effect (initializing client-side state)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHostname(window.location.hostname);
    }
  }, []);

  return hostname;
};
