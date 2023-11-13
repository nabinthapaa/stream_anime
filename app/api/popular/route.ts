import { getAllTimePopular } from "@/scrapper/getAllTimePopular";
import { URLParser } from "@/utils";
import { NextApiRequest, NextApiResponse } from "next";

export async function GET(req: NextApiRequest, res: NextApiResponse){
    try{
        let parser = new URLParser(req.url);
        let page = parser.getParam("page");
        if ( !page ) page = "1";
        let response = await getAllTimePopular(page);
        return new Response(JSON.stringify(response), {status: 200});
    }catch(e:any){
        return new Response(JSON.stringify({message: e.message}), {status: 404});
    }
}
