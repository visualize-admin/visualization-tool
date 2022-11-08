import { useCallback, useState } from "react";

const useDisclosure = (initialState?: boolean) => {
  const [isOpen, setOpen] = useState(initialState || false);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  return {
    isOpen,
    close,
    open,
    setOpen,
  };
};

export default useDisclosure;
