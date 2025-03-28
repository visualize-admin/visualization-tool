import * as React from "react";
function SvgIcMessage(props: React.SVGProps<SVGSVGElement>) {
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
        d="M7.205 15.505V19l4.897-3.495H20V5H4v10.505h3.205zm.718-.758H4.72V5.758h14.553v8.99h-7.398l-3.95 2.819v-2.82z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 9H8V8h8v1zM16 12H8v-1h8v1z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcMessage;
