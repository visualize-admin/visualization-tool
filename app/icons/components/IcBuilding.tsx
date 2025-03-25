import * as React from "react";
function SvgIcBuilding(props: React.SVGProps<SVGSVGElement>) {
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
        d="M13.986 11.753V5.974L12.002 3.99l-1.984 1.984v2.2H4.649V19.3h14.706v-7.547h-5.369zm6.069-.7V20H3.949V7.474h5.369v-1.79L12.002 3l2.684 2.684v5.369h5.369z"
        fill="currentColor"
      />
      <path
        fill="currentColor"
        d="M11.107 5.688h1.789v1.789h-1.789zM11.107 9.266h1.789v1.789h-1.789zM11.107 12.844h1.789v1.789h-1.789zM11.107 16.422h1.789v1.789h-1.789zM16.476 16.422h1.789v1.789h-1.789zM16.476 12.844h1.789v1.789h-1.789zM5.739 12.844h1.789v1.789H5.739zM5.739 16.422h1.789v1.789H5.739zM5.739 9.266h1.789v1.789H5.739z"
      />
    </svg>
  );
}
export default SvgIcBuilding;
