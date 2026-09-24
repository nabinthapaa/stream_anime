import { GetInfo } from "@/scrapper";
import { URLParser } from "@/utils";
import axios from "axios";
import { NextRequest } from "next/server";
import { query } from "./Query";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = new URLParser(req.url);
    const id = url.getParam("id");
    const type = url.getParam("type") || "ANIME";
    if (!id) throw new Error('Please Provide "id"');
    let response = await GetInfo(id);
    try {
      // Titles match AniList far better than slugs ("one-piece" finds a music video)
      const search = response.name || response.ep_id?.replace("-dub", "");
      const variables = { search, type };
      if (!search) throw new Error();
      const anilist_endpoint = "https://graphql.anilist.co";
      const anilist_response = await axios.post(anilist_endpoint, {
        query,
        variables,
      });
      const more_info = anilist_response.data;
      const {
        description,
        coverImage: { extraLarge },
      } = more_info.data.Media;
      response = {
        ...response,
        ...more_info.data.Media,
        plot: description,
        poster: extraLarge,
      };
      //@ts-ignore
      delete response.description;
      return new Response(JSON.stringify(response), {
        status: 200,
      });
    } catch (e) {
      return new Response(JSON.stringify(response), {
        status: 200,
      });
    }
  } catch (e: any) {
    return new Response(
      JSON.stringify({
        message: e.message,
        status: 500,
      }),
      { status: 500 },
    );
  }
}
