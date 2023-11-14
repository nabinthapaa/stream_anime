
import * as cheerio from "cheerio";
import axios from "axios";
export async function getLink(ep_id: string){
    try{
        let url_str = `https://gogoanimehd.io/${ep_id}`;
        let response = await axios.get(url_str);
        let $ = cheerio.load(response.data);
        let Links = new Map();
        $(".anime_muti_link ul li").each((_, el) => {
            let link1 = $(el).find('a');
            let server_name = $(el).attr('class');
            let server_link = link1.attr('data-video');
           Links.set(server_name, server_link);
        });
        return Object.fromEntries(Links);
    }catch(e:any){
        return new Response(JSON.stringify(e), {status:400});
    }
}
