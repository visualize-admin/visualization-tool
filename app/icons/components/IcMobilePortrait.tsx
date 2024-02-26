import * as React from "react";
function SvgIcMobilePortrait(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
    >
      <g fill="none" fillRule="evenodd">
        <path d="M0 0h24v24H0z" />
        <path
          fill="currentColor"
          d="M15 3a2 2 0 012 2v14a2 2 0 01-2 2H9a2 2 0 01-2-2V5a2 2 0 012-2h6zm-2.5 16h-1a.5.5 0 100 1h1a.5.5 0 100-1zM16 5H8v13h8V5z"
        />
      </g>
    </svg>
  );
}
export default SvgIcMobilePortrait;
