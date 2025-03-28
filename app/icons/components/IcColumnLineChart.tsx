import * as React from "react";
function SvgIcColumnLineChart(props: React.SVGProps<SVGSVGElement>) {
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
        d="M18 11h-.833v6h-1.709v-4h-.833v4h-1.709V8.97c.174-.144.323-.266.43-.352.495.332 1.792 1.21 2.448 1.654l.599.404L20 7.705 19.57 7l-3.218 2.651-.184-.125c-.801-.543-2.555-1.729-2.658-1.794l-.183-.116-.18.122a4.499 4.499 0 00-.23.177V7h-.833v1.597c-.376.31-.851.706-1.43 1.187l-.28.233V9h-.832v1.163l-.96-.643L6 11.252l.371.748 2.21-1.483.96.644V17H7.834v-3H7v3H5V5H4v13h16v-1h-2v-6zm-7.625 6v-5.924l.711-.59.998-.828V17h-1.71z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcColumnLineChart;
