import * as React from "react";

function SvgIcLayoutTab(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.714 2H2v3h5.714V2zM22 7H2v15h20V7zM9.14 2h5.715v3H9.14V2zm12.863 0H16.29v3h5.714V2z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgIcLayoutTab;
