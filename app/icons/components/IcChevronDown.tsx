import * as React from "react";
function SvgIcChevronDown(props: React.SVGProps<SVGSVGElement>) {
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
          d="M12 13.293L6.5 8 5 9.5l7 6.5 7-6.5L17.5 8z"
        />
      </g>
    </svg>
  );
}
export default SvgIcChevronDown;
