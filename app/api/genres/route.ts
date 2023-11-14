import { getAllGenres } from "@/scrapper";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    let response = await getAllGenres();
    return new Response(JSON.stringify(response), { status: 200 });
  } catch (e) {
    console.log(e);
    return new Response(JSON.stringify({ message: e.message }), {
      status: 500,
    });
  }
}
