"use client";
import { useRef, useState } from "react";

export function Plot({ data }: { data: string }) {
  const [showMore, setShowMore] = useState(false);
  const el = useRef<HTMLParagraphElement | null>(null);
  const isOverFlowing = checkOverFlow(el.current);
  const _ = ["line-clamp-3"];
  return (
    <div className="w-full  rounded-full ">
      <p ref={el} className={`text-md ${!showMore ? "line-clamp-3" : ""}`}>
        {data}
      </p>
      {isOverFlowing && (
        <button
          className="text-xs font-bold bg-gray-200 rounded-lg py-1 px-2"
          onClick={() => setShowMore(!showMore)}
        >
          Show {!showMore ? "More" : "Less"}
        </button>
      )}
    </div>
  );
}

function checkOverFlow(el: HTMLParagraphElement | null) {
  if (!el) return true;
  let currentheight = el.style.height;
  let currentOverflow = el.style.overflow;
  el.style.height = "70px";
  el.style.overflow = "hidden";
  let isOverflowing = el.clientHeight < el.scrollHeight;
  el.style.height = currentheight;
  el.style.overflow = currentOverflow;
  return isOverflowing;
}
