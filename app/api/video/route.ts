import { NextRequest } from "next/server";

// AnimeHeaven's video hosts reject cross-site requests (Sec-Fetch-Site fails),
// so the browser can never play them directly from this app. Proxying through
// our own origin makes the browser see a same-origin request while the server
// streams the upstream MP4.

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const COPY_HEADERS = [
  "content-type",
  "content-length",
  "content-range",
  "accept-ranges",
  "cache-control",
  "etag",
  "last-modified",
];

export async function GET(req: NextRequest) {
  let src = new URL(req.url).searchParams.get("src");
  if (!src) return Response.json({ message: "src is required" }, { status: 400 });

  let target: URL;
  try {
    target = new URL(src);
  } catch {
    return Response.json({ message: "Invalid src" }, { status: 400 });
  }
  if (target.protocol !== "https:" || !target.hostname.endsWith(".animeheaven.me")) {
    return Response.json({ message: "src must be an animeheaven.me video" }, { status: 400 });
  }

  let headers: Record<string, string> = {
    "User-Agent": UA,
    Accept: "*/*",
  };
  let range = req.headers.get("range");
  if (range) headers.Range = range;

  try {
    let upstream = await fetch(target.href, {
      headers,
      signal: AbortSignal.timeout(20000),
      cache: "no-store",
    });
    if (!upstream.ok || !upstream.body) {
      return new Response(await upstream.text(), { status: upstream.status });
    }
    let responseHeaders = new Headers();
    for (let name of COPY_HEADERS) {
      let value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    responseHeaders.set("Accept-Ranges", "bytes");
    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch (e: any) {
    return Response.json({ message: "Proxy failed: " + (e?.message ?? e) }, { status: 502 });
  }
}