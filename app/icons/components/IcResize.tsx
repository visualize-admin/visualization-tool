import * as React from "react";
function SvgIcResize(props: React.SVGProps<SVGSVGElement>) {
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
          d="M23.625 1.875v20.25H.375V1.875h23.25zm-.75 6H1.125v13.5h21.75v-13.5zm0-5.25H1.125v4.5h21.75v-4.5zM6.488 14.357l2.247-2.247a.375.375 0 01.561.495l-.03.035-1.61 1.61h8.688l-1.61-1.61a.375.375 0 01-.03-.495l.03-.035a.375.375 0 01.496-.031l.035.03 2.515 2.516-2.515 2.515a.375.375 0 01-.561-.495l.03-.035 1.61-1.61H7.656l1.61 1.61a.375.375 0 01.03.495l-.03.035a.375.375 0 01-.496.031l-.035-.03-2.515-2.516 2.515-2.515-2.247 2.247zM5.735 4.61a.375.375 0 11.53.53.375.375 0 01-.53-.53zm-1.5 0a.375.375 0 11.53.53.375.375 0 01-.53-.53zm-1.5 0a.375.375 0 11.53.53.375.375 0 01-.53-.53z"
        />
      </g>
    </svg>
  );
}
export default SvgIcResize;
