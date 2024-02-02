import * as React from "react";

function SvgIcLayoutSingleURLs(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1m"
      {...props}
    >
      <path
        fill="currentColor"
        fill-rule="evenodd"
        d="M21.9994 17.9824V4H4.9375V5L21.1068 4.99937V17.9824H21.9994ZM19.9994 6V19.9824H19.1068V6.99937L2.9375 7V6H19.9994ZM2 7.98438H18V20.9844H2V7.98438Z"
      />
    </svg>
  );
}

export default SvgIcLayoutSingleURLs;
