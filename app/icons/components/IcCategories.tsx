import * as React from "react";
function SvgIcCategories(props: React.SVGProps<SVGSVGElement>) {
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
        d="M4 4h4.82l10.376 10.375-.245.265-4.306 4.445-.266.273L4 8.98V4zm.75 4.669l9.62 9.621 1.561-1.61 2.219-2.29-9.64-9.64H4.75v3.919z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.135 5.8a1.5 1.5 0 111.667 2.494A1.5 1.5 0 016.135 5.8zm.556 1.663a.5.5 0 10.556-.832.5.5 0 00-.556.832z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcCategories;
