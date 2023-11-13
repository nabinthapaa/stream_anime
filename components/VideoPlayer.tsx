"use client";
import Hls from "hls.js";
import Plyr from "plyr";
import "plyr/dist/plyr.css";
import { useEffect, useRef } from "react";

const VideoPlayer = ({ source }: { source: any }) => {
  const PlayerRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const video = PlayerRef.current;
    if (!video) return;
    let defaultOptions: any = {};
    let url;
    if (!source.video) return;
    if (source.video) url = source.video.url;
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const availableQualities = hls.levels.map((level) => level.height);
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
          default: availableQualities[0],
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
    if (source.video) {
      return (
        <video
          className="object-contain h-[100%]"
          ref={PlayerRef}
          id="video"
        ></video>
      );
    } else {
      return (
        <div className="max-h-[75vh] w-[100%]" id="player">
          <iframe
            className="h-[75vh] w-[100%]"
            src={
              source.doodstream ||
              source.mp4upload ||
              source.vidcdn ||
              source.anime
            }
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
