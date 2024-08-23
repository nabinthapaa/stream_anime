"use client";

import { NOT_FOUND_ERROR } from "@/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GotoForm({ id }: { id: string }) {
  let [ep, setEp] = useState("");
  let router = useRouter();
  const handleSubmit = (e: any) => {
    e.preventDefault();
    try {
      router.push(`/watch/${id}-episode-${ep}`);
    } catch (error) {
      throw NOT_FOUND_ERROR;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-x-2">
      <input
        type="text"
        className="px-4 py-2 rounded-lg w-24"
        value={ep}
        onChange={(e) => setEp(e.target.value)}
      />
      <button className="bg-green-300 rounded-lg px-4 py-2">Go</button>
    </form>
  );
}
