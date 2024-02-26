import * as React from "react";
function SvgIcWarning(props: React.SVGProps<SVGSVGElement>) {
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
          d="M12 4.125l8.25 15.75H3.75L12 4.125zm0 1.5l-7.125 13.5h14.25L12 5.625zm0 10.5a.75.75 0 110 1.5.75.75 0 010-1.5zm.375-6v4.5h-.75v-4.5h.75z"
        />
      </g>
    </svg>
  );
}
export default SvgIcWarning;
