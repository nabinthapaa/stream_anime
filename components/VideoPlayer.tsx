"use client";
import { Links } from "@/app/api/watch/route";
import Hls from "hls.js";
import Plyr from "plyr";
import "plyr/dist/plyr.css";
import { useEffect, useRef } from "react";

//TODO: Select Server

interface Source extends Links {
  video?: {
    url: string;
  };
  videos: {
    url: string;
    isM3U8: boolean;
    quality: string;
  }[];
}

const VideoPlayer = ({ source }: { source: Source }) => {
  const PlayerRef = useRef<HTMLVideoElement | null>(null);
  let { doodstream, mp4upload, vidcdn, anime } = source.links;
  useEffect(() => {
    const video = PlayerRef.current;
    if (!video) return;
    let defaultOptions: any = {};
    let url = "";
    if (source.videos) {
      url = source.videos.filter((e) => e.quality === "default")[0].url;
    }
    if (!url) {
      if (!source.video) return;
      if (source.video) url = source.video.url;
    }
    console.log(url);
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const availableQualities = hls.levels.map((level) => level.height);
        console.log(availableQualities);
        defaultOptions.controls = [
          "play-large",
          "restart",
          "rewind",
          "play",
          "fast-forward",
          "progress",
          "current-time",
          "duration",
          "mute",
          "volume",
          "captions",
          "settings",
          "pip",
          "airplay",
          "fullscreen",
        ];
        defaultOptions.quality = {
          default: availableQualities[availableQualities.length - 1],
          options: availableQualities,
          forced: true,
          //@ts-ignore
          onChange: (e) => updateQuality(e),
        };
        new Plyr(video, defaultOptions);
      });
      hls.attachMedia(video);
      //@ts-ignore
      window.hls = hls;
    }

    //@ts-ignore
    function updateQuality(newQuality) {
      //@ts-ignore
      window.hls.levels.forEach((level: any, levelIndex: any) => {
        if (level.height === newQuality) {
          //@ts-ignore
          window.hls.currentLevel = levelIndex;
        }
      });
    }
  }, [source]);

  function renderVideo() {
    if (source.videos) {
      return (
        <video
          className="object-contain h-[100%]"
          ref={PlayerRef}
          id="video"
        ></video>
      );
    } else if (source.video) {
      return (
        <video
          className="object-contain h-[100%]"
          ref={PlayerRef}
          id="video"
        ></video>
      );
    }

    {
      return (
        <div className="max-h-[75vh] w-[100%]" id="player">
          <iframe
            className="h-[75vh] w-[100%]"
            src={doodstream || mp4upload || vidcdn || anime}
            allowFullScreen
            allow="autoplay"
          />
        </div>
      );
    }
  }

  return renderVideo();
};

export default VideoPlayer;
