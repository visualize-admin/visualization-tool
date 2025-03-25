import * as React from "react";
function SvgIcListBullet(props: React.SVGProps<SVGSVGElement>) {
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
        d="M5 7a1 1 0 100-2 1 1 0 000 2zM5 13a1 1 0 100-2 1 1 0 000 2zM5 18a1 1 0 100-2 1 1 0 000 2zM8 6h12v1.176H8V6zM8 11.172h12v1.176H8v-1.176zM8 16.344h12v1.175H8v-1.175z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcListBullet;
