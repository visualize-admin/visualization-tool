import { Menu, MenuProps } from "@mui/material";
import { createContext, MouseEvent, useContext, useState } from "react";

import {
  ConfirmationDialog,
  ConfirmationRequest,
} from "@/components/confirmation-dialog";
import { focusFirst } from "@/utils/focus-first";

const MENU_ITEM_SELECTOR = '[role^="menuitem"]:not([aria-disabled="true"])';

const RequestConfirmationContext = createContext<
  ((request: ConfirmationRequest) => void) | undefined
>(undefined);

export const useRequestConfirmation = () => {
  return useContext(RequestConfirmationContext);
};

export const ActionMenu = ({
  open,
  onClose,
  TransitionProps,
  ...props
}: MenuProps) => {
  const [request, setRequest] = useState<ConfirmationRequest>();

  return (
    <RequestConfirmationContext.Provider value={setRequest}>
      <Menu
        open={open && !request}
        onClose={onClose}
        onClick={stopPropagation}
        disableAutoFocusItem
        TransitionProps={{
          ...TransitionProps,
          onEntering: (node, isAppearing) => {
            focusFirst(node, MENU_ITEM_SELECTOR);
            TransitionProps?.onEntering?.(node, isAppearing);
          },
        }}
        {...props}
      />
      {request ? (
        <ConfirmationDialog
          open
          {...request}
          onClose={(event, reason) => {
            setRequest(undefined);
            onClose?.(event, reason);
          }}
        />
      ) : null}
    </RequestConfirmationContext.Provider>
  );
};

const stopPropagation = (e: MouseEvent) => {
  e.stopPropagation();
};
