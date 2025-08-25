import { Grow, Popper, PopperProps } from "@mui/material";
import { useEffect, useRef } from "react";

export const TransitionPopper = ({
  children,
  open,
  anchorX,
  anchorY,
  ...rest
}: PopperProps & {
  anchorX: number;
  anchorY: number;
}): JSX.Element => {
  const childrenRef = useRef<typeof children>();

  // Make sure the children do not disappear mid-transition.
  useEffect(() => {
    if (open) {
      childrenRef.current = children;
    }
  }, [children, open]);

  return (
    <Popper
      open={open}
      keepMounted
      modifiers={[
        ...modifiers,
        // Mirroring default Select's behavior.
        {
          name: "computeTransformOrigin",
          enabled: true,
          phase: "write",
          fn: ({
            state,
          }: {
            state: { elements: { popper: HTMLElement | undefined } };
          }) => {
            const el = state.elements.popper;

            if (!el) {
              return;
            }

            const { left, top, width, height } = el.getBoundingClientRect();
            const x = Math.max(0, Math.min(anchorX - left, width));
            const y = Math.max(0, Math.min(anchorY - top, height));

            el.style.setProperty("--transform-origin", `${x}px ${y}px`);
          },
        },
      ]}
      {...rest}
      transition
    >
      {({ TransitionProps }) => (
        <Grow
          {...TransitionProps}
          style={{ transformOrigin: `var(--transform-origin)` }}
        >
          <div>{childrenRef.current}</div>
        </Grow>
      )}
    </Popper>
  );
};

const modifiers: NonNullable<PopperProps["modifiers"]> = [
  {
    name: "flip",
    enabled: false,
  },
  {
    name: "preventOverflow",
    enabled: true,
    options: {
      boundary: "viewport",
      altBoundary: true,
      padding: 8,
      tether: true,
      mainAxis: true,
      altAxis: true,
    },
  },
];
