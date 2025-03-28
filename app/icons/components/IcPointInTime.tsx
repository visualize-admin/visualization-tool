import * as React from "react";
function SvgIcPointInTime(props: React.SVGProps<SVGSVGElement>) {
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
        d="M9.6 6H8.4v1.2H6V18h12V7.2h-2.4V6h-1.2v1.2H9.6V6zM7.2 9.6V8.4h9.6v1.2H7.2zm0 7.2v-6h9.6v6H7.2z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcPointInTime;
