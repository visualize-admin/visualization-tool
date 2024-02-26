import * as React from "react";
function SvgIcMapRegions(props: React.SVGProps<SVGSVGElement>) {
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
          d="M11 13v9H2v-9h9zm11 0v9h-9v-9h9zM9 15H4v5h5v-5zm11 0h-5v5h5v-5zm2-13v9h-9V2h9zM11 2v9H2V2h9zm9 2h-5v5h5V4z"
        />
      </g>
    </svg>
  );
}
export default SvgIcMapRegions;
