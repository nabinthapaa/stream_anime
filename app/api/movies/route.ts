import { getMovies } from "@/scrapper";
import { URLParser } from "@/utils";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    let parser = new URLParser(req.url);
    let page = parser.getParam("page");
    let aph = parser.getParam("aph");
    if (!page) page = "1";
    if (!aph) aph = "";
    let response = await getMovies(aph, page);
    return new Response(JSON.stringify(response), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ message: e.message }), {
      status: 404,
    });
  }
}
