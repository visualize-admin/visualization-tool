import * as React from "react";

function SvgIcIndeterminate(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
    >
      <g color="currentColor" fillRule="evenodd">
        <path d="M5.21,4.715 L6.365,5.78 C4.76,7.49 3.74,9.47 3.74,12.17 C3.74,14.87 4.76,16.865 6.365,18.575 L5.21,19.625 C3.455,17.915 2.06,15.605 2.06,12.17 C2.06,8.735 3.455,6.44 5.21,4.715 Z M19.085,4.715 C20.84,6.44 22.235,8.735 22.235,12.17 C22.235,15.605 20.84,17.915 19.085,19.625 L17.93,18.575 C19.535,16.865 20.555,14.87 20.555,12.17 C20.555,9.47 19.535,7.49 17.93,5.78 Z M16.4155097,8 L18,9.33413013 L10.1090802,17 L6,13.4619828 L7.4927012,12.0439053 L10.0152774,14.216847 L16.4155097,8 Z" />
      </g>
    </svg>
  );
}

export default SvgIcIndeterminate;
