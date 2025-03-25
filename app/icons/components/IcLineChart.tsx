import * as React from "react";
function SvgIcLineChart(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M4.75 17.393V5H4v13.143h16.209v-.75H4.75z" fill="currentColor" />
      <path
        d="M7.958 12.601l1.354.782.188-.108c.025-.014.444-.312.986-.7.72-.514 1.843-1.318 2.283-1.623.498.288 1.808 1.052 2.47 1.437l.605.35 3.641-2.58-.433-.612-3.25 2.303-.185-.109c-.81-.471-2.58-1.502-2.684-1.558l-.184-.101-.183.105c-.143.083-.959.664-2.516 1.778-.317.227-.59.423-.756.54l-1.336-.77-2.606 1.505.375.65L7.958 12.6z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcLineChart;
