import { scrapeCard } from "@/scrapper/scrapeCard";
import axios from "axios";
import * as cheerio from "cheerio";

export async function GET() {
    try{
        let url = "https://goone.pro/streaming.php?id=MjE1MTkw&title=Shangri-La+Frontier%3A+Kusoge+Hunter%2C+Kamige+ni+Idoman+to+su+Episode+7"
        let { data } = await axios.get(url);
        /* console.log(typeof data)
        let $ = cheerio.load(String(data));
        //@ts-ignore
        let arr = scrapeCard($('.page_content').html()); */
        return new Response(JSON.stringify(data), { status: 400 });
    }catch(e:any){
        console.log(e)
        return new Response(JSON.stringify({message: e.message}), {status: 404});
    }
}
