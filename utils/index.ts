import { URLParser } from "./URLParser";

export const INTERNAL_ERROR = new Error("Something went wrong");
export const NOT_FOUND_ERROR = new Error("Request Anime not Found");
export const HOSTNAME = process.env.NEXT_PUBLIC_HOSTNAME;

export { URLParser };
