import * as cheerio from "cheerio";

interface Recent{
    [key: string]: string | undefined | boolean
}

export function scrapeCard(li: cheerio.AnyNode, search = false){
        let $ = cheerio.load(li)
        let all_recent_episodes: Recent[] = [];
        $('.items li').each((_, el) =>{
            let img = $(el).find('.img [src]').attr("src") === "https://gogotaku.info/img/background.jpg" ? $(el).find('.img [src]').attr('data-original') : $(el).find('.img [src]').attr('src');
            let name = $(el).find('.name').text().trim();
            let episode = $(el).find('.episode').text().replace(/.*\//, '');
            let ep_id = $(el).find('.name [href]').attr('href')?.replace(/.*\//, "");
            let id = $(el).find('.name [href]').attr('href')?.replace(/.*\//, '').replace(/-episode-\d+$/, '');
            let date = $(el).find(".released").text().replace(/.*:\s/, "").trim();
            let anime = !search
                ? {
                    id,
                    ep_id,
                    name,
                    episode,
                    img
                }
                : {
                    id,
                    name: name.replace("(Dub)", ""),
                    date,
                    img,
                    isDub: name.includes("(Dub)")
                };
            all_recent_episodes.push(anime);
        });
        return all_recent_episodes;
}
