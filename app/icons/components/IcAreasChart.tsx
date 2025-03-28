import * as React from "react";
function SvgIcAreasChart(props: React.SVGProps<SVGSVGElement>) {
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
        d="M3 4h.687v15.22H21V20H3V4z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.546 16.25L9.773 15 5 17.25V18h15v-4l-5.454 2.25zm4.798-1.229l-4.755 1.961-4.756-1.245L6.517 17.3h12.827v-2.279z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.773 13.897l4.773 1.724L20 12.517V7l-5.454 5.172-4.773-1.379L5 15.621V17l4.773-3.103zM6.122 15.45l3.57-2.322 4.795 1.732 4.857-2.764V8.56l-4.628 4.388-4.76-1.375-3.834 3.879z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcAreasChart;
