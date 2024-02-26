import * as React from "react";
function SvgIcRemove(props: React.SVGProps<SVGSVGElement>) {
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
          d="M18.588 4L20 5.412 13.412 12 20 18.588 18.588 20 12 13.412 5.412 20 4 18.588 10.588 12 4 5.412 5.412 4 12 10.588z"
        />
      </g>
    </svg>
  );
}
export default SvgIcRemove;
