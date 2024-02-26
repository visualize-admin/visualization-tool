import * as React from "react";
function SvgIcChevronUp(props: React.SVGProps<SVGSVGElement>) {
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
          d="M12 10.707L17.5 16l1.5-1.5L12 8l-7 6.5L6.5 16z"
        />
      </g>
    </svg>
  );
}
export default SvgIcChevronUp;
