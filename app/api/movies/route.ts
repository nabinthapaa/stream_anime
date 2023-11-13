import { getMovies } from "@/scrapper"
import { URLParser } from "@/utils";
import { NextApiRequest, NextApiResponse } from "next";

export async function GET(req: NextApiRequest, res: NextApiResponse){
    try{
        let parser = new URLParser(req.url);
        let page = parser.getParam("page");
        let alph = parser.getParam("aph")?.toUpperCase();
        if(!page) page = "1";
        if(!alph) alph = "";
        let response = await getMovies(alph, page);
        return new Response(JSON.stringify(response), {status: 200});
    }catch(e: any){
        return new Response(JSON.stringify({message: e.message}), {status: 4044})
    }
}
