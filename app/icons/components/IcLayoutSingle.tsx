import * as React from "react";
function SvgIcLayoutSingle(props: React.SVGProps<SVGSVGElement>) {
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
        d="M3 9h14v11H3V9zm1 1v9h12v-9H4zm0-2h14v11h1V7H4v1zm2-2h14v11h1V5H6v1z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcLayoutSingle;
