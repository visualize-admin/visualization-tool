import * as React from "react";
function SvgIcNext(props: React.SVGProps<SVGSVGElement>) {
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
          d="M6.5 20.256V3.744l7.512 7.512V3h3v18h-3v-8.256z"
        />
      </g>
    </svg>
  );
}
export default SvgIcNext;
