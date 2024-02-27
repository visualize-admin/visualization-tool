import * as React from "react";
function SvgIcImage(props: React.SVGProps<SVGSVGElement>) {
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
          d="M22 2v20H2V2h20zm-2 2H4v16h.584L16 8.586l4 3.999V4zm-4 7.414L7.414 20H20v-4.585l-4-4zM8.5 6a2.5 2.5 0 110 5 2.5 2.5 0 010-5zm0 2a.5.5 0 100 1 .5.5 0 000-1z"
        />
      </g>
    </svg>
  );
}
export default SvgIcImage;
