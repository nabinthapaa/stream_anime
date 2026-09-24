import Link from "next/link";
import { MobileTabBar, NavLinks } from "./nav/NavLinks";
import { NavShell } from "./nav/NavShell";
import { SearchToggle } from "./nav/SearchToggle";

export default function Nav() {
  return (
    <>
      <NavShell>
        <Link
          href="/"
          className="mr-2 shrink-0 rounded-sm text-2xl font-black tracking-tight text-accent uppercase md:text-[1.75rem] lg:mr-4"
          aria-label="Anime 101 home"
        >
          Anime<span className="text-white">101</span>
        </Link>
        <NavLinks />
        <div className="ml-auto flex items-center">
          <SearchToggle />
        </div>
      </NavShell>
      <MobileTabBar />
    </>
  );
}
