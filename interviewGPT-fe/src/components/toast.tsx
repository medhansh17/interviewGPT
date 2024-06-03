import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
} from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { Cross2Icon } from "@radix-ui/react-icons";

interface Toast {
  type?: "foreground" | "background";
  duration: number;
  status: string;
  description: string;
  title: string;
  open: boolean;
}

interface ToastsProps {
  children: React.ReactNode;
}

interface ToastContextValue {
  success: (payload: Toast) => void;
  error: (payload: Toast) => void;
}

interface ToastContextImplValue {
  toastElementsMapRef: React.MutableRefObject<Map<string, HTMLElement | null>>;
  sortToasts: () => void;
}

const CheckmarkIcon = () => <div aria-hidden className="checkmark" />;

const ErrorIcon = () => <div aria-hidden className="error" />;

const ToastContext = React.createContext<ToastContextValue | undefined>(
  undefined
);
const ToastContextImpl = React.createContext<ToastContextImplValue | undefined>(
  undefined
);

const ANIMATION_OUT_DURATION = 350;

export const Toasts: React.FC<ToastsProps> = ({ children, ...props }) => {
  const [toasts, setToasts] = useState<Map<string, Toast>>(new Map());
  const toastElementsMapRef = useRef<Map<string, HTMLElement | null>>(
    new Map()
  );
  const viewportRef = useRef<any>(null);

  const sortToasts = useCallback(() => {
    const toastElements = Array.from(toastElementsMapRef.current).reverse();
    const heights: number[] = [];

    toastElements.forEach(([, toast], index) => {
      if (!toast) return;
      const height = toast.clientHeight;
      heights.push(height);
      const frontToastHeight = heights[0];
      toast.setAttribute("data-front", index === 0 ? "true" : "false");
      toast.setAttribute("data-hidden", index > 2 ? "true" : "false");
      toast.style.setProperty("--index", index.toString());
      toast.style.setProperty("--height", `${height}px`);
      toast.style.setProperty("--front-height", `${frontToastHeight}px`);
      const hoverOffsetY = heights
        .slice(0, index)
        .reduce((res, next) => (res += next), 0);
      toast.style.setProperty("--hover-offset-y", `-${hoverOffsetY}px`);
    });
  }, []);

  const handleAddToast = useCallback((toast: Toast) => {
    setToasts((currentToasts) => {
      const newMap = new Map(currentToasts);
      newMap.set(String(Date.now()), { ...toast, open: true });
      return newMap;
    });
  }, []);

  const handleRemoveToast = useCallback((key: string) => {
    setToasts((currentToasts) => {
      const newMap = new Map(currentToasts);
      newMap.delete(key);
      return newMap;
    });
  }, []);

  const handleDispatchDefault = useCallback(
    (payload: Toast) => handleAddToast({ ...payload, status: "default" }),
    [handleAddToast]
  );

  const handleDispatchSuccess = useCallback(
    (payload: Toast) => handleAddToast({ ...payload, status: "success" }),
    [handleAddToast]
  );

  const handleDispatchError = useCallback(
    (payload: Toast) => handleAddToast({ ...payload, status: "error" }),
    [handleAddToast]
  );

  useEffect(() => {
    const viewport = viewportRef.current;

    if (viewport) {
      const handleFocus = () => {
        toastElementsMapRef.current.forEach((toast) => {
          if (toast) {
            toast.setAttribute("data-hovering", "true");
          }
        });
      };

      const handleBlur = (event: FocusEvent) => {
        if (
          !viewport.contains(event.target as Node) ||
          viewport === event.target
        ) {
          toastElementsMapRef.current.forEach((toast) => {
            if (toast) {
              toast.setAttribute("data-hovering", "false");
            }
          });
        }
      };

      viewport.addEventListener("pointermove", handleFocus);
      viewport.addEventListener("pointerleave", handleBlur);
      viewport.addEventListener("focusin", handleFocus);
      viewport.addEventListener("focusout", handleBlur);
      return () => {
        viewport.removeEventListener("pointermove", handleFocus);
        viewport.removeEventListener("pointerleave", handleBlur);
        viewport.removeEventListener("focusin", handleFocus);
        viewport.removeEventListener("focusout", handleBlur);
      };
    }
  }, []);

  return (
    <ToastContext.Provider
      value={useMemo(
        () => ({
          success: handleDispatchSuccess,
          error: handleDispatchError,
        }),
        [handleDispatchDefault, handleDispatchSuccess, handleDispatchError]
      )}
    >
      <ToastContextImpl.Provider
        value={useMemo(
          () => ({
            toastElementsMapRef,
            sortToasts,
          }),
          [sortToasts]
        )}
      >
        <ToastPrimitive.Provider {...props}>
          {children}
          {Array.from(toasts).map(([key, toast]) => (
            <Toast
              key={key}
              id={key}
              toast={toast}
              onOpenChange={(open) => {
                if (!open) {
                  toastElementsMapRef.current.delete(key);
                  sortToasts();
                  if (!open) {
                    setTimeout(() => {
                      handleRemoveToast(key);
                    }, ANIMATION_OUT_DURATION);
                  }
                }
              }}
            />
          ))}
          <ToastPrimitive.Viewport
            ref={viewportRef}
            className="ToastViewport"
          />
        </ToastPrimitive.Provider>
      </ToastContextImpl.Provider>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (context) return context;
  throw new Error("useToast must be used within Toasts");
};

export const useToastContext = (): ToastContextImplValue => {
  const context = useContext(ToastContextImpl);
  if (context) return context;
  throw new Error("useToastContext must be used within Toasts");
};

interface ToastProps {
  onOpenChange: (open: boolean) => void;
  toast: Toast;
  id: string;
}

const Toast: React.FC<ToastProps> = (props) => {
  const { onOpenChange, toast, id, ...toastProps } = props;
  const ref = useRef<HTMLLIElement | null>(null);
  const context = useToastContext();
  const { sortToasts, toastElementsMapRef } = context;
  const toastElementsMap = toastElementsMapRef.current;

  useLayoutEffect(() => {
    if (ref.current) {
      toastElementsMap.set(id, ref.current);
      sortToasts();
    }
  }, [id, sortToasts, toastElementsMap]);

  return (
    <ToastPrimitive.Root
      {...toastProps}
      ref={ref}
      type={toast.type}
      duration={toast.duration}
      className="ToastRoot"
      onOpenChange={onOpenChange}
    >
      <div className="ToastInner" data-status={toast.status}>
        <ToastStatusIcon status={toast.status} />
        <ToastPrimitive.Title className="ToastTitle">
          <p>{toast.title}</p>
        </ToastPrimitive.Title>
        <ToastPrimitive.Description className="ToastDescription">
          {toast.description}
        </ToastPrimitive.Description>
        {/* <ToastPrimitive.Action
          className="ToastAction Button small green"
          altText="Goto schedule to undo"
        >
          Undo
        </ToastPrimitive.Action> */}
        <ToastPrimitive.Close aria-label="Close" className="ToastClose">
          <Cross2Icon />
        </ToastPrimitive.Close>
      </div>
    </ToastPrimitive.Root>
  );
};

interface ToastStatusIconProps {
  status: string;
}

const ToastStatusIcon: React.FC<ToastStatusIconProps> = ({ status }) => {
  return status !== "default" ? (
    <div style={{ gridArea: "icon", alignSelf: "start" }}>
      {status === "success" && <CheckmarkIcon />}
      {status === "error" && <ErrorIcon />}
    </div>
  ) : null;
};
