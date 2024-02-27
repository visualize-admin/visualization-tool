import * as React from "react";
function SvgIcArrowTop(props: React.SVGProps<SVGSVGElement>) {
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
          d="M12.71 19V9.711L18 15l1.414-1.414L11.828 6H20V4H4v2h7.586L4 13.586 5.414 15l5.296-5.295V19h2z"
        />
      </g>
    </svg>
  );
}
export default SvgIcArrowTop;
