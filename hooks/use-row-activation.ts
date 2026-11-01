"use client";

import { useRouter } from "next/navigation";
import type { KeyboardEvent, MouseEvent } from "react";

export interface RowActivationOptions {
  id: string;
  href: string;
}

export function useRowActivation({ href }: RowActivationOptions) {
  const router = useRouter();

  const activate = () => {
    router.push(href);
  };

  const onClick = (_event: MouseEvent<HTMLElement>) => {
    activate();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activate();
    }
  };

  return { activate, onClick, onKeyDown };
}
