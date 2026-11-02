"use client";

import { useRouter } from "next/navigation";
import type { KeyboardEvent } from "react";

export interface RowActivationOptions {
  id: string;
  href: string;
}

export function useRowActivation({ href }: RowActivationOptions) {
  const router = useRouter();

  const activate = () => {
    router.push(href);
  };

  const onClick = () => {
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
