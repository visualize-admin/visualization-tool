import * as React from "react";

function SvgIcLayoutTall(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 2H22V12H2V2ZM13 14H22V22H13V14ZM11 14H2V22H11V14Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgIcLayoutTall;
