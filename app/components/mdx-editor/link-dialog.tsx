import { $createLinkNode, $isLinkNode } from "@lexical/link";
import { t } from "@lingui/macro";
import {
  activeEditor$,
  addComposerChild$,
  createActiveEditorSubscription$,
  currentSelection$,
  editorRootElementRef$,
  getSelectedNode,
  getSelectionRectangle,
  IS_APPLE,
  readOnly$,
  realmPlugin,
} from "@mdxeditor/editor";
import {
  Action,
  Cell,
  filter,
  map,
  Signal,
  useCellValues,
  usePublisher,
  withLatestFrom,
} from "@mdxeditor/gurx";
import {
  Button,
  ClickAwayListener,
  Fade,
  Input,
  Link,
  Paper,
  Popper,
  Theme,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import {
  $createTextNode,
  $getSelection,
  $insertNodes,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  KEY_ESCAPE_COMMAND,
  KEY_MODIFIER_COMMAND,
  RangeSelection,
} from "lexical";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";

import { ToolbarIconButton } from "@/components/mdx-editor/common";
import { Icon } from "@/icons";
import { useTimedPrevious } from "@/utils/use-timed-previous";

// This implementation is based on https://github.com/mdx-editor/editor/tree/main/src/plugins/link-dialog.

type Rect = Pick<DOMRect, "height" | "width" | "top" | "left">;

type InactiveLinkDialog = {
  type: "inactive";
  rectangle?: undefined;
  linkNodeKey?: undefined;
};

type PreviewLinkDialog = {
  type: "preview";
  text: string;
  url: string;
  linkNodeKey: string;
  rectangle: Rect;
};

type EditLinkDialog = {
  type: "edit";
  initialUrl: string;
  initialText?: string;
  url: string;
  text: string;
  linkNodeKey: string;
  rectangle: Rect;
};

const getLinkNodeInSelection = (selection: RangeSelection | null) => {
  if (!selection) {
    return null;
  }

  const node = getSelectedNode(selection);

  if (node === null) {
    return null;
  }

  const parent = node.getParent();

  if ($isLinkNode(parent)) {
    return parent;
  } else if ($isLinkNode(node)) {
    return node;
  }

  return null;
};

const onWindowChange$ = Signal<true>();

const state$ = Cell<InactiveLinkDialog | PreviewLinkDialog | EditLinkDialog>(
  { type: "inactive" },
  (r) => {
    r.pub(createActiveEditorSubscription$, (editor) => {
      return editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          const state = r.getValue(state$);

          if (state.type === "preview") {
            r.pub(state$, { type: "inactive" });

            return true;
          }

          return false;
        },
        COMMAND_PRIORITY_LOW
      );
    });

    r.pub(createActiveEditorSubscription$, (editor) => {
      return editor.registerCommand(
        KEY_MODIFIER_COMMAND,
        (e) => {
          if (
            e.key === "k" &&
            (IS_APPLE ? e.metaKey : e.ctrlKey) &&
            !r.getValue(readOnly$)
          ) {
            const selection = $getSelection();

            if ($isRangeSelection(selection)) {
              r.pub(openLinkEditDialog$);
              e.stopPropagation();
              e.preventDefault();

              return true;
            } else {
              return false;
            }
          }

          return false;
        },
        COMMAND_PRIORITY_HIGH
      );
    });

    r.link(
      r.pipe(
        switchFromPreviewToLinkEdit$,
        withLatestFrom(state$),
        map(([, state]) => {
          if (state.type === "preview") {
            return {
              type: "edit",
              initialUrl: state.url,
              url: state.url,
              text: state.text,
              linkNodeKey: state.linkNodeKey,
              rectangle: state.rectangle,
            } as EditLinkDialog;
          } else {
            throw new Error(
              "Cannot switch to edit mode when not in preview mode!"
            );
          }
        })
      ),
      state$
    );

    r.sub(
      r.pipe(
        updateLink$,
        withLatestFrom(activeEditor$, state$, currentSelection$)
      ),
      ([payload, editor, state, selection]) => {
        const url = payload.url?.trim() ?? "";
        const text = payload.text?.trim() ?? "";

        if (url !== "") {
          const linkContent = text || url;
          editor?.update(
            () => {
              const linkNode = getLinkNodeInSelection(selection);
              linkNode?.remove();
              const newLinkNode = $createLinkNode(url);
              newLinkNode.append($createTextNode(linkContent));
              $insertNodes([newLinkNode]);
              newLinkNode.select();
            },
            { discrete: true }
          );

          r.pub(state$, {
            type: "preview",
            linkNodeKey: state.linkNodeKey,
            rectangle: state.rectangle,
            text,
            url,
          } as PreviewLinkDialog);
        } else {
          r.pub(state$, {
            type: "inactive",
          });
        }
      }
    );

    r.link(
      r.pipe(
        cancelLinkEdit$,
        withLatestFrom(state$, activeEditor$),
        map(([, state, editor]) => {
          if (state.type === "edit") {
            editor?.focus();

            if (state.initialUrl === "") {
              return {
                type: "inactive" as const,
              } as InactiveLinkDialog;
            } else {
              return {
                type: "preview" as const,
                url: state.initialUrl,
                linkNodeKey: state.linkNodeKey,
                rectangle: state.rectangle,
              } as PreviewLinkDialog;
            }
          } else {
            throw new Error("Cannot cancel edit when not in edit mode!");
          }
        })
      ),
      state$
    );

    r.link(
      r.pipe(
        r.combine(currentSelection$, onWindowChange$),
        withLatestFrom(activeEditor$, state$, readOnly$),
        map(([[selection], activeEditor, _, readOnly]) => {
          if ($isRangeSelection(selection) && activeEditor && !readOnly) {
            const node = getLinkNodeInSelection(selection);

            if (node) {
              return {
                type: "preview",
                url: node.getURL(),
                linkNodeKey: node.getKey(),
                text: node.getTextContent(),
                rectangle: getSelectionRectangle(activeEditor),
              } as PreviewLinkDialog;
            } else {
              return { type: "inactive" } as InactiveLinkDialog;
            }
          } else {
            return { type: "inactive" } as InactiveLinkDialog;
          }
        })
      ),
      state$
    );
  }
);

