import * as React from "react";
function SvgIcStar(props: React.SVGProps<SVGSVGElement>) {
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
          d="M24 9.306l-8.292-1.205L12 .587 8.292 8.101 0 9.306l6 5.849-1.416 8.258L12 19.514l7.416 3.899L18 15.155z"
        />
      </g>
    </svg>
  );
}
export default SvgIcStar;
