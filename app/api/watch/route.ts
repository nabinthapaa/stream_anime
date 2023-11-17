import { getLink } from "@/scrapper";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export interface Links {
  movie_id: string | undefined;
  alias_name: string | undefined;
  links: {
    [key: string]: string | undefined;
  };
  download: string;
  videos: {
    url: string;
    isM3U8: boolean;
    quality: string;
  }[];
}

async function getVideo(link: string | undefined) {
  try {
    if (!link) return;
    let videoId = link.replace(/.*e\//, "");
    let url = `https://api.streamwish.com/api/file/direct_link?key=${process.env.STREAMWISH_API_KEY}&file_code=${videoId}`;
    if (link.includes("alions")) {
      videoId = link.replace(/.*v\//, "");
      url = `https://api.filelions.com/api/file/direct_link?key=${process.env.FILELIONS_API_KEY}&file_code=${videoId}`;

      let { data } = await axios.get(url);
      return { url: data.result.hls_direct };
    }
    let { data } = await axios.get(url);
    return data.result.versions[0];
  } catch (e: any) {
    return { error: "Couldn't get the video" };
  }
}

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    let url = req.url ? new URL(req.url) : null;
    let ep_id = url?.searchParams.get("ep_id");
    if (!ep_id) throw new Error("Episode id is not defined");
    let response: Links = await getLink(ep_id);
    if (!response.videos) {
      if (!response.links)
        throw new Error("No Links found for the given episode");

      if (Object.keys(response.links).includes("filelions")) {
        let video = await getVideo(response.links.filelions);

        if (!video && Object.keys(response.links).includes("streamwish"))
          video = await getVideo(response.links.streamwish);

        return new Response(JSON.stringify({ video, ...response }), {
          status: 200,
        });
      }
      return new Response(JSON.stringify(response), {
        status: 200,
      });
    }
    return new Response(JSON.stringify(response), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ message: e.message, status: 500 }), {
      status: 500,
    });
  }
}
