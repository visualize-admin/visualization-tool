import * as React from "react";

function SvgIcArrowTop(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g fill="none" fillRule="evenodd">
        <path d="M0 0h24v24H0z" />
        <path
          d="M12.71 19V9.711L18 15l1.414-1.414L11.828 6H20V4H4v2h7.586L4 13.586 5.414 15l5.296-5.295V19h2z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}

export default SvgIcArrowTop;
