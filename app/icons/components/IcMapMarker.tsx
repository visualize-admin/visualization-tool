import * as React from "react";
function SvgIcMapMarker(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.613 12.485l5.26 8.426 5.278-8.459a5.874 5.874 0 10-10.538.033zm1.64-6.24a5.13 5.13 0 013.622-1.503 5.13 5.13 0 014.624 7.345l-4.624 7.406L7.27 12.12a5.13 5.13 0 01.983-5.875zm3.617 5.917a2.292 2.292 0 110-4.585 2.292 2.292 0 010 4.585zm-.857-3.574a1.544 1.544 0 012.139 2.139 1.543 1.543 0 11-2.139-2.139z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcMapMarker;
