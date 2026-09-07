
"use client";

import {
  createContext,
  useContext,
  useCallback,
  useReducer,
  useRef,
  ReactNode,
} from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type NotificationType =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "loading"
  | "promise";

export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline";
}

export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;     // ms — 0 = persistent
  action?: NotificationAction;
  dismissible?: boolean;
  createdAt: number;
}

export type NotificationOptions = Omit<Notification, "id" | "type" | "createdAt">;

// ─── Reducer ─────────────────────────────────────────────────────────────────

type Action =
  | { type: "ADD"; payload: Notification }
  | { type: "REMOVE"; id: string }
  | { type: "UPDATE"; id: string; payload: Partial<Notification> }
  | { type: "CLEAR" };

function reducer(state: Notification[], action: Action): Notification[] {
  switch (action.type) {
    case "ADD":
      return [action.payload, ...state].slice(0, 5); // max 5 visible
    case "REMOVE":
      return state.filter((n) => n.id !== action.id);
    case "UPDATE":
      return state.map((n) =>
        n.id === action.id ? { ...n, ...action.payload } : n
      );
    case "CLEAR":
      return [];
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface NotificationContextValue {
  notifications: Notification[];
  notify: (
    type: NotificationType,
    message: string,
    options?: Partial<NotificationOptions>
  ) => string;
  success: (message: string, options?: Partial<NotificationOptions>) => string;
  error: (message: string, options?: Partial<NotificationOptions>) => string;
  warning: (message: string, options?: Partial<NotificationOptions>) => string;
  info: (message: string, options?: Partial<NotificationOptions>) => string;
  loading: (message: string, options?: Partial<NotificationOptions>) => string;
  promise: <T>(
    fn: Promise<T>,
    messages: { loading: string; success: string | ((data: T) => string); error: string | ((err: unknown) => string) },
    options?: Partial<NotificationOptions>
  ) => Promise<T>;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  update: (id: string, payload: Partial<Notification>) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

const DEFAULT_DURATIONS: Record<NotificationType, number> = {
  success: 4000,
  error: 6000,
  warning: 5000,
  info: 4000,
  loading: 0,    // persistent until resolved
  promise: 0,
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, dispatch] = useReducer(reducer, []);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const scheduleRemoval = useCallback((id: string, duration: number) => {
    if (duration <= 0) return;
    const timer = setTimeout(() => {
      dispatch({ type: "REMOVE", id });
      timers.current.delete(id);
    }, duration);
    timers.current.set(id, timer);
  }, []);

  const notify = useCallback(
    (
      type: NotificationType,
      message: string,
      options: Partial<NotificationOptions> = {}
    ): string => {
      const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const duration =
        options.duration !== undefined
          ? options.duration
          : DEFAULT_DURATIONS[type];

      const notification: Notification = {
        id,
        type,
        message,
        duration,
        dismissible: options.dismissible ?? true,
        createdAt: Date.now(),
        ...options,
      };

      dispatch({ type: "ADD", payload: notification });
      scheduleRemoval(id, duration);
      return id;
    },
    [scheduleRemoval]
  );

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    dispatch({ type: "REMOVE", id });
  }, []);

  const dismissAll = useCallback(() => {
    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current.clear();
    dispatch({ type: "CLEAR" });
  }, []);

  const update = useCallback((id: string, payload: Partial<Notification>) => {
    dispatch({ type: "UPDATE", id, payload });
  }, []);

  const promise = useCallback(
    async <T,>(
      fn: Promise<T>,
      messages: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((err: unknown) => string);
      },
      options: Partial<NotificationOptions> = {}
    ): Promise<T> => {
      const id = notify("loading", messages.loading, { ...options, duration: 0 });
      try {
        const data = await fn;
        const msg =
          typeof messages.success === "function"
            ? messages.success(data)
            : messages.success;
        update(id, {
          type: "success",
          message: msg,
          duration: options.duration ?? DEFAULT_DURATIONS.success,
        });
        scheduleRemoval(id, options.duration ?? DEFAULT_DURATIONS.success);
        return data;
      } catch (err) {
        const msg =
          typeof messages.error === "function"
            ? messages.error(err)
            : messages.error;
        update(id, {
          type: "error",
          message: msg,
          duration: options.duration ?? DEFAULT_DURATIONS.error,
        });
        scheduleRemoval(id, options.duration ?? DEFAULT_DURATIONS.error);
        throw err;
      }
    },
    [notify, update, scheduleRemoval]
  );

  const value: NotificationContextValue = {
    notifications,
    notify,
    success: (msg, opts) => notify("success", msg, opts),
    error: (msg, opts) => notify("error", msg, opts),
    warning: (msg, opts) => notify("warning", msg, opts),
    info: (msg, opts) => notify("info", msg, opts),
    loading: (msg, opts) => notify("loading", msg, opts),
    promise,
    dismiss,
    dismissAll,
    update,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useNotification(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotification must be used inside <NotificationProvider>");
  }
  return ctx;
}
