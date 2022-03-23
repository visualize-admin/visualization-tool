import { useCallback, useState } from "react";

const useDisclosure = () => {
  const [isOpen, setOpen] = useState(false);
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
