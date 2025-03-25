import * as React from "react";
function SvgIcReset(props: React.SVGProps<SVGSVGElement>) {
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
        d="M14 2h1v7h7v1h-8V2zm-4 12H2v1h7v7h1v-8zm-1-4V2H8v7H2v1h7zm5 4v8h1v-7h7v-1h-8z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcReset;
