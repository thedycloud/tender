"use client";

import {
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

export function useSyncedState<T>(
  externalValue: T,
): readonly [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(externalValue);

  useEffect(() => {
    setState(externalValue);
  }, [externalValue]);

  return [state, setState] as const;
}
