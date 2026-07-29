import { useEffect, useState } from "react";

export function useIsEmbedded() {
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    // Check if the current window is not the top window
    try {
      setIsEmbedded(window.self !== window.top);
    } catch (e) {
      // If reading window.top throws a security error, it means we are in a cross-origin iframe - fallback for legacy browsers
      setIsEmbedded(true);
    }
  }, []);

  return isEmbedded;
}
