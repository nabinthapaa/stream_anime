"use client";
export default function error({error} :{error: Error & { digest?: string }}) {
  return <div>{error.message}</div>;
}
