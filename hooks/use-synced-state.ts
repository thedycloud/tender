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
    // External URL state intentionally synchronizes the local Select value.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(externalValue);
  }, [externalValue]);

  return [state, setState] as const;
}
