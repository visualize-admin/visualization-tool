import * as React from "react";
function SvgIcSort(props: React.SVGProps<SVGSVGElement>) {
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
        d="M21 6H3v1h18V6zm-2 4H5v1h14v-1zM7 14h10v1H7v-1zm8 4H9v1h6v-1z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcSort;
