"use client";
import { useEffect, useRef, useState } from "react";

export function Plot({ data }: { data: string }) {
  const [showMore, setShowMore] = useState(false);
  const [isOverflowing, setisOverflowing] = useState(true)
  const el = useRef<HTMLParagraphElement | null>(null);
  useEffect(()=>{
    if (el.current) setisOverflowing(checkOverFlow(el.current))
  },[isOverflowing])
  const _ = ["line-clamp-3", "sm:mb-16", "mb-16"];
  return (
    <div className={`w-full ${showMore ? "mb-10 sm:mb-16" : ""}`}>
      <p
        ref={el}
        className={`text-md ${!showMore ? "line-clamp-4" : ""}`}
        dangerouslySetInnerHTML={{ __html: data }}
      >
        {/* {data.replaceAll(/<.*>/g, "")} */}
      </p>
      {isOverflowing && (
        <button
          className="text-xs font-bold bg-gray-200 rounded-lg py-1 px-2 dark:bg-gray-500"
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
