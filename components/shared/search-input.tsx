"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LoaderCircle, Search, X } from "lucide-react";
import { useDebouncedValue } from "../../hooks/use-debounced-value";
import { useHotkey } from "../../hooks/use-hotkey";
import { useUrlState } from "../../hooks/use-url-state";

interface SearchInputProps {
  initialQuery?: string;
}

export function SearchInput({ initialQuery = "" }: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(initialQuery);
  const debouncedDraft = useDebouncedValue(draft, 300);
  const urlState = useUrlState();

  useEffect(() => {
    // Props synchronize browser navigation with the controlled draft.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(initialQuery);
  }, [initialQuery]);

  const applySearch = useCallback(
    (value: string) => {
      urlState.replace(
        { q: value.trim() ? value.trim() : null },
        { resetPage: true, scroll: false },
      );
    },
    [urlState],
  );

  useEffect(() => {
    if (debouncedDraft !== initialQuery) {
      applySearch(debouncedDraft);
    }
  }, [applySearch, debouncedDraft, initialQuery]);

  const focusSearch = useCallback(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  useHotkey(["meta+k", "ctrl+k"], focusSearch);

  const clearSearch = useCallback(() => {
    setDraft("");
    applySearch("");
  }, [applySearch]);

  const pending = draft !== debouncedDraft;

  return (
    <div className="relative max-w-md">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
      />
      <input
        ref={inputRef}
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            applySearch(draft);
          }
          if (event.key === "Escape") {
            event.preventDefault();
            clearSearch();
          }
        }}
        aria-label="Cari tender"
        placeholder="Cari tender..."
        className="h-10 pl-9 pr-20"
      />
      <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
        {pending ? (
          <LoaderCircle
            aria-label="Mencari"
            className="size-4 animate-spin text-zinc-500"
          />
        ) : null}
        {draft ? (
          <button
            type="button"
            aria-label="Hapus pencarian"
            onClick={clearSearch}
            className="rounded-sm p-1 text-zinc-500 outline-none hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-950"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
