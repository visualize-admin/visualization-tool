import * as React from "react";

function SvgIcColor(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
    >
      <g fill="currentColor">
        <path d="m20.586 9.897-1.951-1.203-1.972 8.123 4.214-5.72a.886.886 0 0 0-.29-1.2ZM16.92 4.844 15 4.357v12.04l2.546-10.494a.876.876 0 0 0-.626-1.06ZM3 16v6.125c0 .484.384.875.857.875h8.571a.866.866 0 0 0 .857-.875V16H3Zm5.143 5.25c-.946 0-1.715-.785-1.715-1.75s.77-1.75 1.715-1.75c.945 0 1.714.785 1.714 1.75s-.769 1.75-1.714 1.75ZM13.285 14.25V2.875A.866.866 0 0 0 12.428 2h-8.57A.865.865 0 0 0 3 2.875V14.25h10.285Z" />
      </g>
    </svg>
  );
}

export default SvgIcColor;
