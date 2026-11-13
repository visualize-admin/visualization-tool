import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { ReactNode, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ActionMenu } from "@/components/action-menu";
import { MenuActionItem } from "@/components/menu-action-item";

vi.mock("@lingui/macro", () => ({
  Trans: ({ children }: { children: ReactNode }) => children,
  t: ({ message }: { message: string }) => message,
}));

afterEach(cleanup);

const WrappedItem = ({ label }: { label: string }) => {
  return (
    <MenuActionItem
      type="button"
      as="menuitem"
      label={label}
      onClick={() => {}}
    />
  );
};

const TestMenu = ({
  onDelete,
  onParentClick,
}: {
  onDelete: () => void;
  onParentClick: () => void;
}) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  return (
    <div onClick={onParentClick}>
      <button onClick={(e) => setAnchor(e.currentTarget)}>Open</button>
      <ActionMenu
        open={!!anchor}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        transitionDuration={0}
      >
        <WrappedItem label="Duplicate" />
        <WrappedItem label="Export" />
        <MenuActionItem
          type="button"
          as="menuitem"
          label="Delete"
          requireConfirmation
          confirmationTitle="Delete chart?"
          onClick={onDelete}
        />
      </ActionMenu>
    </div>
  );
};

const renderMenu = () => {
  const onDelete = vi.fn();
  const onParentClick = vi.fn();
  render(<TestMenu onDelete={onDelete} onParentClick={onParentClick} />);
  fireEvent.click(screen.getByRole("button", { name: "Open" }));
  onParentClick.mockClear();

  return { onDelete, onParentClick };
};

describe("ActionMenu", () => {
  it("focuses the first item even when items are wrapped in components", () => {
    renderMenu();

    expect(document.activeElement).toBe(
      screen.getByRole("menuitem", { name: "Duplicate" })
    );
  });

  it("moves focus between items with the arrow keys", () => {
    renderMenu();
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });

    expect(document.activeElement).toBe(
      screen.getByRole("menuitem", { name: "Export" })
    );
  });

  it("renders the confirmation outside the closed menu", async () => {
    const { onDelete, onParentClick } = renderMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "Delete" }));

    expect(screen.getByRole("dialog", { name: "Delete chart?" })).toBeTruthy();
    expect(onParentClick).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.queryByRole("menu", { hidden: true })).toBeNull();
    });

    fireEvent.click(screen.getByRole("button", { name: "Yes" }));

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("keeps the menu closed when the confirmation is cancelled", async () => {
    const { onDelete } = renderMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "No" }));

    expect(onDelete).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.queryByRole("menu", { hidden: true })).toBeNull();
    });
  });
});
