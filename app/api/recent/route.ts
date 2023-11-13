import { NextApiRequest, NextApiResponse } from "next";
import { getRecent } from "@/scrapper";

const INTERNAL_ERROR = new Error("Something Went Wrong. Please Check your Request");
const TYPE = {
    SUB: 1,
    DUB: 2,
    CHINESE: 3,
}

export async function GET(req: NextApiRequest, res: NextApiResponse){
    try{
        if (!req.url) throw INTERNAL_ERROR;
        let url = new URL(req.url);
        if (!url) throw INTERNAL_ERROR;
        let type = url.searchParams.get("type");
        let tp = TYPE.SUB;
        let page  = url.searchParams.get("page");
        //@ts-ignore
        if(type) tp = TYPE[type];
        if (!page) page = "1";
        let response = await getRecent(page, tp);
        return new Response(JSON.stringify(response), {status:200});
    }catch(e: any){
        return new Response(JSON.stringify({message: e.message }) ,{ status: 500 });
    }
}
