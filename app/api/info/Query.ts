export const query = `
  query GetMedia($search: String) {
    Media(search: $search, type: ANIME) {
      id
      idMal
      description(asHtml: false)
      coverImage {
        extraLarge
        large
        medium
        color
      }
      bannerImage
      title {
        romaji
        english
        native
      }
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      genres
      season
      seasonYear
      type
      format
      status
      episodes
      duration
      isAdult
      genres
      hashtag
      siteUrl
      averageScore
      popularity
      source
      countryOfOrigin
      isLicensed
      source
    }
  }
`;
