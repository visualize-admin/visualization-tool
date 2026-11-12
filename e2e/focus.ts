import { expect, Page } from "@playwright/test";

type FocusStop = {
  isRepeated: boolean;
  issue?: string;
};

const MAX_FOCUS_STOPS = 250;
const NON_TEXT_CONTRAST = 3;

export const expectVisibleFocusRings = async ({ page }: { page: Page }) => {
  const issues: string[] = [];

  for (let i = 0; i < MAX_FOCUS_STOPS; i++) {
    await page.keyboard.press("Tab");
    const stop = await page.evaluate(inspectFocusedElement, NON_TEXT_CONTRAST);

    if (stop?.isRepeated) {
      break;
    }

    if (stop?.issue) {
      issues.push(stop.issue);
    }
  }

  expect(issues).toEqual([]);
};

const inspectFocusedElement = (minContrast: number): FocusStop | null => {
  type Ring = { left: number; top: number; right: number; bottom: number };

  const parseRgb = (color: string) => {
    const [r = 0, g = 0, b = 0, a = 1] = (color.match(/[\d.]+/g) ?? []).map(
      Number
    );

    return [r, g, b, a];
  };

  const getLuminance = (color: string) => {
    const [r, g, b] = parseRgb(color)
      .slice(0, 3)
      .map((channel) => {
        const value = channel / 255;

        return value <= 0.03928
          ? value / 12.92
          : Math.pow((value + 0.055) / 1.055, 2.4);
      });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const getContrast = (foreground: string, background: string) => {
    const [lighter, darker] = [
      getLuminance(foreground),
      getLuminance(background),
    ].sort((a, b) => b - a);

    return (lighter + 0.05) / (darker + 0.05);
  };

  const describe = (target: Element) => {
    const role = target.getAttribute("role");
    const label = (
      target.getAttribute("aria-label") ??
      (target instanceof HTMLElement ? target.innerText : "") ??
      ""
    )
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, 40);

    return `<${target.tagName.toLowerCase()}${role ? ` role=${role}` : ""}> "${label}"`;
  };

  const findRingElement = (focused: HTMLElement) => {
    const candidates = [
      focused,
      focused.parentElement,
      focused.parentElement?.parentElement,
      focused.querySelector(".Mui-focused"),
    ];

    return candidates.find((candidate): candidate is HTMLElement => {
      if (!(candidate instanceof HTMLElement)) {
        return false;
      }

      const style = getComputedStyle(candidate);

      return (
        style.opacity !== "0" &&
        style.outlineStyle !== "none" &&
        parseFloat(style.outlineWidth) > 0
      );
    });
  };

  const findClippingAncestor = ({
    element,
    ring,
  }: {
    element: Element;
    ring: Ring;
  }) => {
    const tolerance = 0.5;

    for (
      let ancestor = element.parentElement;
      ancestor && ancestor !== document.body;
      ancestor = ancestor.parentElement
    ) {
      const style = getComputedStyle(ancestor);

      if (
        style.display === "contents" ||
        (style.overflowX === "visible" && style.overflowY === "visible")
      ) {
        continue;
      }

      const bounds = ancestor.getBoundingClientRect();

      if (
        ring.left < bounds.left - tolerance ||
        ring.top < bounds.top - tolerance ||
        ring.right > bounds.right + tolerance ||
        ring.bottom > bounds.bottom + tolerance
      ) {
        return ancestor;
      }
    }
  };

  const findBackgroundColor = (start: Element | null) => {
    for (let node = start; node; node = node.parentElement) {
      const color = getComputedStyle(node).backgroundColor;

      if (parseRgb(color)[3] > 0) {
        return color;
      }
    }

    return "rgb(255, 255, 255)";
  };

  const element = document.activeElement;

  if (!(element instanceof HTMLElement) || element === document.body) {
    return null;
  }

  if (element.dataset.focusWalked) {
    return { isRepeated: true };
  }

  element.dataset.focusWalked = "true";

  const name = describe(element);
  const ringElement = findRingElement(element);

  if (!ringElement) {
    return { isRepeated: false, issue: `${name}: no focus ring` };
  }

  const style = getComputedStyle(ringElement);
  const extent =
    parseFloat(style.outlineOffset) + parseFloat(style.outlineWidth);
  const rect = ringElement.getBoundingClientRect();
  const clipper = findClippingAncestor({
    element: ringElement,
    ring: {
      left: rect.left - extent,
      top: rect.top - extent,
      right: rect.right + extent,
      bottom: rect.bottom + extent,
    },
  });

  if (clipper) {
    return {
      isRepeated: false,
      issue: `${name}: focus ring clipped by ${describe(clipper)}`,
    };
  }

  const background = findBackgroundColor(
    extent > 0 ? ringElement.parentElement : ringElement
  );
  const contrast = getContrast(style.outlineColor, background);

  if (contrast < minContrast) {
    return {
      isRepeated: false,
      issue: `${name}: focus ring contrast ${contrast.toFixed(2)}:1 against ${background}`,
    };
  }

  return { isRepeated: false };
};
