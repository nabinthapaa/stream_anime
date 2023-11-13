import { NextApiRequest, NextApiResponse } from "next";
import { getAllGenres } from "@/scrapper";

export async function GET(req: NextApiRequest, res: NextApiResponse){
    try{
        let response = await getAllGenres();
        return new Response(JSON.stringify(response), {status: 200});
    }catch(e){
        console.log(e)
        return new Response(JSON.stringify({message: e.message}), {status:500});
    }
}
