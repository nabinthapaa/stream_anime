"use client";

import { NOT_FOUND_ERROR } from "@/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** Jump straight to an episode number (used when the source doesn't list its episodes). */
export default function GotoForm({ id }: { id: string }) {
  let [ep, setEp] = useState("");
  let router = useRouter();
  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!ep) return;
    try {
      router.push(`/watch/${id}-episode-${ep}`);
    } catch (error) {
      throw NOT_FOUND_ERROR;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <label htmlFor="goto-episode" className="text-sm text-neutral-400">
        Jump to episode
      </label>
      <input
        id="goto-episode"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="#"
        className="h-11 w-20 rounded-md bg-surface-raised px-3 text-center text-sm text-white tabular-nums ring-1 ring-white/10 outline-hidden focus:ring-accent sm:h-9"
        value={ep}
        onChange={(e) => setEp(e.target.value.replace(/\D/g, ""))}
      />
      <button className="h-11 rounded-md bg-white/10 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/20 sm:h-9">
        Go
      </button>
    </form>
  );
}
