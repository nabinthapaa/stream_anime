// animeheaven has no page listing every tag, so expose the common ones.
// Each id is usable as `tags.php?tag=<id>`.
const GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Isekai", "Mecha", "Music",
  "Mystery", "Psychological", "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Thriller",
];

export async function getAllGenres() {
  let genres = GENRES.map((genre) => ({ id: genre, genre }));
  return { totalGenres: genres.length, genres };
}
