"use client";

import { useEffect } from "react";

export interface UseHotkeyOptions {
  enabled?: boolean;
  preventDefault?: boolean;
  ctrl?: boolean;
  meta?: boolean;
  alt?: boolean;
  shift?: boolean;
}

function matchesHotkey(event: KeyboardEvent, hotkey: string, options: UseHotkeyOptions) {
  const normalized = hotkey.trim().toLowerCase();
  const hasModifier = normalized.includes("+");
  const key = normalized.includes("+")
    ? normalized.split("+").pop() ?? ""
    : normalized;

  if (event.key.toLowerCase() !== key && !(key === " " && event.key === " ")) {
    return false;
  }

  const ctrl = normalized.includes("ctrl") || normalized.includes("control") || options.ctrl === true;
  const meta = normalized.includes("meta") || normalized.includes("cmd") || normalized.includes("⌘") || options.meta === true;
  const alt = normalized.includes("alt") || options.alt === true;
  const shift = normalized.includes("shift") || options.shift === true;

  if (!hasModifier && options.ctrl === undefined && options.meta === undefined) {
    return !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey;
  }

  return event.ctrlKey === ctrl && event.metaKey === meta && event.altKey === alt && event.shiftKey === shift;
}

export function useHotkey(
  hotkey: string | string[],
  callback: (event: KeyboardEvent) => void,
  options: UseHotkeyOptions = {},
) {
  useEffect(() => {
    if (options.enabled === false) return;

    const handler = (event: KeyboardEvent) => {
      const keys = Array.isArray(hotkey) ? hotkey : [hotkey];
      if (!keys.some((key) => matchesHotkey(event, key, options))) return;
      if (options.preventDefault !== false) event.preventDefault();
      callback(event);
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [hotkey, callback, options]);
}
