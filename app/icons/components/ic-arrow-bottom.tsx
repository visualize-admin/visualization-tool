import * as React from "react";

function SvgIcArrowBottom(props: React.SVGProps<SVGSVGElement>) {
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
          d="M12.71 4v9.289L18 8l1.414 1.414L11.828 17H20v2H4v-2h7.586L4 9.414 5.414 8l5.296 5.295V4h2z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}

export default SvgIcArrowBottom;