const updateLink$ = Signal<{
  url: string | undefined;
  text: string | undefined;
}>();

const cancelLinkEdit$ = Action();

const switchFromPreviewToLinkEdit$ = Action();

export const openLinkEditDialog$ = Action((r) => {
  r.sub(
    r.pipe(
      openLinkEditDialog$,
      withLatestFrom(currentSelection$, activeEditor$),
      filter(([, selection]) => $isRangeSelection(selection))
    ),
    ([, selection, editor]) => {
      editor?.focus(() => {
        editor.getEditorState().read(() => {
          const linkNode = getLinkNodeInSelection(selection);
          const rectangle = getSelectionRectangle(editor) as Rect;

          if (selection || linkNode) {
            const key = linkNode?.getKey() ?? "";
            const url = linkNode?.getURL() ?? "";
            const text =
              selection?.getTextContent() ?? linkNode?.getTextContent() ?? "";
            r.pub(state$, {
              type: "edit",
              initialUrl: url,
              initialText: text,
              url,
              text,
              linkNodeKey: key,
              rectangle,
            });
          } else {
            r.pub(state$, {
              type: "edit",
              initialUrl: "",
              initialText: "",
              text: "",
              url: "",
              linkNodeKey: "",
              rectangle,
            });
          }
        });
      });
    }
  );
});

export const linkDialogPlugin = realmPlugin({
  init(r) {
    r.pub(addComposerChild$, LinkDialog);
  },
  update() {},
});

type LinkFormFields = {
  url: string;
  text: string;
};

const LinkEditForm = ({
  url,
  text,
  onSubmit,
  onCancel,
}: {
  url: string;
  text: string;
  onSubmit: (link: { url: string; text: string }) => void;
  onCancel: () => void;
}) => {
  const classes = useLinkEditFormStyles();
  const { register, handleSubmit } = useForm<LinkFormFields>({
    values: {
      url,
      text,
    },
  });

  return (
    <ClickAwayListener
      onClickAway={() => {
        try {
          onCancel();
        } catch (e) {}
      }}
    >
      <form
        className={classes.form}
        onSubmit={(e) => {
          void handleSubmit(onSubmit)(e);
          e.stopPropagation();
          e.preventDefault();
        }}
        onReset={(e) => {
          e.stopPropagation();
          onCancel();
        }}
      >
        <Input
          id="link-text"
          className={classes.input}
          size="sm"
          {...register("text")}
          placeholder={t({
            id: "mdx-editor.link-dialog.label-placeholder",
            message: "Label...",
          })}
          autoFocus
        />
        <Input
          id="link-url"
          className={classes.input}
          size="sm"
          type="url"
          {...register("url")}
          placeholder={t({
            id: "mdx-editor.link-dialog.url-placeholder",
            message: "URL...",
          })}
        />
        <div className={classes.buttonGroup}>
          <Button type="reset" variant="outlined">
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            Save
          </Button>
        </div>
      </form>
    </ClickAwayListener>
  );
};

