export default function Nav() {
  return (
    <div className="grid grid-cols-[1fr,2fr,1fr] py-4 bg-green-400 dark:bg-gray-800 dark:border-b-2 dark:border-gray-500">
      <div>
        <a
          className="font-bold px-20 self-start place-self-center text-2xl"
          href="/"
        >
          Anime 101
        </a>
      </div>
      <form
        action="/search"
        className="place-self-center flex align-center border-2 w-96 border-gray-600 outline-none focus:border-0"
      >
        <input
          type="text"
          id="q"
          name="q"
          placeholder="Search"
          className="bg-transparent px-4 py-2 flex-1 focus:outline-[1px] focus:outline-red-200 border-none outline-none "
        />
        <button type="submit" className="text-center px-4 py-2 bg-gray-600 ">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </button>
      </form>
      <nav className="place-self-end px-[7rem]">
        <ul className="flex gap-10 ">
          <li>
            <a className="text-lg font-md" href="/">
              Home
            </a>
          </li>
          <li>
            <a className="text-lg font-md" href="/recent">
              Recent
            </a>
          </li>
          <li>
            <a className="text-lg font-md" href="/popular">
              Popular
            </a>
          </li>
          <li>
            <a className="text-lg font-md" href="/movies">
              Movies
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}
