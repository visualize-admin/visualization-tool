import { getCommonIconProps, IconProps } from ".";

export const ExternalIcon = (props: IconProps) => {
  return (
    <svg {...getCommonIconProps(props)}>
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g
          transform="translate(4, 4)"
          fill="currentColor"
          fillRule="nonzero"
          stroke="currentColor"
          strokeWidth="0.25"
        >
          <polygon points="9.60001 0 9.60001 0.75 13.77101 0.75 7.78101 6.73799 8.31201 7.26899 14.30001 1.28 14.30001 5.44999 15.05001 5.44999 15.05001 0" />
          <polygon points="13.25801 14.30099 0.75 14.30099 0.75 1.793 5.45101 1.793 5.45101 1.043 0 1.043 0 15.05099 14.00801 15.05099 14.00801 9.59999 13.25801 9.59999" />
        </g>
      </g>
    </svg>
  );
};
