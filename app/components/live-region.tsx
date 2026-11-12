import { useEffect, useRef, useState } from "react";

import { VisuallyHidden } from "@/components/visually-hidden";

const DEFAULT_DELAY_MS = 500;

export const LiveRegion = ({
  message,
  delay = DEFAULT_DELAY_MS,
}: {
  message: string;
  delay?: number;
}) => {
  const announcement = useDebouncedAnnouncement({ message, delay });

  return (
    <VisuallyHidden
      component="span"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {announcement}
    </VisuallyHidden>
  );
};

const useDebouncedAnnouncement = ({
  message,
  delay,
}: {
  message: string;
  delay: number;
}) => {
  const [announcement, setAnnouncement] = useState("");
  const initialMessageRef = useRef<string | null>(message);

  useEffect(() => {
    if (message === initialMessageRef.current) {
      return;
    }

    initialMessageRef.current = null;
    const timeout = setTimeout(() => setAnnouncement(message), delay);

    return () => clearTimeout(timeout);
  }, [message, delay]);

  return announcement;
};
