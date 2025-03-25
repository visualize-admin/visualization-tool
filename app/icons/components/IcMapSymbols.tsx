import * as React from "react";
function SvgIcMapSymbols(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 6.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm8 3a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zM14 15a5 5 0 11-10 0 5 5 0 0110 0zm-3-8.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm5.5 5.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM9 19a4 4 0 100-8 4 4 0 000 8z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcMapSymbols;
