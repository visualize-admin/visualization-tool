import { useRef } from "react";

const useChange = (val: $IntentionalAny, message: string) => {
  const ref = useRef();
  if (val !== ref.current && ref.current !== undefined) {
    console.log("change", val, message);
  }
  ref.current = val;
};

export default useChange;
