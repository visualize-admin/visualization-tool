import * as React from "react";
function SvgIcUnfold(props: React.SVGProps<SVGSVGElement>) {
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
        <path fill="currentColor" d="M16 14l-4 4-4-4h8zm-4-8l4 4H8l4-4z" />
      </g>
    </svg>
  );
}
export default SvgIcUnfold;
