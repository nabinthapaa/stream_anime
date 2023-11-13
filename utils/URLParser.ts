import { INTERNAL_ERROR } from ".";

export class URLParser {
  private url: string;

  constructor(url: string | undefined){
      if(!url) throw INTERNAL_ERROR;
    this.url = url;
  }

  getParam(query: string): string | null {
    try {
      const url = new URL(this.url);
      return url.searchParams.get(query);
    } catch (error) {
      return null;
    }
  }
}
