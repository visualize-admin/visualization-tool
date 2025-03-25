import * as React from "react";
function SvgIcFolder(props: React.SVGProps<SVGSVGElement>) {
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
        d="M4 18.519h16.582V6.749H8.032V5H4v13.519zm15.833-.75H4.75V5.75h2.532v1.749h12.551v10.27z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcFolder;
