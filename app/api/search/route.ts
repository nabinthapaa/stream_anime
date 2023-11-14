import { search } from "@/scrapper";
import { URLParser } from "@/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    let parser = new URLParser(req.url);
    let name = parser.getParam("q") as string;
    let page = Number(parser.getParam("page")) || 1;
    if (!name) name = "naruto";
    let response = await search(name, page);
    return new Response(JSON.stringify(response), {
      status: 200,
    });
  } catch (e: any) {
    console.log(e);
    return new Response(JSON.stringify({ message: e.message }), {
      status: 500,
    });
  }
}
