import { getMovies } from "@/scrapper";
import { URLParser } from "@/utils";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    let parser = new URLParser(req.url);
    // The movies page sends its filters as a JSON body; the query string also works
    let body = await req.json().catch(() => ({}));
    let page = String(body.page ?? parser.getParam("page") ?? "1");
    let aph = String(body.aph ?? parser.getParam("aph") ?? "");
    let response = await getMovies(aph, page);
    return new Response(JSON.stringify(response), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ message: e.message }), {
      status: 404,
    });
  }
}
