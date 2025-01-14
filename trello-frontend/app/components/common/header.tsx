'use client';

import Image from 'next/image';
import Link from 'next/link';

const Header = () => {
 
  return (
    <header className="bg-[url(/header-bg.jpg)] shadow">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
        <Link href="/" className="-m-1.5 flex items-center gap-2 p-1.5">
          <Image
            src="/logo.jpg"
            className="h-10 w-auto"
            alt="joyboard logo"
            width={30}
            height={30}
          />
          <span className="text-xl font-bold">JoyBoard</span>
        </Link>

      </nav>
    </header>
  );
};

export default Header;
