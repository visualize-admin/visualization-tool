import * as React from "react";
function SvgIcNormalize(props: React.SVGProps<SVGSVGElement>) {
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
        d="M14.632 15v7H9.368v-7h5.264zm-1.053 1H10.42v5h3.158v-5zm-6.316-6v12H2V10h5.263zm-1.052 1H3.053v10H6.21V11zM22 10v12h-5.263V10H22zm-1.053 1H17.79v10h3.157V11zM7.263 3v6H2V3h5.263zM6.211 4H3.053v4H6.21V4zM22 3v6h-5.263V3H22zm-1.053 1H17.79v4h3.157V4zm-6.315-1v11H9.368V3h5.264zm-1.053 1H10.42v9h3.158V4z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcNormalize;
