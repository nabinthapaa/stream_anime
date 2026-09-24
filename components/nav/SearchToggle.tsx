"use client";

import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from "react";
import { CloseIcon, SearchIcon } from "../ui/icons";

/** Search icon that expands into an input (GET /search?q=...). Full-width overlay on phones. */
export function SearchToggle() {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const close = (restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) requestAnimationFrame(() => toggleRef.current?.focus());
  };

  const onKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Escape") close(true);
  };

  // Collapse when focus leaves the form with nothing typed.
  const onBlur = (e: FocusEvent<HTMLFormElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null) && !inputRef.current?.value) close(false);
  };

  if (!open) {
    return (
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        aria-expanded={false}
        className="grid size-11 place-items-center rounded-full text-white transition-colors duration-200 hover:bg-white/10"
      >
        <SearchIcon className="size-6" />
      </button>
    );
  }

  return (
    <form
      action="/search"
      role="search"
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      className="absolute inset-x-0 top-0 z-10 flex h-nav animate-fade-in items-center gap-2 bg-canvas px-page md:static md:h-auto md:bg-transparent md:px-0"
    >
      <label htmlFor="q" className="sr-only">
        Search titles
      </label>
      <div className="relative flex-1 md:w-64 lg:w-72">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-neutral-400" />
        <input
          ref={inputRef}
          type="search"
          id="q"
          name="q"
          placeholder="Titles, e.g. One Piece"
          autoComplete="off"
          enterKeyHint="search"
          className="h-11 w-full rounded-md bg-black/70 pr-3 pl-10 text-sm text-white ring-1 ring-white/25 transition-shadow outline-hidden focus:ring-white/70 md:h-10 [&::-webkit-search-cancel-button]:hidden"
        />
      </div>
      <button
        type="button"
        onClick={() => close(true)}
        aria-label="Close search"
        className="grid size-11 shrink-0 place-items-center rounded-full text-neutral-300 transition-colors duration-200 hover:bg-white/10 hover:text-white"
      >
        <CloseIcon className="size-5" />
      </button>
    </form>
  );
}
