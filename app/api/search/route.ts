import { search } from "@/scrapper";
import { NextApiRequest, NextApiResponse } from "next";

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log(req.url + "\t" + req.method + "\t" + req.statusCode);
    const url = req.url ? new URL(req.url) : null;
    if (url === null) return;
    let name = url.searchParams.get("q") as string;
    let page = Number(url.searchParams.get("page")) || 1;
    let response = await search(name, page);
    return new Response(JSON.stringify(response), {
      status: 200,
    });
  } catch (e) {
    console.log(e);
  }
}