const useLinkEditFormStyles = makeStyles<Theme>((theme) => ({
  form: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(3),
    width: 400,
    padding: theme.spacing(2),
  },
  input: {
    width: "100%",
    padding: `${theme.spacing(2)}px ${theme.spacing(3)}px`,
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(2),
  },
}));

const TIMEOUT_MS = 350;

const LinkDialog = () => {
  const classes = useLinkDialogStyles();
  const [editorRootElementRef, activeEditor, state] = useCellValues(
    editorRootElementRef$,
    activeEditor$,
    state$
  );
  const delayedState = useTimedPrevious(state, TIMEOUT_MS);
  const maybeDelayedState = state.type === "inactive" ? delayedState : state;
  const publishWindowChange = usePublisher(onWindowChange$);
  const updateLink = usePublisher(updateLink$);
  const cancelLinkEdit = usePublisher(cancelLinkEdit$);
  const switchFromPreviewToLinkEdit = usePublisher(
    switchFromPreviewToLinkEdit$
  );

  const urlIsExternal =
    maybeDelayedState.type === "preview" &&
    maybeDelayedState.url.startsWith("http");

  useEffect(() => {
    const update = () => {
      activeEditor?.getEditorState().read(() => {
        publishWindowChange(true);
      });
    };

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, [activeEditor, publishWindowChange]);

  const maybeDelayedRectangle = maybeDelayedState.rectangle;
  const maybeDelayedRectangleRef = useRef<Rect | null>(null);
  const rectangle = maybeDelayedRectangle ?? maybeDelayedRectangleRef.current;

  useEffect(() => {
    if (maybeDelayedRectangle) {
      maybeDelayedRectangleRef.current = maybeDelayedRectangle;
    }
  }, [maybeDelayedRectangle]);

  return (
    <Popper
      className={classes.popper}
      open={state.type !== "inactive"}
      anchorEl={editorRootElementRef?.current}
      transition
      sx={{
        top: `${(rectangle?.top ?? 0) + (rectangle?.height ?? 0) + 4}px !important`,
        left: `${rectangle?.left ?? 0}px !important`,
      }}
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={TIMEOUT_MS}>
          <Paper className={classes.popperContent}>
            {maybeDelayedState.type === "edit" && (
              <LinkEditForm
                url={maybeDelayedState.url}
                text={maybeDelayedState.text}
                onSubmit={updateLink}
                onCancel={cancelLinkEdit.bind(null)}
              />
            )}
            {maybeDelayedState.type === "preview" && (
              <>
                <Link
                  className={classes.previewLink}
                  href={maybeDelayedState.url}
                  {...(urlIsExternal
                    ? { target: "_blank", rel: "noreferrer" }
                    : {})}
                >
                  <Typography className={classes.previewLinkText}>
                    {maybeDelayedState.url}
                  </Typography>
                  {urlIsExternal ? (
                    <Icon name="legacyLinkExternal" size={16} />
                  ) : null}
                </Link>
                <ToolbarIconButton
                  onClick={() => {
                    switchFromPreviewToLinkEdit();
                  }}
                >
                  <Icon name="pen" />
                </ToolbarIconButton>
              </>
            )}
          </Paper>
        </Fade>
      )}
    </Popper>
  );
};

const useLinkDialogStyles = makeStyles<Theme>((theme) => ({
  popper: {
    zIndex: 2000,
    position: "fixed !important" as "fixed",
    width: "fit-content",
    height: "fit-content",
    transform: "none !important",
  },
  popperContent: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    padding: theme.spacing(1),
    borderRadius: 3,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[6],
  },
  previewLink: {
    display: "flex",
    alignItems: "center",
    color: theme.palette.primary.main,
  },
  previewLinkText: {
    margin: `0 ${theme.spacing(1)}`,
  },
}));
