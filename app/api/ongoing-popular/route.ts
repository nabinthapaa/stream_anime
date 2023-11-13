import { NextApiRequest, NextApiResponse } from "next";
import { URLParser } from "@/utils";
import { getOngoingPopular} from '@/scrapper'

export async function GET(req: NextApiRequest, res: NextApiResponse){
    try{
        let parser = new URLParser(req.url);
        let page = parser.getParam("page");
        if(!page) page = "1";
        let response = await getOngoingPopular(page);
        return new Response(JSON.stringify(response), {status: 200});

    }catch(e: any){
        return new Response(JSON.stringify({message: e.message}), {status: 500});
    }
}
