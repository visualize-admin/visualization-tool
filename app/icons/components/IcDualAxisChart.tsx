import * as React from "react";
function SvgIcDualAxisChart(props: React.SVGProps<SVGSVGElement>) {
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
        d="M20 5v14H4V5h1v13h14V5h1zm-2.052 6.21l-2.987 2.288-.095-.06a583.57 583.57 0 00-2.44-1.532l-.232-.136-.23.143c-.132.082-.784.583-2.295 1.751l-.617.478-1.205-.752-2.532 1.58.458.858 2.074-1.293 1.229.766.239-.148c.036-.023.607-.463.922-.707.618-.478 1.55-1.198 1.983-1.525.313.195.865.543 1.374.863l1.419.89 3.467-2.654-.532-.81zm-4.865-4.198l-.054-.014-3.644 2.337L5.81 7.041l-.5.821 4.075 2.615 3.796-2.436 4.913 1.376.122.034.248-.932-5.381-1.507z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcDualAxisChart;
