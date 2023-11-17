import { getMovies } from "@/scrapper";
import { URLParser } from "@/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    let page = req.nextUrl.searchParams.get("page");
    let alph = req.nextUrl.searchParams.get("aph");
    if (!page) page = "1";
    if (!alph) alph = "";
    let response = await getMovies(alph, page);
    return new Response(JSON.stringify(response), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ message: e.message }), {
      status: 404,
    });
  }
}
