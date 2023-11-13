import Image from "next/image"

export default function Nav(){
    return(
        <div className="grid grid-cols-2 py-4 bg-green-400">
            <div>
                <a className="font-bold px-20 self-start text-2xl" href="/">Anime 101</a>
            </div>
            <nav className="place-self-end px-[7rem]">
                <ul className="flex gap-10 ">
                    <li><a className="text-lg font-md" href="/">Home</a></li>
                    <li><a className="text-lg font-md" href="/recent">Recent</a></li>
                    <li><a className="text-lg font-md"  href="/popular">Popular</a></li>
                    <li><a  className="text-lg font-md" href="/movies">Movies</a></li>
                </ul>
            </nav>
        </div>
    )
}
