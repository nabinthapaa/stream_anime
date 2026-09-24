import { getAllGenres } from "@/scrapper";
import { NextRequest } from "next/server";

// GET route handlers were statically cached by default before Next 15; keep that behavior.
export const dynamic = "force-static";

export async function GET(req: NextRequest) {
  try {
    let response = await getAllGenres();
    return new Response(JSON.stringify(response), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ message: e.message }), {
      status: 500,
    });
  }
}
