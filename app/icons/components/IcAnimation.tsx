import * as React from "react";
function SvgIcAnimation(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M16 14H8v-1h8v1zM16 17H8v-1h8v1z" fill="currentColor" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 6.891L19.799 3 20 4.109 4.201 8 4 6.891z"
        fill="currentColor"
      />
      <path d="M20 21H4V9h16v12zM5 20h14V10H5v10z" fill="currentColor" />
    </svg>
  );
}
export default SvgIcAnimation;
