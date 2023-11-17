export interface InfoData {
  movie_id?: string;
  gogo_id?: string;
  name?: string;
  isDubbed?: boolean;
  genres?: string[];
  type?: "ANIME";
  totalEpisodes?: number;
  status?: "RELEASING" | "ENDED" | "NOT_YET_RELEASED" | "CANCELLED";
  releasedOn?: string; // Assuming 'releasedOn' is a date string, adjust accordingly
  otherNames?: string[];
  poster?: string;
  plot?: string;
  ep_id?: string;
  id?: number;
  idMal?: number;
  coverImage?: {
    extraLarge?: string;
    large?: string;
    medium?: string;
    color?: string;
  };
  bannerImage?: string;
  title?: {
    romaji?: string;
    english?: string;
    native?: string;
  };
  startDate?: {
    year?: number;
    month?: number;
    day?: number;
  };
  endDate?: {
    year?: number;
    month?: number;
    day?: number;
  };
  season?: "WINTER" | "SPRING" | "SUMMER" | "FALL";
  seasonYear?: number;
  format?: "TV" | "MOVIE" | "OVA" | "ONA" | "SPECIAL" | "MUSIC";
  episodes?: number;
  duration?: number;
  isAdult?: boolean;
  hashtag?: string;
  siteUrl?: string;
  averageScore?: number;
  popularity?: number;
  source?:
    | "ORIGINAL"
    | "MANGA"
    | "LIGHT_NOVEL"
    | "VISUAL_NOVEL"
    | "VIDEO_GAME"
    | "OTHER"
    | "NOVEL"
    | "DONGHUA"
    | "UNKNOWN";
  countryOfOrigin?: string;
  isLicensed?: boolean;
}
