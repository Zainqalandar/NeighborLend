"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle2, XCircle, AlertTriangle, Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotification } from "@/context/notification-context";
import type { Notification, NotificationType } from "@/context/notification-context";
import { Button } from "@/components/ui/button";

// ─── Config per type ──────────────────────────────────────────────────────────

const CONFIG: Record<
  NotificationType,
  {
    icon: React.ReactNode;
    bg: string;
    border: string;
    iconBg: string;
    iconColor: string;
    titleColor: string;
    bar: string;
  }
> = {
  success: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    bg: "bg-white dark:bg-zinc-900",
    border: "border-emerald-200 dark:border-emerald-800",
    iconBg: "bg-emerald-50 dark:bg-emerald-950",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    titleColor: "text-emerald-700 dark:text-emerald-300",
    bar: "bg-emerald-500",
  },
  error: {
    icon: <XCircle className="w-4 h-4" />,
    bg: "bg-white dark:bg-zinc-900",
    border: "border-red-200 dark:border-red-800",
    iconBg: "bg-red-50 dark:bg-red-950",
    iconColor: "text-red-600 dark:text-red-400",
    titleColor: "text-red-700 dark:text-red-300",
    bar: "bg-red-500",
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4" />,
    bg: "bg-white dark:bg-zinc-900",
    border: "border-amber-200 dark:border-amber-800",
    iconBg: "bg-amber-50 dark:bg-amber-950",
    iconColor: "text-amber-600 dark:text-amber-400",
    titleColor: "text-amber-700 dark:text-amber-300",
    bar: "bg-amber-500",
  },
  info: {
    icon: <Info className="w-4 h-4" />,
    bg: "bg-white dark:bg-zinc-900",
    border: "border-blue-200 dark:border-blue-800",
    iconBg: "bg-blue-50 dark:bg-blue-950",
    iconColor: "text-blue-600 dark:text-blue-400",
    titleColor: "text-blue-700 dark:text-blue-300",
    bar: "bg-blue-500",
  },
  loading: {
    icon: <Loader2 className="w-4 h-4 animate-spin" />,
    bg: "bg-white dark:bg-zinc-900",
    border: "border-violet-200 dark:border-violet-800",
    iconBg: "bg-violet-50 dark:bg-violet-950",
    iconColor: "text-violet-600 dark:text-violet-400",
    titleColor: "text-violet-700 dark:text-violet-300",
    bar: "bg-violet-500 animate-pulse",
  },
  promise: {
    icon: <Loader2 className="w-4 h-4 animate-spin" />,
    bg: "bg-white dark:bg-zinc-900",
    border: "border-violet-200 dark:border-violet-800",
    iconBg: "bg-violet-50 dark:bg-violet-950",
    iconColor: "text-violet-600 dark:text-violet-400",
    titleColor: "text-violet-700 dark:text-violet-300",
    bar: "bg-violet-500 animate-pulse",
  },
};

// ─── Single Toast Item ────────────────────────────────────────────────────────

function ToastItem({ notification }: { notification: Notification }) {
  const { dismiss } = useNotification();
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [progress, setProgress] = useState(100);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cfg = CONFIG[notification.type];
  const hasDuration = notification.duration && notification.duration > 0;

  // Entry animation
  useEffect(() => {
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(t);
  }, []);

  // Progress bar countdown
  useEffect(() => {
    if (!hasDuration) return;
    const step = 50;
    const decrement = (step / notification.duration!) * 100;
    intervalRef.current = setInterval(() => {
      setProgress((p) => Math.max(0, p - decrement));
    }, step);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hasDuration, notification.duration]);

  // Pause on hover
  const pauseProgress = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
  const resumeProgress = () => {
    if (!hasDuration) return;
    const step = 50;
    const decrement = (step / notification.duration!) * 100;
    intervalRef.current = setInterval(() => {
      setProgress((p) => Math.max(0, p - decrement));
    }, step);
  };

  const handleDismiss = () => {
    setLeaving(true);
    setTimeout(() => dismiss(notification.id), 300);
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      onMouseEnter={pauseProgress}
      onMouseLeave={resumeProgress}
      className={cn(
        "relative w-full max-w-sm overflow-hidden rounded-2xl border shadow-lg shadow-black/5 transition-all duration-300 ease-out",
        cfg.bg,
        cfg.border,
        visible && !leaving
          ? "translate-x-0 opacity-100 scale-100"
          : "translate-x-full opacity-0 scale-95"
      )}
    >
      {/* Progress bar */}
      {hasDuration && (
        <div
          className={cn("absolute top-0 left-0 h-0.5 transition-all duration-75 ease-linear", cfg.bar)}
          style={{ width: `${progress}%` }}
          aria-hidden
        />
      )}
      {/* Loading bar (indeterminate) */}
      {!hasDuration && notification.type === "loading" && (
        <div className="absolute top-0 left-0 right-0 h-0.5 overflow-hidden bg-violet-100 dark:bg-violet-900">
          <div className={cn("h-full w-1/2 rounded-full", cfg.bar, "animate-[slide_1.4s_ease-in-out_infinite]")} />
        </div>
      )}

      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div
          className={cn(
            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl",
            cfg.iconBg,
            cfg.iconColor
          )}
        >
          {cfg.icon}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {notification.title && (
            <p className={cn("text-sm font-semibold leading-tight", cfg.titleColor)}>
              {notification.title}
            </p>
          )}
          <p
            className={cn(
              "text-sm leading-snug text-gray-600 dark:text-gray-300",
              notification.title ? "mt-0.5" : ""
            )}
          >
            {notification.message}
          </p>

          {/* Action button */}
          {notification.action && (
            <div className="mt-2.5">
              <Button
                size="sm"
                variant={notification.action.variant ?? "outline"}
                className="h-7 rounded-lg px-3 text-xs font-medium"
                onClick={() => {
                  notification.action?.onClick();
                  handleDismiss();
                }}
              >
                {notification.action.label}
              </Button>
            </div>
          )}
        </div>

        {/* Close */}
        {notification.dismissible && (
          <button
            onClick={handleDismiss}
            aria-label="Dismiss"
            className="ml-1 shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-zinc-800 dark:hover:text-gray-200"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Container (Portal) ───────────────────────────────────────────────────────

export type NotificationPosition =
  | "top-right"
  | "top-left"
  | "top-center"
  | "bottom-right"
  | "bottom-left"
  | "bottom-center";

const POSITION_CLASSES: Record<NotificationPosition, string> = {
  "top-right": "top-4 right-4 items-end",
  "top-left": "top-4 left-4 items-start",
  "top-center": "top-4 left-1/2 -translate-x-1/2 items-center",
  "bottom-right": "bottom-4 right-4 items-end flex-col-reverse",
  "bottom-left": "bottom-4 left-4 items-start flex-col-reverse",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 items-center flex-col-reverse",
};

interface NotificationContainerProps {
  position?: NotificationPosition;
}

export function NotificationContainer({
  position = "top-right",
}: NotificationContainerProps) {
  const { notifications } = useNotification();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div
      aria-label="Notifications"
      className={cn(
        "pointer-events-none fixed z-[9999] flex w-full max-w-sm flex-col gap-2 px-4",
        POSITION_CLASSES[position]
      )}
    >
      {notifications.map((n) => (
        <div key={n.id} className="pointer-events-auto w-full">
          <ToastItem notification={n} />
        </div>
      ))}
    </div>,
    document.body
  );
}
